// src/services/api.js
// API Service for Preply Backend

const API_BASE_URL = 'http://localhost:8000';

class PreplyAPI {

    /**
     * Upload audio file for transcription
     */
    async uploadAudio(audioFile) {
        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch(`${API_BASE_URL}/api/upload-audio`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload audio');
        }

        return await response.json();
    }

    /**
     * Upload transcript text
     */
    async uploadTranscript(transcriptText) {
        const response = await fetch(`${API_BASE_URL}/api/upload-transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript: transcriptText }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload transcript');
        }

        return await response.json();
    }

    /**
     * Generate summaries (Short, Medium, Detailed)
     */
    async generateSummary(sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/generate-summary/${sessionId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate summary');
        }

        return await response.json();
    }

    /**
     * Generate structured notes
     */
    async generateNotes(sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/generate-notes/${sessionId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate notes');
        }

        return await response.json();
    }

    /**
     * Generate exam questions (MCQ, Short Answer, Long Answer)
     */
    async generateQuestions(sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/generate-questions/${sessionId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate questions');
        }

        return await response.json();
    }

    /**
     * Ask chatbot a question
     */
    async askChatbot(sessionId, question) {
        const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                question: question,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get chatbot response');
        }

        return await response.json();
    }

    /**
     * Get session information
     */
    async getSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Session not found');
        }

        return await response.json();
    }

    /**
     * Delete session
     */
    async deleteSession(sessionId) {
        const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete session');
        }

        return await response.json();
    }
}

// Export singleton instance
export const api = new PreplyAPI();
export default api;