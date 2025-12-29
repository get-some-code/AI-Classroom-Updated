import React from "react";
import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 grid grid-cols-3 items-center">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-2 justify-self-start">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Prep Hub</span>
          </div>

          {/* CENTER: Nav Links (TRUE CENTER) */}
          <div className="hidden md:flex items-center justify-center gap-8 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-400"
                  : "text-slate-300 hover:text-white transition"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-400"
                  : "text-slate-300 hover:text-white transition"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-400"
                  : "text-slate-300 hover:text-white transition"
              }
            >
              Services
            </NavLink>
          </div>

          {/* RIGHT: CTA */}
          <div className="justify-self-end">
            <Link
              to="/app"
              className="
          px-5 py-2.5 rounded-xl
          bg-indigo-600 hover:bg-indigo-700
          text-white text-sm font-semibold
          shadow-lg shadow-indigo-600/30
          transition-all
          hover:scale-[1.03]
          active:scale-95
        "
            >
              Login
            </Link>
          </div>

        </div>
      </nav>


      {/* Hero Section */}
      <section className="container mx-auto px-6 py-15 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block mb-6 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
            AI-Powered Study Assistant
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent leading-tight">
            Transform Your Lectures Into
            <br />
            Exam-Ready Materials
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Upload a lecture and instantly get notes, summaries, exam questions,
            and an intelligent doubt-solving chatbot — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/40 flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Get Started Free
            </Link>
            <button className="px-8 py-4 bg-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-600 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-2">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Ace Your Exams
          </h2>
          <p className="text-gray-400 text-lg">
            Powered by advanced AI to help you study smarter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: BookOpen,
              title: "Smart Summaries",
              text: "Concise, comprehensive summaries in seconds",
            },
            {
              icon: FileAudio,
              title: "Detailed Notes",
              text: "Well-structured notes ready for revision",
            },
            {
              icon: CheckCircle,
              title: "Exam Questions",
              text: "AI-generated questions tailored to your lecture",
            },
            {
              icon: MessageSquare,
              title: "AI Chatbot",
              text: "Instant answers to doubts from your content",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all"
            >
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20 bg-slate-800/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Three simple steps to supercharge your studying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {[
            "Upload your lecture audio or transcript",
            "AI analyzes and structures the content",
            "Receive an exam-ready study pack",
          ].map((step, i) => (
            <div key={i}>
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {i + 1}
              </div>
              <p className="text-gray-400">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xl font-bold mb-4">
            <Sparkles className="text-purple-400" />
            <span>Prepare Hub</span>
          </div>

          <p className="text-gray-400 text-sm mb-6 max-w-xl">
            Turn lectures into clear notes, exam-ready questions, and an
            intelligent study assistant.
          </p>

          <div className="flex gap-4 mb-8">
            {[Github, Linkedin, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800 text-sm text-gray-400 flex flex-col md:flex-row justify-between gap-4">
            <span>© {new Date().getFullYear()} Prepare Hub</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}