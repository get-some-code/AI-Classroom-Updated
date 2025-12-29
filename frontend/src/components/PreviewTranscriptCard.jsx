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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <h3 className="text-xl font-bold text-white">
            Transcript Preview
          </h3>
        </div>

        {transcript && (
          <button
            onClick={handleCopy}
            className="
            inline-flex items-center gap-2
            px-3 py-1.5
            bg-slate-700 hover:bg-slate-600
            text-gray-300 hover:text-white
            rounded-xl
            transition-all duration-200
            text-sm font-medium
            hover:shadow-lg hover:shadow-purple-500/20
            border border-slate-600
          "
            title="Copy transcript"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
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

      <p className="text-gray-400 text-sm mb-5">
        What we understood from your lecture.
      </p>

      {transcript ? (
        <div
          className="
          bg-slate-900/50
          border border-slate-700
          rounded-2xl
          p-6
          max-h-[300px]
          overflow-y-auto
          space-y-4
        "
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>

            <div className="flex-1">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-slate-700">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              📝 {transcript.split(" ").length} words
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              📊 {transcript.length} characters
            </span>
          </div>
        </div>
      ) : (
        <div
          className="
          bg-slate-900/50
          border border-dashed border-slate-700
          rounded-2xl
          p-8
          min-h-[200px]
          flex items-center justify-center
        "
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-700/50 mb-4">
              <FileText className="w-7 h-7 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              No transcript yet. Upload audio or paste text and click
              <span className="font-medium text-purple-400"> "Generate Exam Pack"</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}