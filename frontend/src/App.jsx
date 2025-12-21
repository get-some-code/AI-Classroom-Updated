import { Sun, Moon } from 'lucide-react';
import UploadCard from './components/UploadCard.jsx'
import ExamPack from './components/ExamPack.jsx'
import PreviewCard from './components/PreviewTranscriptCard.jsx'
import { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // State management for the entire app
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [cleanedTranscript, setCleanedTranscript] = useState('');
  const [summaries, setSummaries] = useState(null);
  const [notes, setNotes] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle successful upload (from UploadCard)
  const handleUploadSuccess = (data) => {
    setSessionId(data.session_id);
    setTranscript(data.transcript);
    setCleanedTranscript(data.cleaned_transcript);
    setError(null);
  };

  // Handle generation complete
  const handleGenerationComplete = (generatedData) => {
    setSummaries(generatedData.summaries);
    setNotes(generatedData.notes);
    setQuestions(generatedData.questions);
    setIsGenerating(false);
  };

  // Handle errors
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsGenerating(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 p-8">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Prepare Hub
              </h1>
            </div>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${theme === "light" ? "bg-white text-slate-900" : "bg-slate-900 text-white"}
              border border-slate-200 dark:border-slate-700
              shadow-sm hover:shadow-md
              transition-all duration-300
            `}
            >
              <span className="relative w-5 h-5">
                <Sun
                  className={`absolute inset-0 text-amber-500 transition-all duration-300
                  ${theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}
                `} />
                <Moon
                  className={`absolute inset-0 text-indigo-400 transition-all duration-300
                  ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}
                `} />
              </span>
              <span className="text-sm font-medium">
                {theme === "light" ? "Light" : "Dark"}
              </span>
            </button>
          </div>
          <p className="text-slate-600 mt-3 text-lg">
            Upload a lecture and instantly get notes, summary, exam questions & a doubt chatbot.
          </p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6 relative z-10">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-900 font-semibold text-sm">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-6">
            <UploadCard 
              onUploadSuccess={handleUploadSuccess}
              onGenerationComplete={handleGenerationComplete}
              onError={handleError}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <PreviewCard 
              transcript={cleanedTranscript}
            />
          </div>
          <ExamPack 
            sessionId={sessionId}
            summaries={summaries}
            notes={notes}
            questions={questions}
            isGenerating={isGenerating}
          />
        </div>
        
        <footer className="max-w-7xl mx-auto mt-20 pt-12 pb-8 border-t border-slate-200 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <h3 className="text-xl font-bold text-slate-900">Prepare Hub</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4 max-w-md">
                Transform your lectures into comprehensive exam-ready materials. Upload, generate, and ace your exams with AI-powered learning tools.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
                <a href="https://github.com/get-some-code/AI-Classroom/tree/main/classroom" className="w-9 h-9 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
              </div>
            </div>
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">API</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Documentation</a></li>
              </ul>
            </div>
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">About</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200">
            <p className="text-slate-600 text-sm mb-4 md:mb-0">
              © 2025 Prepare Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App