"""
Preply - AI-Powered Exam Pack Generator Backend
Quota-safe, production-grade backend (updated)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
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

# --------------------------------------------------
# APP SETUP
# --------------------------------------------------

app = FastAPI(title="Preply API", version="3.1.0")

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
    raise RuntimeError("GEMINI_API_KEY not set in environment")

genai.configure(api_key=GEMINI_KEY)
gemini_model = genai.GenerativeModel("gemini-2.5-flash-lite")

gemini_lock = asyncio.Lock()

# Lazy-loaded Whisper model
whisper_model: Optional[object] = None

# Embedding + vector DB
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
qdrant_client = QdrantClient(":memory:")

# In-memory stores (replace with persistent DB in production)
sessions: Dict[str, dict] = {}
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

def chunk_transcript(text: str, size: int = 200) -> List[str]:
    words = text.split()
    if not words:
        return []
    return [" ".join(words[i:i + size]) for i in range(0, len(words), size)]

def create_vector_collection(session_id: str, transcript: str):
    """Create collection for a session and upsert chunk vectors."""
    if not transcript:
        return

    collection = f"session_{session_id}"
    # Create collection if not exists
    try:
        qdrant_client.get_collection(collection_name=collection)
        # if exists, we may optionally delete & recreate, but keep existing for now
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

def safe_search_similar_chunks(session_id: str, query: str, k: int = 3) -> List[str]:
    """Wrap qdrant search and return empty list if collection missing or search fails."""
    collection = f"session_{session_id}"
    try:
        vec = embedding_model.encode(query).tolist()
        results = qdrant_client.search(collection_name=collection, query_vector=vec, limit=k)
        return [r.payload.get("text", "") for r in results]
    except Exception:
        # fallback silently to empty list
        return []

async def generate_gemini(prompt: str, max_tokens: int = 2048) -> str:
    """Single place to call Gemini with a simple retry on rate-limit."""
    async with gemini_lock:
        # up to 3 tries for transient 429
        for attempt in range(3):
            try:
                res = gemini_model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=0.6,
                    ),
                )
                # res may be a structured object; return text attribute if present
                if hasattr(res, "text"):
                    return res.text
                # fallback to str()
                return str(res)
            except Exception as e:
                msg = str(e)
                # basic detection for rate-limit; wait and retry once
                if "429" in msg or "Quota exceeded" in msg:
                    if attempt < 2:
                        await asyncio.sleep(7 + attempt * 3)
                        continue
                # non-retryable -> raise
                raise HTTPException(status_code=500, detail=f"Gemini error: {msg}")
        raise HTTPException(status_code=500, detail="Gemini failed after retries")

# --------------------------------------------------
# MCQ NORMALIZER
# --------------------------------------------------

def _map_index_to_label(i: int) -> Optional[str]:
    if i < 0:
        return None
    labels = ["A", "B", "C", "D"]
    return labels[i] if i < len(labels) else None

def normalize_mcq_list(mcqs: List[dict]) -> List[dict]:
    """
    Accepts a list of candidate MCQ dicts returned by the LLM and
    returns a list guaranteed to have options as {A,B,C,D} and a correct_answer label.
    Un-normalizable items are skipped.
    """
    normalized = []
    for q in (mcqs or []):
        if not isinstance(q, dict):
            continue

        question_text = q.get("question") or q.get("prompt") or ""
        if not question_text:
            continue

        raw_opts = q.get("options", {})
        opts: Dict[str, str] = {}

        # If list, map to A/B/C/D
        if isinstance(raw_opts, list):
            for i, val in enumerate(raw_opts[:4]):
                label = _map_index_to_label(i)
                if label:
                    opts[label] = val
        elif isinstance(raw_opts, dict):
            # Normalize keys to uppercase single-letter when possible
            for k, v in raw_opts.items():
                if isinstance(k, str) and len(k.strip()) == 1 and k.strip().isalpha():
                    opts[k.strip().upper()] = v
                else:
                    # if keys are numbers "0","1", map them to letters
                    try:
                        i = int(k)
                        lbl = _map_index_to_label(i)
                        if lbl:
                            opts[lbl] = v
                        else:
                            # otherwise, just keep as-is with uppercase key
                            opts[str(k).upper()] = v
                    except Exception:
                        opts[str(k).upper()] = v
        else:
            # unsupported options shape
            continue

        # attempt to determine correct answer
        correct = q.get("correct_answer") or q.get("answer") or q.get("key") or q.get("correct")
        chosen_label = None

        if isinstance(correct, str):
            c = correct.strip()
            # if letter like A/B/C/D
            if len(c) == 1 and c.upper() in opts:
                chosen_label = c.upper()
            else:
                # try to match by text equality to an option
                for label, text in opts.items():
                    if text and c.lower() == str(text).strip().lower():
                        chosen_label = label
                        break
        elif isinstance(correct, (int, float)):
            chosen_label = _map_index_to_label(int(correct))

        # As a last resort, if there is an 'answer' field providing option index as "1" etc.
        if not chosen_label and isinstance(q.get("answer"), (str, int)):
            a = q.get("answer")
            if isinstance(a, str) and a.isdigit():
                chosen_label = _map_index_to_label(int(a))
            elif isinstance(a, int):
                chosen_label = _map_index_to_label(a)

        # If still not found, skip this MCQ to avoid sending malformed items
        if not chosen_label or chosen_label not in opts:
            continue

        explanation = q.get("explanation") or q.get("explain") or ""
        normalized.append({
            "question": question_text,
            "options": opts,
            "correct_answer": chosen_label,
            "explanation": explanation
        })

    return normalized

# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.post("/api/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """
    Transcribe audio via Whisper, create a session and vector collection,
    and return session_id + transcripts.
    """
    global whisper_model
    # Validate file extension quickly
    if not file.filename.lower().endswith((".mp3", ".wav", ".m4a", ".ogg", ".flac")):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    if whisper_model is None:
        whisper_model = whisper.load_model("base")

    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Transcribe
        result = whisper_model.transcribe(tmp_path)
        raw_text = result.get("text", "") if isinstance(result, dict) else str(result)
        cleaned = clean_transcript(raw_text)
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "transcript": raw_text,
            "cleaned": cleaned,
            "created_at": datetime.now().isoformat(),
        }
        # create vectors
        create_vector_collection(session_id, cleaned)
        return {"session_id": session_id, "transcript": raw_text, "cleaned_transcript": cleaned}
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

@app.post("/api/upload-transcript")
async def upload_transcript(req: TranscriptRequest):
    """Accept raw transcript text, create session and vectors, return session info."""
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript empty")

    raw = req.transcript
    cleaned = clean_transcript(raw)
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "transcript": raw,
        "cleaned": cleaned,
        "created_at": datetime.now().isoformat(),
    }
    create_vector_collection(session_id, cleaned)
    return {"session_id": session_id, "transcript": raw, "cleaned_transcript": cleaned}

@app.get("/api/generate-exam-pack/{session_id}")
async def generate_exam_pack(session_id: str):
    """Single Gemeni call to produce summary, notes, and questions. Results cached per session."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_id in generation_cache:
        return generation_cache[session_id]

    transcript = sessions[session_id]["cleaned"]

    # Strict JSON instruction to minimize formatting issues
    prompt = f"""
You are a helpful assistant that MUST return valid JSON only (no explanation, no markdown).
Create exam-ready materials from the lecture transcript.

Requirements:
- Return a JSON object exactly matching the structure below.
- Generate at least 5 MCQs.
- Every MCQ MUST include options A,B,C,D (as keys) and correct_answer must be one of "A","B","C","D".
- Provide an explanation for each MCQ.

Return this exact JSON shape:

{{
  "summary": {{
    "short_summary": "...",
    "medium_summary": "...",
    "detailed_summary": "..."
  }},
  "notes": "...",
  "questions": {{
    "mcq_questions": [
      {{
        "question": "...",
        "options": {{
          "A": "...",
          "B": "...",
          "C": "...",
          "D": "..."
        }},
        "correct_answer": "A",
        "explanation": "..."
      }}
    ],
    "short_answer_questions": [
      {{
        "question": "...",
        "suggested_answer": "..."
      }}
    ],
    "long_answer_questions": [
      {{
        "question": "...",
        "key_points": ["...","..."]
      }}
    ]
  }}
}}

Transcript:
{transcript}
"""

    raw = await generate_gemini(prompt, max_tokens=3000)

    # Attempt to parse returned JSON robustly
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generated content not valid JSON: {str(e)}")

    # Defensive structure fixes
    questions_block = data.get("questions", {})
    mcqs_raw = questions_block.get("mcq_questions", [])
    mcqs = normalize_mcq_list(mcqs_raw)

    # ensure at least some default arrays exist
    data.setdefault("summary", {"short_summary": "", "medium_summary": "", "detailed_summary": ""})
    data.setdefault("notes", "")
    data["questions"] = {
        "mcq_questions": mcqs,
        "short_answer_questions": questions_block.get("short_answer_questions", []),
        "long_answer_questions": questions_block.get("long_answer_questions", []),
    }

    generation_cache[session_id] = data
    return data

