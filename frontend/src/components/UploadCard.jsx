import { Upload, FileAudio, Sparkles,ChevronRight,Check } from 'lucide-react';
import { useState } from 'react';

export default function UploadCard() {
    const [transcript, setTranscript] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className={`bg-white 
            rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1`}>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                        <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">1. Upload lecture</h2>
                </div>
                <p className="text-slate-600 mb-6">Use audio OR paste raw transcript text.</p>
                {/* Audio Upload Section */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div className="relative bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group-hover:bg-blue-50/50">
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                            <FileAudio className="w-14 h-14 text-blue-500 relative group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Select audio file</h3>
                        <p className="text-slate-600 text-sm mb-1">
                            Click to choose a lecture recording (MP3 / WAV / M4A).
                        </p>
                        <p className="text-slate-500 text-sm mb-3">No file selected.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <p className="text-emerald-700 text-xs font-medium">
                                Optional: skip file and paste transcript below
                            </p>
                        </div>
                    </div>
                </div>
                {/* Transcript Input */}
                <div className="mb-6">
                    <label className="text-slate-700 text-sm mb-2 block font-medium">Or paste transcript manually:</label>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste your lecture transcript here if you already have it..."
                        className="w-full h-32 bg-white border border-slate-300 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none shadow-sm"
                    />
                </div>
                {/* Generate Button */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        <Sparkles className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
                        Generate Exam Pack
                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}