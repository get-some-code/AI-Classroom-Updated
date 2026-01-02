"""
Preply - AI-Powered Exam Pack Generator Backend
Quota-safe, production-grade backend (updated)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import google.generativeai as genai
import whisper
import os
import tempfile
import uuid
from datetime import datetime
import re
import asyncio
import json
from dotenv import load_dotenv

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

from auth import get_current_user
from fastapi import Depends

# --------------------------------------------------
# APP SETUP
# --------------------------------------------------

app = FastAPI(title="Preply API", version="3.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# ENV + MODELS
# --------------------------------------------------

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    # Fallback for dev environments if needed, but warning is better
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Configure GenAI only if key is present to avoid immediate crash on import
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash-lite")
else:
    gemini_model = None

gemini_lock = asyncio.Lock()

# Lazy-loaded Whisper model
whisper_model: Optional[object] = None

# Embedding + vector DB
# We use a lightweight model for speed/memory efficiency
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
qdrant_client = QdrantClient(":memory:")

# In-memory stores (replace with persistent DB in production)
# Structure:
# sessions[id] = {
#    "transcript": str,
#    "cleaned": str,
#    "created_at": str,
#    "chat_history": List[Dict[str, str]]  <-- NEW: Stores conversation context
# }
sessions: Dict[str, dict] = {}

# generation_cache[id] = { "summary": ..., "questions": ... }
generation_cache: Dict[str, dict] = {}

# --------------------------------------------------
# SCHEMAS
# --------------------------------------------------

class TranscriptRequest(BaseModel):
    transcript: str

class ChatMessage(BaseModel):
    session_id: str
    question: str

# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def clean_transcript(text: str) -> str:
    """Simple cleaning: collapse whitespace, remove filler words."""
    text = re.sub(r"\s+", " ", text or "")
    for w in ["um", "uh", "er", "ah", "like", "you know"]:
        text = re.sub(rf"\b{w}\b", "", text, flags=re.I)
    return text.strip()

def chunk_transcript(text: str, size: int = 250) -> List[str]:
    """Chunking text for vector embedding."""
    words = text.split()
    if not words:
        return []
    # Overlap slightly for better context continuity (optional but good practice)
    overlap = 20
    chunks = []
    for i in range(0, len(words), size - overlap):
        chunk = " ".join(words[i:i + size])
        chunks.append(chunk)
        if i + size >= len(words):
            break
    return chunks

def create_vector_collection(session_id: str, transcript: str):
    """Create collection for a session and upsert chunk vectors."""
    if not transcript:
        return

    collection = f"session_{session_id}"
    try:
        # Check if exists (throws if not)
        qdrant_client.get_collection(collection_name=collection)
    except Exception:
        qdrant_client.create_collection(
            collection_name=collection,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

    chunks = chunk_transcript(transcript)
    points = []
    for idx, chunk in enumerate(chunks):
        vec = embedding_model.encode(chunk).tolist()
        points.append(PointStruct(id=idx, vector=vec, payload={"text": chunk}))
    
    if points:
        qdrant_client.upsert(collection_name=collection, points=points)

def safe_search_similar_chunks(session_id: str, query: str, k: int = 4) -> List[str]:
    """Wrap qdrant search."""
    collection = f"session_{session_id}"
    try:
        vec = embedding_model.encode(query).tolist()
        results = qdrant_client.search(collection_name=collection, query_vector=vec, limit=k)
        return [r.payload.get("text", "") for r in results if r.score > 0.3] # Score threshold
    except Exception:
        return []

async def generate_gemini(prompt: str, max_tokens: int = 2048, temperature: float = 0.6) -> str:
    """Single place to call Gemini with a simple retry on rate-limit."""
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    async with gemini_lock:
        # up to 3 tries for transient 429
        for attempt in range(3):
            try:
                res = gemini_model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=temperature,
                    ),
                )
                if hasattr(res, "text"):
                    return res.text
                return str(res)
            except Exception as e:
                msg = str(e)
                if "429" in msg or "Quota exceeded" in msg:
                    if attempt < 2:
                        await asyncio.sleep(2 + attempt * 2)
                        continue
                raise HTTPException(status_code=500, detail=f"Gemini error: {msg}")
        raise HTTPException(status_code=500, detail="Gemini failed after retries")

# --------------------------------------------------
# MCQ NORMALIZER
# --------------------------------------------------

def _map_index_to_label(i: int) -> Optional[str]:
    if i < 0: return None
    labels = ["A", "B", "C", "D"]
    return labels[i] if i < len(labels) else None

def normalize_mcq_list(mcqs: List[dict]) -> List[dict]:
    """Guarantees options are {A,B,C,D} and correct_answer is a valid label."""
    normalized = []
    for q in (mcqs or []):
        if not isinstance(q, dict): continue

        question_text = q.get("question") or q.get("prompt") or ""
        if not question_text: continue

        raw_opts = q.get("options", {})
        opts: Dict[str, str] = {}

        # If list, map to A/B/C/D
        if isinstance(raw_opts, list):
            for i, val in enumerate(raw_opts[:4]):
                label = _map_index_to_label(i)
                if label: opts[label] = val
        elif isinstance(raw_opts, dict):
            for k, v in raw_opts.items():
                k_clean = str(k).strip().upper()
                # If key is 0/1/2/3, map to A/B/C/D, else keep letter
                if k_clean.isdigit():
                    lbl = _map_index_to_label(int(k_clean))
                    if lbl: opts[lbl] = v
                elif len(k_clean) == 1 and k_clean.isalpha():
                    opts[k_clean] = v
                else:
                    opts[k_clean[:1]] = v # Fallback taking first char

        # Determine correct answer
        correct = q.get("correct_answer") or q.get("answer") or q.get("key") or q.get("correct")
        chosen_label = None

        if isinstance(correct, str):
            c = correct.strip().upper()
            if len(c) == 1 and c in opts:
                chosen_label = c
            else:
                # Text matching
                for label, text in opts.items():
                    if text and str(correct).lower() in str(text).lower():
                        chosen_label = label
                        break
        elif isinstance(correct, int):
            chosen_label = _map_index_to_label(correct)

        # Fallback to "answer" field
        if not chosen_label and "answer" in q:
             a = q["answer"]
             if isinstance(a, int): chosen_label = _map_index_to_label(a)
             elif isinstance(a, str) and a.isdigit(): chosen_label = _map_index_to_label(int(a))

        if not chosen_label or chosen_label not in opts:
            continue

        normalized.append({
            "question": question_text,
            "options": opts,
            "correct_answer": chosen_label,
            "explanation": q.get("explanation") or q.get("explain") or ""
        })

    return normalized

# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.post("/api/upload-audio")
async def upload_audio(file: UploadFile = File(...), user: Any = Depends(get_current_user)):
    global whisper_model
    if not file.filename.lower().endswith((".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    if whisper_model is None:
        whisper_model = whisper.load_model("base")

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = whisper_model.transcribe(tmp_path)
        raw_text = result.get("text", "") if isinstance(result, dict) else str(result)
        cleaned = clean_transcript(raw_text)
        session_id = str(uuid.uuid4())
        
        # Init session with chat history
        sessions[session_id] = {
            "transcript": raw_text,
            "cleaned": cleaned,
            "created_at": datetime.now().isoformat(),
            "chat_history": [] 
        }
        
        create_vector_collection(session_id, cleaned)
        return {"session_id": session_id, "transcript": raw_text, "cleaned_transcript": cleaned}
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

@app.post("/api/upload-transcript")
async def upload_transcript(req: TranscriptRequest, user: Any = Depends(get_current_user)):
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript empty")

    raw = req.transcript
    cleaned = clean_transcript(raw)
    session_id = str(uuid.uuid4())
    
    sessions[session_id] = {
        "transcript": raw,
        "cleaned": cleaned,
        "created_at": datetime.now().isoformat(),
        "chat_history": []
    }
    
    create_vector_collection(session_id, cleaned)
    return {"session_id": session_id, "transcript": raw, "cleaned_transcript": cleaned}

@app.get("/api/generate-exam-pack/{session_id}")
async def generate_exam_pack(session_id: str, user: Any = Depends(get_current_user)):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_id in generation_cache:
        return generation_cache[session_id]

    transcript = sessions[session_id]["cleaned"]

    prompt = f"""
