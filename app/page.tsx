"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // SESUAIKAN KATA RAHASIA KALIAN DI SINI
    if (password.toLowerCase().trim() === "wildatun aribah") {
      localStorage.setItem("authenticated", "true");
      router.push("/game");
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-pastel-blue p-4 font-sans text-gray-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-lemon-yellow p-8 rounded-3xl shadow-2xl text-center border-4 border-white/60"
      >
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }} 
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="flex justify-center mb-6 text-coral-pink"
        >
          <Heart size={56} fill="currentColor" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2 text-coral-pink tracking-wide">
          Ruang Memori Rahasia
        </h1>
        <p className="text-sm mb-8 text-gray-700 leading-relaxed">
          Satu tempat khusus yang dibuat dengan penuh hangat. Masukkan kata rahasia kita untuk membuka kadonya ya...
          clue "2 kata, Perempuan Cantik"
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata rahasia..."
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-coral-pink/40 bg-white focus:outline-none focus:border-coral-pink text-center font-medium shadow-inner transition-all text-gray-800"
            />
            <Lock className="absolute right-4 top-4 text-coral-pink/50" size={18} />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs font-semibold bg-white/80 py-1.5 px-3 rounded-lg border border-red-200"
            >
              Hayo, masa gatau sih? Coba ingat lagi hehe...
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full py-3.5 bg-coral-pink text-white rounded-2xl font-bold tracking-wider shadow-lg hover:brightness-105 transition-all mt-2 text-base flex items-center justify-center gap-2"
          >
            <span>Masuk ke Asmaraloka</span> 🎁
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}