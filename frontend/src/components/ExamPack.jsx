import {
  Sparkles,
  Loader2,
  Send,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import api from "../services/api";

export default function ExamPack({ sessionId, examPack, isGenerating }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [summaryLength, setSummaryLength] = useState("short");

  /* ---------------- CHATBOT ---------------- */
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  /* ---------------- QUESTIONS ---------------- */
  const [questionType, setQuestionType] = useState("mcq");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Reset selected answers when a new examPack is provided
  useEffect(() => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setQuestionType("mcq");
  }, [examPack?.questions]);

  /* ---------------- DATA ---------------- */
  const summaries = examPack?.summary || null;
  const notes = examPack?.notes || null;
  const questions = examPack?.questions || { mcq_questions: [], short_answer_questions: [], long_answer_questions: [] };

  // normalized access with safe defaults
  const questionMap = {
    mcq: questions?.mcq_questions || [],
    short: questions?.short_answer_questions || [],
    long: questions?.long_answer_questions || []
  };

  const optionLabels = ["A", "B", "C", "D"];

  /* ---------------- CONFIDENCE SCORE ---------------- */
  const confidence = useMemo(() => {
    if (!showAnswers || questionType !== "mcq") return null;
    const qs = questionMap.mcq;
    if (!qs.length) return null;

    let correct = 0;
    qs.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_answer) correct++;
    });

    return Math.round((correct / qs.length) * 100);
  }, [showAnswers, selectedAnswers, questionType, questionMap.mcq]);

  /* ---------------- CHAT ---------------- */
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !sessionId || isChatLoading) return;

    setChatMessages((p) => [...p, { role: "user", content: chatInput }]);
    const payload = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await api.askChatbot(sessionId, payload);
      // attach confidence and sources returned by backend to the assistant message
      setChatMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: res.answer,
          sources: res.sources || [],
          confidence: res.confidence
        }
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setChatMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: err?.message || "Sorry, I couldn’t answer that right now.",
          error: true
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* ---------------- REGENERATE QUESTIONS ---------------- */
  const handleRegenerateQuestions = async () => {
    if (!sessionId || isRegenerating) return;
    setIsRegenerating(true);

    try {
      const updatedQuestions = await api.regenerateQuestions(sessionId);
      // api.regenerateQuestions returns the questions block (per backend)
      // Merge it into the existing examPack object so component updates.
      // If parent App keeps examPack in state, ideally App should fetch new pack;
      // here we update local rendering by mutating a shallow copy.
      const current = examPack || {};
      const merged = {
        ...current,
        questions: {
          ...(current.questions || {}),
          ...updatedQuestions
        }
      };
      // Because parent holds examPack, attempt to update via a custom event:
      // If parent doesn't listen, we fallback to setting local state by forcing a re-render
      // (best practice: App should provide a setter; for now we dispatch an event)
      window.dispatchEvent(new CustomEvent("examPack:updated", { detail: merged }));
      // Also reset local selections
      setSelectedAnswers({});
      setShowAnswers(false);
    } catch (err) {
      console.error("Regenerate questions failed:", err);
      // surface a minimal message through chatMessages area when failure occurs
      setChatMessages((p) => [
        ...p,
        { role: "assistant", content: "Regeneration failed. Try again later.", error: true }
      ]);
    } finally {
      setIsRegenerating(false);
    }
  };

  /* ---------------- FORMATTER ---------------- */
  const renderText = (text) =>
    text?.split("\n").map((l, i) =>
      l.trim() ? <p key={i} className="text-sm text-slate-700 leading-relaxed">{l}</p> : <br key={i} />
    );

  return (
    <div
      className="
      bg-white
      rounded-3xl
      border border-slate-200
      shadow-2xl shadow-slate-900/20
      p-8
      h-[780px]
      flex flex-col
    "
    >
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
          <Sparkles className="w-5 h-5" />
        </span>
        Exam-Ready Pack
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["summary", "notes", "questions", "chatbot"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`
            px-4 py-2 rounded-xl text-sm font-medium capitalize
            transition-all
            ${activeTab === t
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }
          `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2">

          {/* LOADING */}
          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium">Generating exam pack…</p>
            </div>
          )}

          {/* SUMMARY */}
          {!isGenerating && activeTab === "summary" && (
            summaries ? (
              <>
                <div className="flex gap-2 mb-4">
                  {["short", "medium", "detailed"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setSummaryLength(l)}
                      className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      ${summaryLength === l
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200"
                        }
                    `}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                  {renderText(summaries[`${summaryLength}_summary`])}
                </div>
              </>
            ) : (
              <EmptyState text="No summary yet. Upload a lecture and generate the exam pack to see concise summaries." />
            )
          )}

          {/* NOTES */}
          {!isGenerating && activeTab === "notes" && (
            notes ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                {renderText(notes)}
              </div>
            ) : (
              <EmptyState text="No notes available yet. Generate the exam pack to get structured revision notes." />
            )
          )}

          {/* QUESTIONS */}
          {!isGenerating && activeTab === "questions" && (
            questionMap[questionType].length === 0 ? (
              <EmptyState text="No questions generated yet. Create an exam pack to practice MCQs and written answers." />
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  {["mcq", "short", "long"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setQuestionType(t);
                        setShowAnswers(false);
                      }}
                      className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      ${questionType === t
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200"
                        }
                    `}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {questionMap[questionType].map((q, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-2xl p-5 mb-4"
                  >
                    <p className="font-semibold mb-3 text-slate-900">
                      {i + 1}. {q.question}
                    </p>

                    {Object.entries(q.options || {}).map(([key, val]) => {
                      const selected = selectedAnswers[i] === key;
                      const correct = q.correct_answer === key;

                      return (
                        <label
                          key={key}
                          className={`
                          flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2
                          ${showAnswers && correct
                              ? "bg-emerald-50 border border-emerald-400"
                              : showAnswers && selected && !correct
                                ? "bg-red-50 border border-red-400"
                                : "bg-slate-50 hover:bg-slate-100"
                            }
                        `}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={selected}
                            onChange={() =>
                              setSelectedAnswers({ ...selectedAnswers, [i]: key })
                            }
                          />
                          <span className="text-sm text-slate-800">
                            {key}. {val}
                          </span>

                          {showAnswers && correct && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
                          )}
                          {showAnswers && selected && !correct && (
                            <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                          )}
                        </label>
                      );
                    })}

                    {showAnswers && q.explanation && (
                      <p className="text-sm mt-3 text-slate-600">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )
          )}

          {/* CHATBOT */}
          {!isGenerating && activeTab === "chatbot" && sessionId && (
            <div className="h-full flex flex-col border border-slate-200 rounded-2xl bg-white">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm">
                    Ask anything after generating the exam pack.
                  </div>
                )}

                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                      max-w-[80%] px-4 py-3 rounded-2xl text-sm
                      ${m.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-slate-200 text-slate-900"
                        }
                    `}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                  placeholder="Ask a doubt…"
                  className="
                  flex-1 px-4 py-3
                  bg-white border border-slate-300
                  rounded-xl text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                "
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="
                  px-4 py-3 rounded-xl
                  bg-indigo-600 hover:bg-indigo-700
                  text-white
                  transition-all
                  disabled:opacity-50
                "
                >
                  {isChatLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* ---------- EMPTY STATE ---------- */
function EmptyState({ text }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
