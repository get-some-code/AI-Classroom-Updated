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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <h3 className="text-xl font-bold text-slate-900">Transcript preview</h3>
        </div>
        {transcript && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 text-sm font-medium"
            title="Copy transcript"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
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
      <p className="text-slate-600 text-sm mb-4">What we understood from your lecture.</p>

      {transcript ? (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl p-6 max-h-[300px] overflow-y-auto">
          <div className="flex items-start gap-3 mb-3">
            <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-3 border-t border-slate-200 mt-3">
            <span className="text-xs text-slate-500">
              📝 {transcript.split(' ').length} words
            </span>
            <span className="text-xs text-slate-500">
              📊 {transcript.length} characters
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No transcript yet. Upload audio or paste text and click "Generate Exam Pack".
            </p>
          </div>
        </div>
      )}
    </div>
  )
}