@app.post("/api/regenerate-questions/{session_id}")
async def regenerate_questions(session_id: str):
    """Regenerate only questions for a session (single Gemini call)."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    # Ensure a cache entry exists
    if session_id not in generation_cache:
        # generate full pack first (this populates cache)
        await generate_exam_pack(session_id)

    transcript = sessions[session_id]["cleaned"]

    prompt = f"""
Return JSON with only the questions block (same MCQ rules as before).
Return EXACT JSON for the questions field:

{{
  "mcq_questions": [],
  "short_answer_questions": [],
  "long_answer_questions": []
}}

Transcript:
{transcript}
"""
    raw = await generate_gemini(prompt, max_tokens=1800)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    try:
        qdata = json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration did not return valid JSON: {str(e)}")

    mcqs = normalize_mcq_list(qdata.get("mcq_questions", []))
    # update questions in cache safely
    generation_cache[session_id]["questions"] = {
        "mcq_questions": mcqs,
        "short_answer_questions": qdata.get("short_answer_questions", []),
        "long_answer_questions": qdata.get("long_answer_questions", []),
    }

    return generation_cache[session_id]["questions"]

@app.post("/api/chatbot")
async def chatbot(req: ChatMessage):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    # attempt RAG search; if fails or very weak, fall back to full transcript
    chunks = safe_search_similar_chunks(req.session_id, req.question, k=3)
    context = "\n\n".join(chunks) if chunks else ""

    if len(context) < 150:
        context = sessions[req.session_id].get("cleaned", "")

    prompt = f"""
You are a helpful AI Assistant who answers user queries based only on the available context.
Use the context to answer concisely and, when applicable, point the user to where in the lecture they can read more.

Context:
{context}

Question:
{req.question}
"""

    answer = await generate_gemini(prompt, max_tokens=700)

    # Simple confidence heuristic based on number of relevant chunks found
    confidence = min(0.95, 0.4 + 0.15 * len(chunks))

    return {"answer": answer, "confidence": round(confidence, 2), "sources": chunks[:2]}

@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    # return basic session info and whether cache exists
    return {
        "session_id": session_id,
        "transcript": sessions[session_id].get("transcript"),
        "cleaned_transcript": sessions[session_id].get("cleaned"),
        "created_at": sessions[session_id].get("created_at"),
        "has_cache": session_id in generation_cache
    }

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    sessions.pop(session_id, None)
    generation_cache.pop(session_id, None)
    try:
        qdrant_client.delete_collection(collection_name=f"session_{session_id}")
    except Exception:
        pass
    return {"message": "deleted"}

# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)