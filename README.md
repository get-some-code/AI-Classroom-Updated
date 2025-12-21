# Preply Backend - AI Exam Pack Generator

FastAPI backend for generating exam-ready study materials from lectures using Gemini AI, Whisper, and RAG.

## Features

- 🎤 **Audio Transcription**: Upload audio files (MP3, WAV, M4A) and get accurate transcriptions using Whisper
- 📝 **Text Upload**: Paste transcript text directly
- 🧹 **Transcript Cleaning**: Automatic removal of filler words and formatting
- 📚 **Three-Tier Summaries**:
  - Short (10-second recall)
  - Medium (pre-exam revision)
  - Detailed (comprehensive walkthrough)
- 📖 **Structured Notes**: Well-organized study notes with headings and bullet points
- ❓ **Question Generation**:
  - Multiple Choice Questions (MCQs)
  - Short Answer Questions
  - Long Answer/Essay Questions
- 🤖 **RAG Chatbot**: Context-aware chatbot using Qdrant vector database
- 💾 **In-Memory Sessions**: No database required, perfect for development

## Tech Stack

- **FastAPI**: Modern Python web framework
- **Whisper**: OpenAI's speech-to-text model (completely free!)
- **Gemini 2.5 Flash**: Google's LLM for content generation
- **Qdrant**: Vector database for RAG (in-memory mode)
- **Sentence Transformers**: Text embeddings for semantic search

## Prerequisites

- Python 3.9 or higher
- Google Gemini API key (free tier available)
- FFmpeg (required for Whisper audio processing)

### Install FFmpeg

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install ffmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/get-some-code/AI-Classroom-Updated.git
cd AI-Classroom-Updated
```

### 2. Create backend directory and files

```bash
mkdir backend
cd backend
```

Copy the `main.py` and `requirements.txt` files into this directory.

### 3. Create virtual environment

```bash
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

**Note**: The first time you run the app, Whisper will download the model (~150MB for base model).

### 5. Set up environment variables

Create a `.env` file in the backend directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get your Gemini API key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into your `.env` file

## Running the Backend

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Access API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### 1. Upload Audio

**POST** `/api/upload-audio`

Upload an audio file for transcription.

**Request:**

- `file`: Audio file (multipart/form-data)
- Supported formats: MP3, WAV, M4A, OGG, FLAC

**Response:**

```json
{
  "session_id": "uuid",
  "transcript": "original transcript",
  "cleaned_transcript": "cleaned transcript"
}
```

### 2. Upload Transcript

**POST** `/api/upload-transcript`

Upload raw transcript text.

**Request:**

```json
{
  "transcript": "your transcript text here"
}
```

**Response:**

```json
{
  "session_id": "uuid",
  "transcript": "original transcript",
  "cleaned_transcript": "cleaned transcript"
}
```

### 3. Generate Summaries

**GET** `/api/generate-summary/{session_id}`

Generate three types of summaries.

**Response:**

```json
{
  "short_summary": "Brief 2-3 sentence summary",
  "medium_summary": "Medium-length summary for revision",
  "detailed_summary": "Comprehensive detailed summary"
}
```

### 4. Generate Notes

**GET** `/api/generate-notes/{session_id}`

Generate structured study notes.

**Response:**

```json
{
  "notes": "Well-formatted study notes with headings and bullet points"
}
```

### 5. Generate Questions

**GET** `/api/generate-questions/{session_id}`

Generate exam-style questions.

**Response:**

```json
{
  "mcq_questions": [
    {
      "question": "Question text",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct_answer": "A",
      "explanation": "..."
    }
  ],
  "short_answer_questions": [
    {
      "question": "Question text",
      "suggested_answer": "Answer"
    }
  ],
  "long_answer_questions": [
    {
      "question": "Essay question",
      "key_points": ["point1", "point2"]
    }
  ]
}
```

### 6. Chatbot

**POST** `/api/chatbot`

Ask questions about the transcript using RAG.

**Request:**

```json
{
  "session_id": "uuid",
  "question": "What was the main topic discussed?"
}
```

**Response:**

```json
{
  "answer": "AI-generated answer based on transcript",
  "sources": ["relevant chunk 1", "relevant chunk 2"]
}
```

### 7. Get Session

**GET** `/api/session/{session_id}`

Retrieve session information.

### 8. Delete Session

**DELETE** `/api/session/{session_id}`

Delete a session and its associated data.

## Frontend Integration

Your React frontend should make API calls to these endpoints. Example using fetch:

```javascript
// Upload audio
const formData = new FormData();
formData.append("file", audioFile);

const response = await fetch("http://localhost:8000/api/upload-audio", {
  method: "POST",
  body: formData,
});

const data = await response.json();
const sessionId = data.session_id;

// Generate summaries
const summaries = await fetch(
  `http://localhost:8000/api/generate-summary/${sessionId}`
);
const summaryData = await summaries.json();

// Chatbot
const chatResponse = await fetch("http://localhost:8000/api/chatbot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: sessionId,
    question: "What is the main concept?",
  }),
});
```

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create this)
└── .gitignore          # Git ignore file
```

## Configuration

### Whisper Model Selection

You can change the Whisper model in `main.py`:

```python
whisper_model = whisper.load_model("base")  # Current
```

Available models (ordered by accuracy/size):

- `tiny` - Fastest, least accurate (~75MB)
- `base` - Balanced (default, ~150MB)
- `small` - Better accuracy (~500MB)
- `medium` - High accuracy (~1.5GB)
- `large` - Best accuracy (~3GB)

### Gemini Model

Current model: `gemini-2.0-flash-exp`

You can change it in `main.py`:

```python
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
```

## Troubleshooting

### FFmpeg not found

```
Error: ffmpeg not found
```

**Solution**: Install FFmpeg (see Prerequisites section)

### Gemini API Error

```
Error: Invalid API key
```

**Solution**: Verify your `.env` file has the correct `GEMINI_API_KEY`

### Out of Memory

If you run out of memory with Whisper:

1. Use a smaller model (`tiny` or `base`)
2. Process shorter audio files
3. Increase system RAM

### CORS Error

If your frontend can't connect:

1. Check that backend is running on port 8000
2. Verify CORS settings in `main.py`
3. Update `allow_origins` with your frontend URL

## Performance Tips

1. **Whisper Model**: Start with `base`, upgrade to `small` if needed
2. **Chunking**: Adjust `chunk_size` in `chunk_transcript()` for better RAG results
3. **Caching**: First transcription is slower (model download)
4. **Session Management**: Clear old sessions periodically to free memory

## Development Tips

1. Use `/docs` endpoint for testing API without frontend
2. Monitor console for detailed error messages
3. Sessions are stored in memory - restart clears all data
4. Use `--reload` flag for auto-restart on code changes

## Production Deployment

For production:

1. **Add Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Add Redis**: For session management and caching
3. **Environment Variables**: Use proper secret management
4. **CORS**: Restrict `allow_origins` to your frontend domain
5. **Rate Limiting**: Add API rate limiting
6. **Error Handling**: Implement comprehensive error logging
7. **File Storage**: Use cloud storage (S3/GCS) for audio files

## API Rate Limits

**Gemini API Free Tier:**

- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

Monitor your usage at [Google AI Studio](https://makersuite.google.com/)

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Open an issue on GitHub

## License

MIT License

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using FastAPI, Whisper, Gemini, and Qdrant
