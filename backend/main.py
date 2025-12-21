"""
Preply - AI-Powered Exam Pack Generator Backend
FastAPI backend with Whisper transcription, Gemini AI, and RAG chatbot
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
import whisper
import os
import tempfile
import uuid
from datetime import datetime
import re
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI(title="Preply API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models and clients
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Whisper model (will be loaded on first use)
whisper_model = None

# Sentence transformer for embeddings
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Qdrant client (in-memory mode)
qdrant_client = QdrantClient(":memory:")

# In-memory session storage
sessions = {}

# Pydantic models
class TranscriptRequest(BaseModel):
    transcript: str

class ChatMessage(BaseModel):
    session_id: str
    question: str

class SessionResponse(BaseModel):
    session_id: str
    transcript: str
    cleaned_transcript: str

class SummaryResponse(BaseModel):
    short_summary: str
    medium_summary: str
    detailed_summary: str

class NotesResponse(BaseModel):
    notes: str

class QuestionsResponse(BaseModel):
    mcq_questions: List[dict]
    short_answer_questions: List[dict]
    long_answer_questions: List[dict]

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]


# Helper functions
def clean_transcript(transcript: str) -> str:
    """Clean and format transcript"""
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', transcript)
    # Remove filler words
    filler_words = ['um', 'uh', 'er', 'ah', 'like', 'you know']
    for word in filler_words:
        cleaned = re.sub(rf'\b{word}\b', '', cleaned, flags=re.IGNORECASE)
    # Remove extra spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def chunk_transcript(transcript: str, chunk_size: int = 500) -> List[str]:
    """Split transcript into chunks for RAG"""
    words = transcript.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks


def create_vector_collection(session_id: str, transcript: str):
    """Create vector collection in Qdrant for RAG"""
    collection_name = f"session_{session_id}"
    
    # Create collection
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    
    # Chunk and embed transcript
    chunks = chunk_transcript(transcript)
    points = []
    
    for idx, chunk in enumerate(chunks):
        embedding = embedding_model.encode(chunk).tolist()
        points.append(
            PointStruct(
                id=idx,
                vector=embedding,
                payload={"text": chunk, "chunk_id": idx}
            )
        )
    
    # Upload to Qdrant
    qdrant_client.upsert(
        collection_name=collection_name,
        points=points
    )


def search_similar_chunks(session_id: str, query: str, top_k: int = 3) -> List[str]:
    """Search for relevant chunks in vector database"""
    collection_name = f"session_{session_id}"
    
    # Encode query
    query_embedding = embedding_model.encode(query).tolist()
    
    # Search
    search_results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=top_k
    )
    
    return [result.payload["text"] for result in search_results]


def generate_with_gemini(prompt: str, max_tokens: int = 2048) -> str:
    """Generate text using Gemini"""
    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.7,
            )
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Preply API is running", "version": "1.0.0"}


@app.post("/api/upload-audio", response_model=SessionResponse)
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio file and transcribe using Whisper"""
    global whisper_model
    
    # Validate file type
    if not file.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.flac')):
        raise HTTPException(status_code=400, detail="Invalid audio format. Supported: MP3, WAV, M4A, OGG, FLAC")
    
    # Load Whisper model if not loaded
    if whisper_model is None:
        whisper_model = whisper.load_model("base")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Transcribe audio
        result = whisper_model.transcribe(tmp_file_path)
        transcript = result["text"]
        
        # Clean transcript
        cleaned_transcript = clean_transcript(transcript)
        
        # Create session
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "transcript": transcript,
            "cleaned_transcript": cleaned_transcript,
            "created_at": datetime.now().isoformat()
        }
        
        # Create vector collection for RAG
        create_vector_collection(session_id, cleaned_transcript)
        
        return SessionResponse(
            session_id=session_id,
            transcript=transcript,
            cleaned_transcript=cleaned_transcript
        )
    
    finally:
        # Clean up temporary file
        os.unlink(tmp_file_path)


@app.post("/api/upload-transcript", response_model=SessionResponse)
async def upload_transcript(request: TranscriptRequest):
    """Upload raw transcript text"""
    if not request.transcript or len(request.transcript.strip()) == 0:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    
    # Clean transcript
    cleaned_transcript = clean_transcript(request.transcript)
    
    # Create session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "transcript": request.transcript,
        "cleaned_transcript": cleaned_transcript,
        "created_at": datetime.now().isoformat()
    }
    
    # Create vector collection for RAG
    create_vector_collection(session_id, cleaned_transcript)
    
    return SessionResponse(
        session_id=session_id,
        transcript=request.transcript,
        cleaned_transcript=cleaned_transcript
    )