You are an expert tutor. Create exam-ready materials from this lecture transcript.
Output valid JSON only.

Requirements:
1. SUMMARY: A nested object with short (1 sentence), medium (1 paragraph), and detailed (bullets) summaries.
2. NOTES: Markdown formatted study notes.
3. QUESTIONS: 
   - 5+ Multiple Choice Questions (keys A,B,C,D; correct_answer A-D).
   - 3 Short Answer Questions.
   - 2 Long Answer Questions (Essay style) with key points.

Output Format:
{{
  "summary": {{ "short_summary": "...", "medium_summary": "...", "detailed_summary": "..." }},
  "notes": "markdown string...",
  "questions": {{
    "mcq_questions": [ {{ "question": "...", "options": {{ "A": "..." }}, "correct_answer": "A", "explanation": "..." }} ],
    "short_answer_questions": [ {{ "question": "...", "suggested_answer": "..." }} ],
    "long_answer_questions": [ {{ "question": "...", "key_points": ["..."] }} ]
  }}
}}

TRANSCRIPT:
{transcript[:25000]} 
""" # Limit transcript length slightly to be safe, though Flash supports much more

    raw = await generate_gemini(prompt, max_tokens=4000)
    
    # Robust JSON parsing
    cleaned_json = raw.replace("```json", "").replace("```", "").strip()
    # Sometimes models return a preamble, try to find the first { and last }
    start = cleaned_json.find("{")
    end = cleaned_json.rfind("}")
    if start != -1 and end != -1:
        cleaned_json = cleaned_json[start:end+1]

    try:
        data = json.loads(cleaned_json)
    except Exception as e:
        # Fallback: attempt to heal or just error
        raise HTTPException(status_code=500, detail=f"Generated invalid JSON: {str(e)}")

    # Normalize MCQs
    questions_block = data.get("questions", {})
    mcqs = normalize_mcq_list(questions_block.get("mcq_questions", []))
    
    data.setdefault("summary", {"short_summary": "Summary unavailable", "medium_summary": "", "detailed_summary": ""})
    data.setdefault("notes", "Notes unavailable")
    data["questions"] = {
        "mcq_questions": mcqs,
        "short_answer_questions": questions_block.get("short_answer_questions", []),
        "long_answer_questions": questions_block.get("long_answer_questions", []),
    }

    generation_cache[session_id] = data
    return data

@app.post("/api/regenerate-questions/{session_id}")
async def regenerate_questions(session_id: str, user: Any = Depends(get_current_user)):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # If cache empty, generate full pack first to ensure we have context/summary logic if needed later
    if session_id not in generation_cache:
        await generate_exam_pack(session_id)

    transcript = sessions[session_id]["cleaned"]

    prompt = f"""
