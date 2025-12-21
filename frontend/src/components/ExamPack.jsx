import { FileAudio, Sparkles, BookOpen, HelpCircle, MessageCircle, Zap } from 'lucide-react';
import { useState } from 'react';

export default function ExamPack() {
    const [activeTab, setActiveTab] = useState('summary');
    const [summaryLength, setSummaryLength] = useState('short');

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
                {/* Content Areas */}
                <div className="space-y-4">
                    {activeTab === 'summary' && (
                        <>
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-emerald-200/50">
                                <h3 className="font-semibold mb-2 text-emerald-900 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Short summary (10-second recall)
                                </h3>
                                <p className="text-slate-600 text-sm">No summary yet.</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-blue-200/50">
                                <h3 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Medium summary (revision before exam)
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Once you generate the pack, a 2-4 line explanation will appear here.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:shadow-purple-200/50">
                                <h3 className="font-semibold mb-2 text-purple-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Detailed summary (full concept walk-through)
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Generated content for deep revision will be shown here.
                                </p>
                            </div>
                        </>
                    )}
                    {activeTab === 'notes' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center transition-all duration-200 hover:shadow-md">
                            <div className="text-center">
                                <FileAudio className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600">Structured notes will appear here after generation.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'questions' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center transition-all duration-200 hover:shadow-md">
                            <div className="text-center">
                                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600">Practice questions will be generated here.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'chatbot' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 min-h-[400px] flex items-center justify-center transition-all duration-200 hover:shadow-md">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600">Ask your doubts about the lecture content here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}