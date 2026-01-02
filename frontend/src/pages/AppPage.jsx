import { User, Github, Twitter, Linkedin, Mail, Heart, ExternalLink, Sparkles, Shield, Bell } from "lucide-react";
import UploadCard from "../components/UploadCard.jsx";
import ExamPack from "../components/ExamPack.jsx";
import PreviewCard from "../components/PreviewTranscriptCard.jsx";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppPage() {
  /* ---------------- AUTH ---------------- */
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  /* ---------------- THEME ---------------- */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  /* ---------------- GLOBAL STATE ---------------- */
  const [sessionId, setSessionId] = useState(null);
  const [cleanedTranscript, setCleanedTranscript] = useState("");
  const [examPack, setExamPack] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  /* ---------------- THEME EFFECT ---------------- */
  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ---------------- CALLBACKS ---------------- */

  const handleUploadSuccess = useCallback((data) => {
    setSessionId(data.session_id);
    setCleanedTranscript(data.cleaned_transcript || "");
    setExamPack(null);
    setError(null);
  }, []);

  const handleGenerationComplete = useCallback((pack) => {
    setExamPack(pack);
    setIsGenerating(false);
    setError(null);
  }, []);

  const handleError = useCallback((msg) => {
    setError(msg);
    setIsGenerating(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      if (detail) {
        setExamPack(detail);
      }
    };
    window.addEventListener("examPack:updated", handler);
    return () => window.removeEventListener("examPack:updated", handler);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  /* ---------------- UI ---------------- */
  if (loading) return null;

  return (
    <div
      className="
        relative min-h-screen
        bg-[#0f1729]
        text-white
        transition-colors duration-500
      "
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Purple gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* HEADER */}
      <header className="relative backdrop-blur-xl bg-[#0f1729]/80 border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">LectureHacks</span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Profile Menu */}
              <div className="relative group">
                <button
                  className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                </button>
                {/* DROPDOWN */}
                <div
                  className="absolute right-0 mt-3 w-72 rounded-2xl
                    bg-[#1a2332] backdrop-blur-xl
                    border border-white/10
                    shadow-2xl opacity-0 scale-95 invisible
                    group-hover:opacity-100 group-hover:scale-100 group-hover:visible
                    transition-all duration-300 origin-top-right overflow-hidden"
                >
                  {/* Header with gradient */}
                  <div className="relative p-4 border-b border-white/10 bg-gradient-to-br from-purple-600/10 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent" />
                    <p className="relative text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Signed in as
                    </p>
                    <p className="relative text-sm font-bold text-white truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl
                        text-gray-300 hover:text-white
                        hover:bg-white/5
                        transition-all duration-200
                        flex items-center gap-3"
                    >
                      <User size={16} />
                      <span>Profile Settings</span>
                    </button>
                    
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium rounded-xl
                        text-gray-300 hover:text-white
                        hover:bg-white/5
                        transition-all duration-200
                        flex items-center gap-3"
                    >
                      <Shield size={16} />
                      <span>Privacy</span>
                    </button>

                    <div className="my-2 border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl
                        text-red-400 hover:text-red-300
                        hover:bg-red-500/10
                        transition-all duration-200
                        flex items-center gap-3"
                    >
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content wrapper with max width */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ERROR */}
        {error && (
          <div className="mb-8 animate-[slideDown_0.3s_ease-out]">
            <div className="relative overflow-hidden bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-5 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                <p className="text-red-200 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8 animate-[slideInLeft_0.6s_ease-out]">
            <UploadCard
              onUploadSuccess={handleUploadSuccess}
              onGenerationComplete={handleGenerationComplete}
              onError={handleError}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <PreviewCard transcript={cleanedTranscript} />
          </div>

          <div className="lg:sticky lg:top-28 h-fit animate-[slideInRight_0.6s_ease-out]">
            <ExamPack
              sessionId={sessionId}
              examPack={examPack}
              isGenerating={isGenerating}
            />
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="relative mt-32 border-t border-white/5 bg-[#0a0f1c]/50">
        {/* Decorative top border with purple accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-purple-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand section */}
            <div className="space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-600/30">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  LectureHacks
                </h3>
              </div>
              
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering students with AI-driven tools to transform lectures into actionable learning materials. 
                Study smarter, not harder.
              </p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Crafted with</span>
                <Heart size={14} className="text-red-500 animate-pulse" fill="currentColor" />
                <span>by passionate educators</span>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-400">
                  🔒 SOC 2 Certified
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-400">
                  ⚡ 99.9% Uptime
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-400">
                  🌍 Global CDN
                </div>
              </div>
            </div>

            {/* Product links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#" },
                  { label: "Pricing", href: "#" },
                  { label: "Use Cases", href: "#" },
                  { label: "Integrations", href: "#" },
                  { label: "API Docs", href: "#" }
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-purple-500 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ExternalLink size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Press Kit", href: "#" },
                  { label: "Contact", href: "#" }
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-purple-500 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ExternalLink size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter section */}
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 backdrop-blur-sm">
            <div className="max-w-2xl">
              <h4 className="text-xl font-bold text-white mb-2">
                Stay Updated
              </h4>
              <p className="text-gray-400 mb-4">
                Get the latest features, updates, and learning tips delivered to your inbox.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl
                    bg-white/5
                    border border-white/10
                    focus:border-purple-500/50
                    focus:ring-2 focus:ring-purple-500/20
                    outline-none transition-all
                    text-white
                    placeholder:text-gray-500"
                />
                <button className="px-6 py-3 font-semibold rounded-xl
                  bg-gradient-to-r from-purple-600 to-purple-500
                  hover:from-purple-500 hover:to-purple-600
                  text-white shadow-lg shadow-purple-600/25
                  hover:shadow-xl hover:shadow-purple-600/40
                  transform hover:scale-105 active:scale-95
                  transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { Icon: Github, href: "https://github.com" },
                  { Icon: Twitter, href: "https://twitter.com" },
                  { Icon: Linkedin, href: "https://linkedin.com" },
                  { Icon: Mail, href: "mailto:hello@lecturehacks.com" }
                ].map(({ Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl
                      bg-white/5 hover:bg-purple-600
                      border border-white/10 hover:border-purple-500
                      flex items-center justify-center
                      text-gray-400 hover:text-white
                      hover:scale-110 hover:-translate-y-1
                      transition-all duration-300
                      shadow-sm hover:shadow-lg hover:shadow-purple-600/30"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>

              {/* Copyright */}
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} LectureHacks. All rights reserved.
              </p>

              {/* Legal links */}
              <div className="flex gap-6 text-sm">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-500 hover:text-purple-400 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default AppPage;