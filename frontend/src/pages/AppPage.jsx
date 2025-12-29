import { Sun, Moon } from "lucide-react";
import UploadCard from "../components/UploadCard.jsx";
import ExamPack from "../components/ExamPack.jsx";
import PreviewCard from "../components/PreviewTranscriptCard.jsx";
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

function AppPage() {
  /* ---------------- THEME ---------------- */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  /* ---------------- GLOBAL STATE ---------------- */
  const [sessionId, setSessionId] = useState(null);
  const [cleanedTranscript, setCleanedTranscript] = useState("");
  const [examPack, setExamPack] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- THEME EFFECT ---------------- */
  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ---------------- CALLBACKS ---------------- */

  const handleUploadSuccess = useCallback((data) => {
    setSessionId(data.session_id);
    setCleanedTranscript(data.cleaned_transcript || "");
    setExamPack(null);
    setError(null);
  }, []);

  const handleGenerationComplete = useCallback((pack) => {
    setExamPack(pack);
    setIsGenerating(false);
    setError(null);
  }, []);

  const handleError = useCallback((msg) => {
    setError(msg);
    setIsGenerating(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      if (detail) {
        setExamPack(detail);
      }
    };
    window.addEventListener("examPack:updated", handler);
    return () => window.removeEventListener("examPack:updated", handler);
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div
      className="
        relative min-h-screen
        bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
        text-slate-900 dark:text-slate-100
        px-4 sm:px-6 lg:px-8 py-10
        transition-colors duration-500
      "
    >
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative max-w-7xl mx-auto mb-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Prepare Hub
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          Upload a lecture and instantly get{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            notes, summaries, exam questions
          </span>{" "}
          and an intelligent doubt-solving chatbot.
        </p>
      </header>

      {/* ERROR */}
      {error && (
        <div className="relative max-w-7xl mx-auto mb-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <span className="w-2 h-2 mt-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <UploadCard
            onUploadSuccess={handleUploadSuccess}
            onGenerationComplete={handleGenerationComplete}
            onError={handleError}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
          <PreviewCard transcript={cleanedTranscript} />
        </div>

        <div className="lg:sticky lg:top-10 h-fit">
          <ExamPack
            sessionId={sessionId}
            examPack={examPack}
            isGenerating={isGenerating}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative mt-20">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent dark:via-indigo-500/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl px-8 py-8">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Prepare Hub. Built for focused learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppPage;