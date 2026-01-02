import { supabase } from "./supabase";

const API_BASE_URL = "http://localhost:8000";

class PreplyAPI {
  /* ---------------- INTERNAL ---------------- */

  async authFetch(url, options = {}) {
    // Try to get session
    let {
      data: { session },
    } = await supabase.auth.getSession();

    // 🔐 Handle race condition right after login
    if (!session) {
      await new Promise((res) => setTimeout(res, 150));
      ({
        data: { session },
      } = await supabase.auth.getSession());
    }

    if (!session?.access_token) {
      throw new Error("Unauthorized: No active session");
    }

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "API request failed");
    }

    return res.json();
  }


  /* ---------------- UPLOAD ---------------- */

  async uploadTranscript(transcript) {
    return this.authFetch(`${API_BASE_URL}/api/upload-transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
  }

  async uploadAudio(file) {
    const fd = new FormData();
    fd.append("file", file);

    return this.authFetch(`${API_BASE_URL}/api/upload-audio`, {
      method: "POST",
      body: fd,
    });
  }

  /* ---------------- EXAM PACK ---------------- */

  async generateExamPack(sessionId) {
    return this.authFetch(
      `${API_BASE_URL}/api/generate-exam-pack/${sessionId}`
    );
  }

  async regenerateQuestions(sessionId) {
    return this.authFetch(
      `${API_BASE_URL}/api/regenerate-questions/${sessionId}`,
      { method: "POST" }
    );
  }

  /* ---------------- CHATBOT ---------------- */

  async askChatbot(sessionId, question) {
    return this.authFetch(`${API_BASE_URL}/api/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        question,
      }),
    });
  }
}

export const api = new PreplyAPI();
export default api;