import {
  Upload,
  FileAudio,
  Sparkles,
  ChevronRight,
  Check,
  Loader2
} from "lucide-react";
import { useState, useRef } from "react";
import api from "../services/api";

export default function UploadCard({
  onUploadSuccess,
  onGenerationComplete,
  onError,
  isGenerating,
  setIsGenerating
}) {
  const [transcript, setTranscript] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  /* ---------------- FILE SELECT ---------------- */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExt = [".mp3", ".wav", ".m4a", ".ogg", ".flac"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validExt.includes(ext)) {
      onError("Invalid file type. Upload MP3, WAV, M4A, OGG, or FLAC.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      onError("File too large. Max size is 100MB.");
      return;
    }

    setAudioFile(file);
    setTranscript("");
    onError(null);
  };

  /* ---------------- GENERATE ---------------- */
  const handleGenerate = async () => {
    if (isUploading || isGenerating) return;

    if (!audioFile && !transcript.trim()) {
      onError("Upload audio or paste transcript.");
      return;
    }

    setIsUploading(true);
    setIsGenerating(true);
    onError(null);

    try {
      let sessionId;

      // 1️⃣ Upload
      if (audioFile) {
        const res = await api.uploadAudio(audioFile);
        sessionId = res.session_id;
        onUploadSuccess(res);
      } else {
        const res = await api.uploadTranscript(transcript);
        sessionId = res.session_id;
        onUploadSuccess(res);
      }

      setIsUploading(false);

      // 2️⃣ SINGLE generation call
      const examPack = await api.generateExamPack(sessionId);

      // 3️⃣ Pass unified result
      if (typeof onGenerationComplete === "function") {
        onGenerationComplete(examPack);
      }

      // Reset UI
      setAudioFile(null);
      setTranscript("");
      fileInputRef.current && (fileInputRef.current.value = "");
    } catch (err) {
      console.error(err);
      onError(err.message || "Generation failed.");
      setIsGenerating(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className="
      bg-slate-800/50
      backdrop-blur-xl
      rounded-3xl
      border border-slate-700
      shadow-2xl shadow-slate-900/50
      p-8
      transition-all duration-300
      hover:shadow-slate-900/70
      hover:-translate-y-1
      hover:border-purple-500/50
    "
    >
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
          <Upload className="w-5 h-5 text-purple-400" />
        </div>
        Upload Lecture
      </h2>

      {/* Audio Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        hidden
        disabled={isUploading || isGenerating}
      />

      <div
        onClick={() =>
          !isUploading && !isGenerating && fileInputRef.current?.click()
        }
        className={`
        relative
        border-2 border-dashed
        rounded-2xl
        p-8
        text-center
        cursor-pointer
        transition-all duration-300
        ${audioFile
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-slate-600 bg-slate-900/50 hover:border-purple-500 hover:bg-purple-500/10"
          }
        ${isUploading || isGenerating
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-lg hover:shadow-purple-500/20"
          }
      `}
      >
        <FileAudio className={`w-12 h-12 mx-auto mb-3 ${audioFile ? 'text-emerald-400' : 'text-purple-400'}`} />

        <p className="font-medium text-white">
          {audioFile ? audioFile.name : "Click to upload audio"}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          MP3, WAV, M4A, OGG, FLAC
        </p>

        <div className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-xs font-medium">
          <Check className="w-4 h-4" />
          Or paste transcript below
        </div>
      </div>

      {/* Transcript */}
      <textarea
        value={transcript}
        onChange={(e) => {
          setTranscript(e.target.value);
          if (e.target.value.trim()) {
            setAudioFile(null);
            fileInputRef.current && (fileInputRef.current.value = "");
          }
        }}
        placeholder="Paste transcript here..."
        disabled={isUploading || isGenerating}
        className="
        w-full mt-5 h-32
        border border-slate-600
        bg-slate-900/50
        rounded-2xl
        p-4
        text-sm text-white
        placeholder:text-gray-500
        resize-none
        focus:outline-none
        focus:ring-2 focus:ring-purple-500
        focus:border-purple-500
        transition-all
        disabled:bg-slate-800/50
        disabled:text-gray-500
      "
      />

      {/* Status */}
      {(isUploading || isGenerating) && (
        <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium">
          <Loader2 className="animate-spin w-5 h-5" />
          {isUploading ? "Uploading audio…" : "Generating exam pack…"}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleGenerate}
        disabled={isUploading || isGenerating}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="
        mt-6 w-full py-4
        bg-gradient-to-r from-purple-600 to-indigo-600
        text-white
        rounded-2xl
        flex justify-center items-center gap-2
        font-semibold
        shadow-xl shadow-purple-600/40
        transition-all duration-300
        hover:shadow-2xl hover:shadow-purple-700/50
        hover:-translate-y-0.5
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      >
        {isUploading || isGenerating ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <>
            <Sparkles
              className={`transition-transform duration-300 ${isHovered ? "rotate-12 scale-110" : ""
                }`}
            />
            Generate Exam Pack
            <ChevronRight
              className={`transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
                }`}
            />
          </>
        )}
      </button>
    </div>
  );
}