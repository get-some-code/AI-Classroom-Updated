import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileAudio,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Upload,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Heart,
  ArrowRight,
  User,
  LogOut,
  Zap,
  Shield,
  Globe,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, loading, navigate]);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0f1729] text-white overflow-hidden">
      {/* Animated Background - Matching App Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Purple gradient orbs with parallax */}
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse"
          style={{
            animationDuration: "4s",
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] animate-pulse"
          style={{
            animationDuration: "6s",
            animationDelay: "1s",
            transform: `translateY(${-scrollY * 0.2}px)`
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] animate-pulse"
          style={{
            animationDuration: "8s",
            animationDelay: "2s",
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.15}px)`
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation - Matching App Page */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f1729]/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* LEFT: Logo */}
            <div className="flex items-center gap-3 justify-self-start group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LectureHacks</span>
            </div>

            {/* CENTER: Nav Links */}
            <div className="hidden md:flex items-center justify-center gap-8 text-sm font-semibold">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-purple-400 relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-purple-400"
                    : "text-slate-300 hover:text-white transition-colors relative group"
                }
              >
                <span className="relative">
                  Home
                  <span className="absolute bottom-[-8px] left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </span>
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "text-purple-400 relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-purple-400"
                    : "text-slate-300 hover:text-white transition-colors relative group"
                }
              >
                <span className="relative">
                  About
                  <span className="absolute bottom-[-8px] left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </span>
              </NavLink>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  isActive
                    ? "text-purple-400 relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-purple-400"
                    : "text-slate-300 hover:text-white transition-colors relative group"
                }
              >
                <span className="relative">
                  Services
                  <span className="absolute bottom-[-8px] left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </span>
              </NavLink>
            </div>

            {/* RIGHT: Auth Action */}
            <div className="justify-self-end relative">
              {loading ? null : !user ? (
                <Link
                  to="/app"
                  className="relative group px-6 py-2.5 rounded-xl overflow-hidden
                    bg-gradient-to-r from-purple-600 to-indigo-600
                    text-white text-sm font-semibold
                    shadow-lg shadow-purple-600/30
                    hover:shadow-xl hover:shadow-purple-600/50
                    transition-all duration-300
                    hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setOpen((v) => !v)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 
                      flex items-center justify-center
                      hover:scale-110 hover:rotate-3 transition-all duration-300
                      shadow-lg shadow-purple-600/30"
                  >
                    <User size={18} strokeWidth={2.5} />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-3 w-40 rounded-xl
                      bg-[#1a2332] backdrop-blur-xl border border-white/10 
                      shadow-2xl overflow-hidden animate-slideDown">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm
                          text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-15 pb-16 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 
            bg-purple-500/10 
            text-purple-300 rounded-full text-sm font-semibold 
            border border-purple-500/30 backdrop-blur-xl
            shadow-lg shadow-purple-500/10
            animate-fadeInDown
            hover:scale-105 hover:shadow-purple-500/20
            transition-all duration-300 cursor-default"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            <span>AI-Powered Study Assistant</span>
          </div>

          {/* Main Headline with Staggered Animation */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1]">
            <span className="block bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              Transform Your Lectures Into
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-fadeInUpShimmer" style={{ animationDelay: "0.2s" }}>
              Exam-Ready Materials
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            Upload a lecture and instantly get notes, summaries, exam questions,
            and an intelligent doubt-solving chatbot — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/login?next=/app"
              className="group relative px-8 py-4 rounded-xl font-semibold text-lg
                bg-gradient-to-r from-purple-600 to-indigo-600
                text-white
                shadow-lg shadow-purple-500/40
                hover:shadow-xl hover:shadow-purple-500/60
                transform hover:scale-105 active:scale-95
                transition-all duration-300
                flex items-center justify-center gap-2 overflow-hidden"
            >
              <Upload size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-lg
              border border-white/10 hover:border-white/20
              backdrop-blur-xl
              transform hover:scale-105 active:scale-95
              transition-all duration-300
              shadow-lg hover:shadow-xl">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-default">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-default">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-gray-300">10k+ Students</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-default">
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
              <span className="text-sm font-semibold text-gray-300">4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute top-32 left-10 w-20 h-20 border-2 border-purple-500/20 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute bottom-32 right-10 w-32 h-32 border-2 border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 border border-purple-500/20 rounded-lg animate-spin-slow" />
        <div className="absolute bottom-1/3 left-16 w-24 h-24 border border-blue-500/20 rounded-lg animate-spin-reverse" />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Ace Your Exams
          </h2>
          <p className="text-gray-400 text-lg">
            Powered by advanced AI to help you study smarter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {[
            {
              icon: BookOpen,
              title: "Smart Summaries",
              text: "Concise, comprehensive summaries in seconds",
              gradient: "from-purple-500 to-purple-600",
            },
            {
              icon: FileAudio,
              title: "Detailed Notes",
              text: "Well-structured notes ready for revision",
              gradient: "from-indigo-500 to-indigo-600",
            },
            {
              icon: CheckCircle,
              title: "Exam Questions",
              text: "AI-generated questions tailored to your lecture",
              gradient: "from-blue-500 to-blue-600",
            },
            {
              icon: MessageSquare,
              title: "AI Chatbot",
              text: "Instant answers to doubts from your content",
              gradient: "from-purple-600 to-indigo-600",
            },
          ].map(({ icon: Icon, title, text, gradient }, i) => (
            <div
              key={title}
              className="group relative p-6 rounded-2xl 
                bg-white/5 backdrop-blur-xl
                border border-white/10
                hover:border-purple-500/50
                hover:bg-white/[0.07]
                hover:shadow-2xl hover:shadow-purple-500/20
                transform hover:scale-105 hover:-translate-y-2
                transition-all duration-500 cursor-pointer
                overflow-hidden"
              style={{
                animationDelay: `${i * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Icon */}
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} 
                flex items-center justify-center mb-4
                shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-6
                transition-all duration-500`}
              >
                <Icon className="text-white" size={24} strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-semibold mb-2 text-white">
                {title}
              </h3>
              <p className="relative text-gray-400">
                {text}
              </p>

              {/* Decorative corner gradient */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-24 bg-white/[0.02] rounded-3xl">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold uppercase tracking-wider">
            Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Three simple steps to supercharge your studying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
          {[
            "Upload your lecture audio or transcript",
            "AI analyzes and structures the content",
            "Receive an exam-ready study pack",
          ].map((step, i) => (
            <div key={i} className="group relative">
              {/* Connecting line (desktop only) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500/50 via-purple-500/30 to-transparent" />
              )}

              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 
                rounded-2xl flex items-center justify-center mx-auto mb-6
                shadow-2xl shadow-purple-600/30
                group-hover:scale-110 group-hover:rotate-6
                transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative text-3xl font-bold">{i + 1}</span>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors duration-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-90 bg-[length:200%_auto] animate-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          {/* Floating glow orbs */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />

          <div className="relative px-8 py-16 md:px-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your
              <br />
              Study Experience?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with AI
            </p>
            <Link
              to="/login?next=/app"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg 
                hover:bg-purple-50 transition-all shadow-2xl 
                hover:scale-105 active:scale-95 duration-300"
            >
              Start Learning Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Matching App Page */}
      <footer className="relative mt-10 overflow-hidden border-t border-white/5">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-6 py-16 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  LectureHacks
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering students worldwide with AI-powered learning tools. Transform your lectures into comprehensive study materials in seconds.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Made with</span>
                <Heart size={14} className="text-red-500 animate-pulse" fill="currentColor" />
                <span>for students everywhere</span>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "How it Works", href: "#how" },
                  { label: "API Access", href: "#api" },
                  { label: "Integrations", href: "#integrations" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Blog", href: "#blog" },
                  { label: "Careers", href: "#careers" },
                  { label: "Press Kit", href: "#press" },
                  { label: "Contact", href: "#contact" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-px left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Stay Updated
              </h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates, study tips, and exclusive features delivered to your inbox.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg
                      bg-white/5 border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition-all text-white placeholder-gray-500
                      backdrop-blur-xl"
                  />
                  <button className="px-5 py-2.5 rounded-lg font-medium text-sm
                    bg-gradient-to-r from-purple-600 to-indigo-600
                    hover:from-purple-500 hover:to-indigo-500
                    text-white shadow-lg shadow-purple-500/30
                    hover:shadow-xl hover:shadow-purple-500/40
                    transform hover:scale-105 active:scale-95
                    transition-all duration-300">
                    Join
                  </button>
                </div>

                {/* Social Icons */}
                <div className="pt-4">
                  <p className="text-sm text-gray-500 mb-3">Follow us</p>
                  <div className="flex gap-3">
                    {[
                      { Icon: Github, href: "https://github.com" },
                      { Icon: Twitter, href: "https://twitter.com" },
                      { Icon: Linkedin, href: "https://linkedin.com" },
                      { Icon: Instagram, href: "https://instagram.com" },
                    ].map(({ Icon, href }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-10 h-10 rounded-lg
                          bg-white/5 border border-white/10
                          hover:bg-purple-600 hover:border-purple-500
                          flex items-center justify-center
                          text-gray-400 hover:text-white
                          transform hover:scale-110 hover:-translate-y-1 hover:rotate-6
                          transition-all duration-300
                          shadow-sm hover:shadow-lg hover:shadow-purple-600/30"
                      >
                        <Icon size={18} className="relative z-10" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} LectureHacks. All rights reserved. Empowering learners worldwide.
              </p>
              <div className="flex gap-8 text-sm">
                <a href="#privacy" className="text-gray-500 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-gray-500 hover:text-purple-400 transition-colors">
                  Terms of Service
                </a>
                <a href="#cookies" className="text-gray-500 hover:text-purple-400 transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUpShimmer {
          0% {
            opacity: 0;
            transform: translateY(20px);
            background-position: 0% 50%;
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            background-position: 200% 50%;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUpShimmer {
          animation: fadeInUpShimmer 3s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 8s ease infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}