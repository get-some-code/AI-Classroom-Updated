import { supabase } from "../services/supabase";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const next = searchParams.get("next") || "/app";

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(next, { replace: true });
    }
  }, [user, navigate, next]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
    // redirect happens via auth state change
  };

  const loginWithEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      navigate(next, { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#101a2f] to-[#0b1220] flex items-center justify-center">
      
      {/* BACKGROUND GLOW ORBS */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl px-8 py-10">

          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              LectureHacks
            </h1>
            <p className="text-slate-300 mt-2 text-sm">
              Welcome back. Let’s continue learning smarter.
            </p>
          </motion.div>

          {/* GOOGLE LOGIN */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3
              bg-white text-slate-900 rounded-xl py-3 font-semibold
              shadow-lg hover:shadow-xl transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.8 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1C9.4 39.7 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.4 5.5-6.3 7.1l6.2 5.2C38.7 36.9 44 31.7 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-xs text-slate-400 uppercase">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* EMAIL LOGIN */}
          <form onSubmit={loginWithEmail} className="space-y-4">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="w-full rounded-xl bg-white/10 border border-white/20
                px-4 py-3 text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <motion.input
              whileFocus={{ scale: 1.02 }}
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-xl bg-white/10 border border-white/20
                px-4 py-3 text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600
                py-3 font-semibold text-white shadow-lg hover:shadow-xl transition"
            >
              Log in
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}