Generate a NEW set of questions (MCQ, Short, Long) based on the transcript.
Return JSON strictly: {{ "mcq_questions": [...], "short_answer_questions": [...], "long_answer_questions": [...] }}
Make sure MCQs use keys A,B,C,D.

Transcript:
{transcript[:20000]}
"""
    raw = await generate_gemini(prompt, max_tokens=2000)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]

    try:
        qdata = json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse regenerated questions")

    mcqs = normalize_mcq_list(qdata.get("mcq_questions", []))
    
    new_questions = {
        "mcq_questions": mcqs,
        "short_answer_questions": qdata.get("short_answer_questions", []),
        "long_answer_questions": qdata.get("long_answer_questions", []),
    }
    
    generation_cache[session_id]["questions"] = new_questions
    return new_questions

@app.post("/api/chatbot")
async def chatbot(req: ChatMessage, user: Any = Depends(get_current_user)):
    """
    Stateful chatbot endpoint.
    Uses: 
    1. Global Summary (if available)
    2. Vector Search Chunks (Specific details)
    3. Conversation History (Context)
    """
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session_data = sessions[req.session_id]
    
    # 1. Retrieve Global Context (Summary)
    summary_context = ""
    if req.session_id in generation_cache:
        s = generation_cache[req.session_id].get("summary", {})
        if isinstance(s, dict):
            summary_context = f"Lecture Summary: {s.get('short_summary', '')}\n{s.get('detailed_summary', '')}"

    # 2. Retrieve Local Context (Vector Search)
    chunks = safe_search_similar_chunks(req.session_id, req.question, k=4)
    vector_context = "\n\n".join(chunks)
    
    # 3. Retrieve Conversation History (Last 6 messages / 3 turns)
    history_list = session_data.get("chat_history", [])
    recent_history = history_list[-6:]
    history_str = ""
    for msg in recent_history:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_str += f"{role}: {msg['content']}\n"

    # 4. Fallback if context is too thin
    # If no summary and no vector results, use first part of transcript
    if not summary_context and not vector_context:
        vector_context = session_data["cleaned"][:4000] # Use first 4k chars as fallback

    # 5. Construct Prompt
    prompt = f"""
You are a helpful Tutor Assistant for a student reviewing a lecture.
Answer the user's question based primarily on the provided context.

CONTEXT FROM LECTURE:
{summary_context}

SPECIFIC EXCERPTS:
{vector_context}

CONVERSATION HISTORY:
{history_str}

USER QUESTION:
{req.question}

INSTRUCTIONS:
- Answer concisely and accurately.
- Use the context to support your answer.
- If the answer isn't in the context, say you don't have that info from the lecture.
- Do not make up facts not present in the lecture material.
"""

    answer = await generate_gemini(prompt, max_tokens=600, temperature=0.5)

    # 6. Update History
    session_data["chat_history"].append({"role": "user", "content": req.question})
    session_data["chat_history"].append({"role": "assistant", "content": answer})
    
    # Heuristic confidence
    confidence = 0.9 if chunks else 0.5
    if len(chunks) > 2: confidence = 0.95

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": chunks[:2]
    }

@app.get("/api/session/{session_id}")
async def get_session(session_id: str, user: Any = Depends(get_current_user)):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session_id,
        "transcript_snippet": sessions[session_id].get("transcript", "")[:200] + "...",
        "created_at": sessions[session_id].get("created_at"),
        "has_cache": session_id in generation_cache,
        "history_count": len(sessions[session_id].get("chat_history", []))
    }

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str, user: Any = Depends(get_current_user)):
    sessions.pop(session_id, None)
    generation_cache.pop(session_id, None)
    try:
        qdrant_client.delete_collection(collection_name=f"session_{session_id}")
    except Exception:
        pass
    return {"message": "deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)