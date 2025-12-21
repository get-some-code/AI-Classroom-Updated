import { Upload, FileAudio, Sparkles, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import api from '../services/api';

export default function UploadCard({ onUploadSuccess, onGenerationComplete, onError, isGenerating, setIsGenerating }) {
    const [transcript, setTranscript] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp3', 'audio/ogg', 'audio/flac'];
            const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
            const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

            if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                onError('Invalid file type. Please upload MP3, WAV, M4A, OGG, or FLAC audio files.');
                return;
            }

            // Check file size (max 100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                onError('File too large. Please upload files smaller than 100MB.');
                return;
            }

            setAudioFile(file);
            setTranscript(''); // Clear transcript if file is selected
            onError(null); // Clear any previous errors
        }
    };

    // Handle generate button click
    const handleGenerate = async () => {
        // Validate input
        if (!audioFile && !transcript.trim()) {
            onError('Please either upload an audio file or paste a transcript.');
            return;
        }

        setIsUploading(true);
        setIsGenerating(true);
        onError(null);

        try {
            let sessionId;

            // Step 1: Upload audio or transcript
            if (audioFile) {
                console.log('Uploading audio file...');
                const uploadResponse = await api.uploadAudio(audioFile);
                sessionId = uploadResponse.session_id;
                onUploadSuccess(uploadResponse);
                console.log('Audio uploaded successfully!', uploadResponse);
            } else if (transcript.trim()) {
                console.log('Uploading transcript...');
                const uploadResponse = await api.uploadTranscript(transcript);
                sessionId = uploadResponse.session_id;
                onUploadSuccess(uploadResponse);
                console.log('Transcript uploaded successfully!', uploadResponse);
            }

            setIsUploading(false);

            // Step 2: Generate all content in parallel
            console.log('Generating exam pack...');
            const [summaries, notes, questions] = await Promise.all([
                api.generateSummary(sessionId),
                api.generateNotes(sessionId),
                api.generateQuestions(sessionId)
            ]);

            console.log('Generation complete!', { summaries, notes, questions });

            // Pass all generated data to parent
            onGenerationComplete({
                summaries,
                notes,
                questions
            });

            // Clear form after successful generation
            setAudioFile(null);
            setTranscript('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (err) {
            console.error('Error:', err);
            onError(err.message || 'An error occurred. Please try again.');
            setIsUploading(false);
            setIsGenerating(false);
        }
    };

    // Handle clicking on the upload area
    const handleUploadAreaClick = () => {
        if (!isUploading && !isGenerating) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1">
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
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading || isGenerating}
                    />
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                    <div
                        onClick={handleUploadAreaClick}
                        className={`relative bg-slate-50 border-2 border-dashed ${audioFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-400'
                            } rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group-hover:bg-blue-50/50 ${isUploading || isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                            <FileAudio className={`w-14 h-14 ${audioFile ? 'text-emerald-500' : 'text-blue-500'
                                } relative group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {audioFile ? 'Audio file selected!' : 'Select audio file'}
                        </h3>
                        <p className="text-slate-600 text-sm mb-1">
                            Click to choose a lecture recording (MP3 / WAV / M4A).
                        </p>
                        <p className={`text-sm mb-3 ${audioFile ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                            {audioFile ? `📁 ${audioFile.name}` : 'No file selected.'}
                        </p>
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
                        onChange={(e) => {
                            setTranscript(e.target.value);
                            if (e.target.value.trim()) {
                                setAudioFile(null); // Clear file if transcript is entered
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                }
                            }
                        }}
                        placeholder="Paste your lecture transcript here if you already have it..."
                        className="w-full h-32 bg-white border border-slate-300 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading || isGenerating}
                    />
                    {transcript.trim() && (
                        <p className="text-xs text-slate-500 mt-2">
                            {transcript.trim().split(' ').length} words
                        </p>
                    )}
                </div>

                {/* Loading Status */}
                {(isUploading || isGenerating) && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            <div className="flex-1">
                                <p className="text-blue-900 font-medium text-sm">
                                    {isUploading ? 'Uploading and transcribing...' : 'Generating exam pack...'}
                                </p>
                                <p className="text-blue-700 text-xs mt-1">
                                    {isUploading
                                        ? 'This may take a minute for audio files.'
                                        : 'Creating summaries, notes, and questions. Please wait...'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                    <button
                        onClick={handleGenerate}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        disabled={isUploading || isGenerating || (!audioFile && !transcript.trim())}
                        className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isUploading || isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isUploading ? 'Processing...' : 'Generating...'}
                            </>
                        ) : (
                            <>
                                <Sparkles className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
                                Generate Exam Pack
                                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}