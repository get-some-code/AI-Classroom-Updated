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

  useEffect(() => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setQuestionType("mcq");
  }, [examPack?.questions]);

  /* ---------------- DATA ---------------- */
  const summaries = examPack?.summary || null;
  const notes = examPack?.notes || null;
  const questions = examPack?.questions || {
    mcq_questions: [],
    short_answer_questions: [],
    long_answer_questions: []
  };

  const questionMap = {
    mcq: questions?.mcq_questions || [],
    short: questions?.short_answer_questions || [],
    long: questions?.long_answer_questions || []
  };


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

  /* ---------------- FORMATTER ---------------- */
  const renderText = (text) =>
    text?.split("\n").map((l, i) =>
      l.trim() ? (
        <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {l}
        </p>
      ) : (
        <br key={i} />
      )
    );

  return (
    <div className="
      relative
      h-[780px]
      flex flex-col
      rounded-3xl
      bg-white/80 dark:bg-slate-800/50
      backdrop-blur-xl
      border border-slate-200/60 dark:border-slate-700/60
      shadow-2xl shadow-slate-900/10
      p-8
      transition-all duration-500
    ">

      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity" />

      {/* Header */}
      <h2 className="relative text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
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
              transition-all duration-300
              ${activeTab === t
                ? "bg-indigo-600 text-white shadow-md scale-[1.03]"
                : "bg-slate-100/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 space-y-2">

          {/* LOADING */}
          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-fade-in">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium tracking-wide">
                Generating exam pack…
              </p>
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
                        transition-all
                        ${summaryLength === l
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}
                      `}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 space-y-3 animate-fade-in">
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
              <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 space-y-3 animate-fade-in">
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
                        transition-all
                        ${questionType === t
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}
                      `}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {questionMap[questionType].map((q, i) => (
                  <div
                    key={i}
                    className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 mb-4 transition-all hover:shadow-md animate-fade-in"
                  >
                    <p className="font-semibold mb-3 text-slate-900 dark:text-white">
                      {i + 1}. {q.question}
                    </p>

                    {Object.entries(q.options || {}).map(([key, val]) => {
                      const selected = selectedAnswers[i] === key;
                      const correct = q.correct_answer === key;

                      return (
                        <label
                          key={key}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2 transition-all
                            ${showAnswers && correct
                              ? "bg-emerald-500/10 border border-emerald-400"
                              : showAnswers && selected && !correct
                                ? "bg-red-500/10 border border-red-400"
                                : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"}
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
                          <span className="text-sm text-slate-800 dark:text-slate-200">
                            {key}. {val}
                          </span>

                          {showAnswers && correct && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                          )}
                          {showAnswers && selected && !correct && (
                            <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                          )}
                        </label>
                      );
                    })}

                    {showAnswers && q.explanation && (
                      <p className="text-sm mt-3 text-slate-600 dark:text-slate-400">
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
            <div className="h-full flex flex-col border border-slate-200/60 dark:border-slate-700/60 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur animate-fade-in">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-slate-800/40">
                {chatMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm">
                    Ask anything after generating the exam pack.
                  </div>
                )}

                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`
                        max-w-[80%] px-4 py-3 rounded-2xl text-sm animate-fade-in
                        ${m.role === "user"
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60"}
                      `}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                  placeholder="Ask a doubt…"
                  className="
                    flex-1 px-4 py-3
                    bg-white dark:bg-slate-900
                    border border-slate-300 dark:border-slate-700
                    rounded-xl
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
    <div className="h-full flex items-center justify-center animate-fade-in">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}