const API_BASE_URL = "http://localhost:8000";

class PreplyAPI {
  /* ---------------- UPLOAD ---------------- */

  async uploadTranscript(transcript) {
    const res = await fetch(`${API_BASE_URL}/api/upload-transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Transcript upload failed");
    }

    return res.json(); // { session_id }
  }

  async uploadAudio(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/upload-audio`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Audio upload failed");
    }

    return res.json(); // { session_id, transcript, cleaned_transcript }
  }

  /* ---------------- EXAM PACK ---------------- */

  async generateExamPack(sessionId) {
    const res = await fetch(
      `${API_BASE_URL}/api/generate-exam-pack/${sessionId}`
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Exam pack generation failed");
    }

    return res.json(); // { summary, notes, questions }
  }

  async regenerateQuestions(sessionId) {
    const res = await fetch(
      `${API_BASE_URL}/api/regenerate-questions/${sessionId}`,
      { method: "POST" }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Question regeneration failed");
    }

    return res.json(); // questions only
  }

  /* ---------------- CHATBOT ---------------- */

  async askChatbot(sessionId, question) {
    const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        question,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Chatbot failed");
    }

    return res.json(); // { answer, confidence, sources }
  }
}

export const api = new PreplyAPI();
export default api;