@app.get("/api/generate-summary/{session_id}", response_model=SummaryResponse)
async def generate_summary(session_id: str):
    """Generate three types of summaries"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    transcript = sessions[session_id]["cleaned_transcript"]
    
    # Short summary (10-second recall)
    short_prompt = f"""
    Create a very brief summary (2-3 sentences) of the following lecture transcript that can be recalled in 10 seconds:
    
    {transcript}
    
    Make it concise and highlight only the key concept.
    """
    short_summary = generate_with_gemini(short_prompt, max_tokens=150)
    
    # Medium summary (revision before exam)
    medium_prompt = f"""
    Create a medium-length summary (1-2 paragraphs) of the following lecture transcript suitable for quick revision before an exam:
    
    {transcript}
    
    Include main topics, key points, and important concepts.
    """
    medium_summary = generate_with_gemini(medium_prompt, max_tokens=500)
    
    # Detailed summary (full concept walk-through)
    detailed_prompt = f"""
    Create a comprehensive, detailed summary of the following lecture transcript:
    
    {transcript}
    
    Include:
    - All main concepts and subtopics
    - Key definitions and explanations
    - Important examples or case studies
    - Relationships between concepts
    
    Format it in a clear, organized manner with appropriate sections.
    """
    detailed_summary = generate_with_gemini(detailed_prompt, max_tokens=2048)
    
    return SummaryResponse(
        short_summary=short_summary,
        medium_summary=medium_summary,
        detailed_summary=detailed_summary
    )


@app.get("/api/generate-notes/{session_id}", response_model=NotesResponse)
async def generate_notes(session_id: str):
    """Generate structured study notes"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    transcript = sessions[session_id]["cleaned_transcript"]
    
    prompt = f"""
    Create comprehensive, well-structured study notes from the following lecture transcript:
    
    {transcript}
    
    Format the notes with:
    - Clear headings and subheadings
    - Bullet points for key concepts
    - Numbered lists for sequential information
    - Bold or emphasized important terms
    - Examples where applicable
    
    Make the notes easy to study from and visually organized.
    """
    
    notes = generate_with_gemini(prompt, max_tokens=2048)
    
    return NotesResponse(notes=notes)


@app.get("/api/generate-questions/{session_id}", response_model=QuestionsResponse)
async def generate_questions(session_id: str):
    """Generate exam-style questions"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    transcript = sessions[session_id]["cleaned_transcript"]
    
    # MCQ Questions
    mcq_prompt = f"""
    Based on this lecture transcript, create 10 multiple-choice questions (MCQs).
    
    {transcript}
    
    For each question, provide:
    - The question
    - Four options (A, B, C, D)
    - The correct answer
    - A brief explanation
    
    Format as JSON array with structure:
    [{{"question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct_answer": "A", "explanation": "..."}}]
    
    Return ONLY the JSON array, no additional text.
    """
    
    mcq_response = generate_with_gemini(mcq_prompt, max_tokens=2048)
    
    # Extract JSON from response
    import json
    try:
        # Remove markdown code blocks if present
        mcq_clean = mcq_response.replace("```json", "").replace("```", "").strip()
        mcq_questions = json.loads(mcq_clean)
    except:
        mcq_questions = []
    
    # Short Answer Questions
    short_prompt = f"""
    Based on this lecture transcript, create 8 short answer questions (2-3 sentences each).
    
    {transcript}
    
    Format as JSON array with structure:
    [{{"question": "...", "suggested_answer": "..."}}]
    
    Return ONLY the JSON array, no additional text.
    """
    
    short_response = generate_with_gemini(short_prompt, max_tokens=1500)
    
    try:
        short_clean = short_response.replace("```json", "").replace("```", "").strip()
        short_questions = json.loads(short_clean)
    except:
        short_questions = []
    
    # Long Answer Questions
    long_prompt = f"""
    Based on this lecture transcript, create 5 long answer/essay questions.
    
    {transcript}
    
    Format as JSON array with structure:
    [{{"question": "...", "key_points": ["point1", "point2", ...]}}]
    
    Return ONLY the JSON array, no additional text.
    """
    
    long_response = generate_with_gemini(long_prompt, max_tokens=1500)
    
    try:
        long_clean = long_response.replace("```json", "").replace("```", "").strip()
        long_questions = json.loads(long_clean)
    except:
        long_questions = []
    
    return QuestionsResponse(
        mcq_questions=mcq_questions,
        short_answer_questions=short_questions,
        long_answer_questions=long_questions
    )


@app.post("/api/chatbot", response_model=ChatResponse)
async def chatbot(request: ChatMessage):
    """Answer questions using RAG on transcript"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Search for relevant chunks
    relevant_chunks = search_similar_chunks(request.session_id, request.question, top_k=3)
    context = "\n\n".join(relevant_chunks)
    
    # Generate answer using Gemini with context
    prompt = f"""
    You are a helpful AI tutor assistant. Answer the student's question based ONLY on the provided lecture content.
    
    Lecture Content:
    {context}
    
    Student Question: {request.question}
    
    Instructions:
    - Answer the question clearly and concisely
    - Use only information from the lecture content provided
    - If the question cannot be answered from the lecture content, say so politely
    - Provide examples from the lecture if relevant
    - Keep your answer focused and educational
    
    Answer:
    """
    
    answer = generate_with_gemini(prompt, max_tokens=1000)
    
    return ChatResponse(
        answer=answer,
        sources=relevant_chunks[:2]  # Return top 2 sources
    )


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "transcript": sessions[session_id]["transcript"],
        "cleaned_transcript": sessions[session_id]["cleaned_transcript"],
        "created_at": sessions[session_id]["created_at"]
    }


@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Delete session and associated data"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Delete from sessions
    del sessions[session_id]
    
    # Delete vector collection
    try:
        qdrant_client.delete_collection(collection_name=f"session_{session_id}")
    except:
        pass
    
    return {"message": "Session deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)