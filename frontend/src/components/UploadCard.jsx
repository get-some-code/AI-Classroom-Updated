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
      bg-white
      rounded-3xl
      border border-slate-200
      shadow-2xl shadow-slate-900/20
      p-8
      transition-all duration-300
      hover:shadow-slate-900/30
      hover:-translate-y-1
    "
    >
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900">
        <div className="p-2 rounded-xl bg-indigo-100">
          <Upload className="w-5 h-5 text-indigo-600" />
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
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"
          }
        ${isUploading || isGenerating
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-md"
          }
      `}
      >
        <FileAudio className="w-12 h-12 mx-auto mb-3 text-indigo-600" />

        <p className="font-medium text-slate-900">
          {audioFile ? audioFile.name : "Click to upload audio"}
        </p>

        <p className="text-xs text-slate-600 mt-1">
          MP3, WAV, M4A, OGG, FLAC
        </p>

        <div className="inline-flex items-center gap-1 mt-4 text-emerald-700 text-xs font-medium">
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
        border border-slate-300
        rounded-2xl
        p-4
        text-sm text-slate-900
        placeholder:text-slate-400
        resize-none
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500
        focus:border-indigo-500
        transition-all
        disabled:bg-slate-100
      "
      />

      {/* Status */}
      {(isUploading || isGenerating) && (
        <div className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-medium">
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
        bg-gradient-to-r from-indigo-600 to-blue-600
        text-white
        rounded-2xl
        flex justify-center items-center gap-2
        font-semibold
        shadow-xl shadow-indigo-600/40
        transition-all duration-300
        hover:shadow-2xl hover:shadow-indigo-700/50
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