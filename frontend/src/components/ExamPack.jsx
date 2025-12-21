import { FileAudio, Sparkles, BookOpen, HelpCircle, MessageCircle, Zap, Loader2, Send, CheckCircle, XCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export default function ExamPack({ sessionId, summaries, notes, questions, isGenerating }) {
    const [activeTab, setActiveTab] = useState('summary');
    const [summaryLength, setSummaryLength] = useState('short');

    // Chatbot state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Questions state
    const [questionType, setQuestionType] = useState('mcq');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showAnswers, setShowAnswers] = useState(false);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Handle chat submit
    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !sessionId || isChatLoading) return;

        const userMessage = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const response = await api.askChatbot(sessionId, chatInput);
            const botMessage = {
                role: 'assistant',
                content: response.answer,
                sources: response.sources
            };
            setChatMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('Chatbot error:', err);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                error: true
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Handle answer selection for MCQ
    const handleAnswerSelect = (questionIdx, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIdx]: answer
        }));
    };

    // Render markdown-like formatting
    const renderFormattedText = (text) => {
        if (!text) return null;

        // Split by lines and process
        return text.split('\n').map((line, idx) => {
            // Handle headers
            if (line.startsWith('###')) {
                return <h4 key={idx} className="font-bold text-lg text-slate-900 mt-4 mb-2">{line.replace(/^###\s*/, '')}</h4>;
            }
            if (line.startsWith('##')) {
                return <h3 key={idx} className="font-bold text-xl text-slate-900 mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>;
            }
            if (line.startsWith('#')) {
                return <h2 key={idx} className="font-bold text-2xl text-slate-900 mt-4 mb-2">{line.replace(/^#\s*/, '')}</h2>;
            }

            // Handle bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return <li key={idx} className="ml-4 text-slate-700">{line.replace(/^[\-\*]\s*/, '')}</li>;
            }

            // Handle numbered lists
            if (/^\d+\.\s/.test(line.trim())) {
                return <li key={idx} className="ml-4 text-slate-700">{line.replace(/^\d+\.\s*/, '')}</li>;
            }

            // Handle bold text
            const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Regular paragraph
            if (line.trim()) {
                return <p key={idx} className="text-slate-700 mb-2" dangerouslySetInnerHTML={{ __html: boldFormatted }}></p>;
            }

            return <br key={idx} />;
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">2. Exam-Ready Pack</h2>
                </div>
                <p className="text-slate-600 mb-6">Switch between summary, notes, questions and chatbot.</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: 'summary', label: 'Summary', icon: BookOpen },
                        { id: 'notes', label: 'Notes', icon: FileAudio },
                        { id: 'questions', label: 'Questions', icon: HelpCircle },
                        { id: 'chatbot', label: 'Doubts Chatbot', icon: MessageCircle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Summary Length Options */}
                {activeTab === 'summary' && (
                    <div className="flex gap-2 mb-6">
                        {['short', 'medium', 'detailed'].map(length => (
                            <button
                                key={length}
                                onClick={() => setSummaryLength(length)}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${summaryLength === length
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {length}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                            <p className="text-slate-700 font-medium">Generating your exam pack...</p>
                            <p className="text-slate-500 text-sm mt-2">This may take a minute. Hang tight!</p>
                        </div>
                    </div>
                )}

                {/* Content Areas */}
                {!isGenerating && (
                    <div className="space-y-4">
                        {/* SUMMARY TAB */}
                        {activeTab === 'summary' && (
                            <>
                                {summaries ? (
                                    <>
                                        {summaryLength === 'short' && (
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-emerald-200/50">
                                                <h3 className="font-semibold mb-3 text-emerald-900 flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    Short summary (10-second recall)
                                                </h3>
                                                <div className="text-slate-700 text-sm leading-relaxed">
                                                    {renderFormattedText(summaries.short_summary)}
                                                </div>
                                            </div>
                                        )}

                                        {summaryLength === 'medium' && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-blue-200/50">
                                                <h3 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    Medium summary (revision before exam)
                                                </h3>
                                                <div className="text-slate-700 text-sm leading-relaxed">
                                                    {renderFormattedText(summaries.medium_summary)}
                                                </div>
                                            </div>
                                        )}

                                        {summaryLength === 'detailed' && (
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-purple-200/50">
                                                <h3 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Detailed summary (full concept walk-through)
                                                </h3>
                                                <div className="text-slate-700 text-sm leading-relaxed">
                                                    {renderFormattedText(summaries.detailed_summary)}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center">
                                        <div className="text-center">
                                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                            <p className="text-slate-600">Generate an exam pack to see summaries here.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* NOTES TAB */}
                        {activeTab === 'notes' && (
                            <>
                                {notes ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                                        <div className="prose prose-sm max-w-none">
                                            {renderFormattedText(notes.notes)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center">
                                        <div className="text-center">
                                            <FileAudio className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                            <p className="text-slate-600">Structured notes will appear here after generation.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* QUESTIONS TAB */}
                        {activeTab === 'questions' && (
                            <>
                                {questions ? (
                                    <div className="space-y-4">
                                        {/* Question Type Selector */}
                                        <div className="flex gap-2 mb-4">
                                            <button
                                                onClick={() => { setQuestionType('mcq'); setShowAnswers(false); }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${questionType === 'mcq' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                MCQ ({questions.mcq_questions?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => { setQuestionType('short'); setShowAnswers(false); }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${questionType === 'short' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                Short ({questions.short_answer_questions?.length || 0})
                                            </button>
                                            <button
                                                onClick={() => { setQuestionType('long'); setShowAnswers(false); }}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${questionType === 'long' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                Long ({questions.long_answer_questions?.length || 0})
                                            </button>
                                        </div>

                                        <div className="max-h-[500px] overflow-y-auto space-y-4">
                                            {/* MCQ Questions */}
                                            {questionType === 'mcq' && questions.mcq_questions?.map((q, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h4 className="font-semibold text-slate-900 mb-3">Question {idx + 1}</h4>
                                                    <p className="text-slate-700 mb-4">{q.question}</p>
                                                    <div className="space-y-2">
                                                        {q.options && Object.entries(q.options).map(([key, value]) => (
                                                            <label key={key} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAnswers[idx] === key ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                                                                }`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${idx}`}
                                                                    value={key}
                                                                    checked={selectedAnswers[idx] === key}
                                                                    onChange={() => handleAnswerSelect(idx, key)}
                                                                    className="mt-0.5"
                                                                />
                                                                <span className="text-sm text-slate-700">{key}. {value}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {showAnswers && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {selectedAnswers[idx] === q.correct_answer ? (
                                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                                ) : selectedAnswers[idx] ? (
                                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                                ) : null}
                                                                <span className="font-semibold text-slate-900">
                                                                    Correct Answer: {q.correct_answer}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 text-sm">{q.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Short Answer Questions */}
                                            {questionType === 'short' && questions.short_answer_questions?.map((q, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h4 className="font-semibold text-slate-900 mb-2">Question {idx + 1}</h4>
                                                    <p className="text-slate-700 mb-3">{q.question}</p>
                                                    {showAnswers && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-lg">
                                                            <p className="font-semibold text-slate-900 mb-2">Suggested Answer:</p>
                                                            <p className="text-slate-700 text-sm">{q.suggested_answer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Long Answer Questions */}
                                            {questionType === 'long' && questions.long_answer_questions?.map((q, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                                                    <h4 className="font-semibold text-slate-900 mb-2">Question {idx + 1}</h4>
                                                    <p className="text-slate-700 mb-3">{q.question}</p>
                                                    {showAnswers && q.key_points && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-lg">
                                                            <p className="font-semibold text-slate-900 mb-2">Key Points to Cover:</p>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {q.key_points.map((point, pidx) => (
                                                                    <li key={pidx} className="text-slate-700 text-sm">{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Show/Hide Answers Button */}
                                        <button
                                            onClick={() => setShowAnswers(!showAnswers)}
                                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all"
                                        >
                                            {showAnswers ? 'Hide Answers' : 'Show Answers'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center">
                                        <div className="text-center">
                                            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                            <p className="text-slate-600">Practice questions will be generated here.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* CHATBOT TAB */}
                        {activeTab === 'chatbot' && (
                            <>
                                {sessionId ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                        {/* Chat Messages */}
                                        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                                            {chatMessages.length === 0 && (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                                        <p className="text-slate-600 text-sm">Ask me anything about the lecture!</p>
                                                    </div>
                                                </div>
                                            )}

                                            {chatMessages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === 'user'
                                                            ? 'bg-indigo-500 text-white'
                                                            : msg.error
                                                                ? 'bg-red-50 text-red-900 border border-red-200'
                                                                : 'bg-white border border-slate-200 text-slate-900'
                                                        }`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        {msg.sources && msg.sources.length > 0 && (
                                                            <p className="text-xs mt-2 opacity-70">
                                                                📎 Based on {msg.sources.length} relevant section(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {isChatLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                                                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Chat Input */}
                                        <div className="border-t border-slate-200 p-4 bg-white">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                                                    placeholder="Ask a question about the lecture..."
                                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                    disabled={isChatLoading}
                                                />
                                                <button
                                                    onClick={handleChatSubmit}
                                                    disabled={!chatInput.trim() || isChatLoading}
                                                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isChatLoading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Send className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center">
                                        <div className="text-center">
                                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                            <p className="text-slate-600">Generate an exam pack first to use the chatbot.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}