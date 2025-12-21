import { useState } from 'react';

export default function PreviewTranscriptCard() {

    return (
        <>
        {/* Transcript Preview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Transcript preview
            </h3>
            <p className="text-slate-600 text-sm mb-4">What we understood from your lecture.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-slate-500 text-center text-sm">
                No transcript yet. Upload audio or paste text and click "Generate Exam Pack".
              </p>
            </div>
          </div>
        </>
    )
}