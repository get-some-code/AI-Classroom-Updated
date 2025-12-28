import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function PreviewTranscriptCard({ transcript }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="
      bg-white/80 backdrop-blur-xl
      rounded-3xl
      border border-slate-200/70
      shadow-xl shadow-slate-200/60
      p-8
      transition-all duration-300
      hover:shadow-2xl hover:shadow-slate-300/60
      hover:-translate-y-1
    "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            Transcript Preview
          </h3>
        </div>

        {transcript && (
          <button
            onClick={handleCopy}
            className="
            inline-flex items-center gap-2
            px-3 py-1.5
            bg-slate-100 hover:bg-slate-200
            text-slate-700
            rounded-xl
            transition-all duration-200
            text-sm font-medium
            hover:shadow-sm
          "
            title="Copy transcript"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-slate-600 text-sm mb-5">
        What we understood from your lecture.
      </p>

      {transcript ? (
        <div
          className="
          bg-gradient-to-br from-slate-50 to-blue-50/40
          border border-slate-200
          rounded-2xl
          p-6
          max-h-[300px]
          overflow-y-auto
          space-y-4
        "
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              📝 {transcript.split(" ").length} words
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              📊 {transcript.length} characters
            </span>
          </div>
        </div>
      ) : (
        <div
          className="
          bg-slate-50
          border border-dashed border-slate-300
          rounded-2xl
          p-8
          min-h-[200px]
          flex items-center justify-center
        "
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-200 mb-4">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              No transcript yet. Upload audio or paste text and click
              <span className="font-medium text-slate-700"> “Generate Exam Pack”</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}