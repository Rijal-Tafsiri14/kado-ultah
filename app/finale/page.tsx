"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Heart, Wind } from "lucide-react";

export default function FinalePage() {
  const [candleLit, setCandleLit] = useState(true);
  const [showFarewell, setShowFarewell] = useState(false);
  const router = useRouter();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  
  // Ref untuk menghitung durasi tiupan
  const blowCountRef = useRef<number>(0); 

  // Setup Web Audio API untuk deteksi tiupan Mic
  useEffect(() => {
    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 256;
        microphone.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        detectBlow();
      } catch (err) {
        console.log("Mic access denied or error, fallback to click method.", err);
      }
    };

    if (candleLit) {
      startMic();
    }

    return () => {
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candleLit]);

  // Fungsi membaca volume/desibel mic
  const detectBlow = () => {
    if (!analyserRef.current || !candleLit) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;

    // SENSITIVITAS DITURUNKAN: threshold 45 & durasi 6 frame biar gampang ditiup santai
    if (average > 45) {
      blowCountRef.current += 1;
      
      if (blowCountRef.current > 6) {
        handleBlowOut();
      } else {
        requestRef.current = requestAnimationFrame(detectBlow);
      }
    } else {
      if (blowCountRef.current > 0) blowCountRef.current -= 1;
      requestRef.current = requestAnimationFrame(detectBlow);
    }
  };

  // Fungsi mematikan lilin
  const handleBlowOut = () => {
    if (!candleLit) return;
    setCandleLit(false);
    if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
    
    // Tembak Confetti dengan palet warna kita!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ADC1FF', '#FBF0A6', '#FF889A']
    });

    // Munculkan pesan terakhir lalu Auto Logout ke Halaman Awal
    setTimeout(() => {
      setShowFarewell(true);
      setTimeout(() => {
        localStorage.removeItem("authenticated");
        router.push("/");
      }, 7000); 
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-pastel-blue py-10 px-4 flex flex-col items-center justify-center font-sans text-gray-800 relative overflow-hidden">
      
      {!showFarewell ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl w-full bg-lemon-yellow p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-white/80 flex flex-col items-center text-center relative z-10"
        >
          <Heart size={48} className="text-coral-pink mb-6 animate-pulse" fill="currentColor" />
          
          <h1 className="text-2xl md:text-3xl font-bold text-coral-pink mb-6">
            Buat Lu yang Paling Spesial,
          </h1>
          
          <div className="space-y-4 text-gray-700 leading-relaxed font-medium md:text-lg italic">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
              Selamat bertambah umur buat orang yang belakangan ini selalu ngerubah mood gua jadi lebih baik.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
              Jujur, gua bersyukur banget kita bisa sedeket ini sekarang. Makasih ya udah selalu ada buat dengerin cerita gua,dan bikin hari-hari gua jauh lebih seru. You mean a lot to me, beneran deh.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 1 }}>
              Selamat bertambah umur ya. Terus jadi diri lu yang sekarang, yang selalu punya cara buat bikin senyum. Semoga semua hal baik selalu nyari jalan buat nemuin lu.
            </motion.p>
          </div>

          {/* Wrapper Kue 2 Tingkat */}
          <div className="mt-28 mb-10 relative flex flex-col items-center">
            
            {/* Lilin & Api */}
            <div className="absolute -top-24 z-30 flex flex-col items-center">
              
              <div className="h-11 w-10 flex justify-center items-end">
                <AnimatePresence>
                  {candleLit && (
                    <motion.div
                      exit={{ opacity: 0, scale: 0, y: 10 }}
                      onClick={handleBlowOut}
                      className="w-6 h-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-100 rounded-full cursor-pointer shadow-[0_0_20px_#FBF0A6] animate-[flicker_1s_infinite] mb-1"
                      style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Tali Sumbu */}
              <div className="w-1 h-3 bg-gray-700 rounded-t-sm" />
              
              {/* Batang Lilin Motif Garis */}
              <div 
                className="w-4 h-14 rounded-sm border border-coral-pink/30 shadow-sm" 
                style={{ backgroundImage: "repeating-linear-gradient(45deg, white, white 5px, #FF889A 5px, #FF889A 10px)" }} 
              />
            </div>

            {/* Kue Tingkat Atas */}
            <div className="w-32 h-16 bg-white rounded-t-xl rounded-b-sm relative z-20 shadow-inner flex justify-center border-x-2 border-t-2 border-coral-pink/10">
              <div className="absolute top-0 w-full h-5 bg-coral-pink rounded-t-xl flex justify-around">
                 <div className="w-4 h-8 bg-coral-pink rounded-b-full"></div>
                 <div className="w-6 h-10 bg-coral-pink rounded-b-full translate-y-1"></div>
                 <div className="w-5 h-7 bg-coral-pink rounded-b-full"></div>
                 <div className="w-4 h-9 bg-coral-pink rounded-b-full"></div>
              </div>
            </div>

            {/* Kue Tingkat Bawah */}
            <div className="w-48 h-20 bg-lemon-yellow rounded-t-sm rounded-b-2xl relative z-10 shadow-lg border-x-2 border-b-2 border-coral-pink/20 flex justify-center">
               <div className="absolute top-0 w-full h-6 bg-white flex justify-around">
                 <div className="w-6 h-10 bg-white rounded-b-full shadow-sm"></div>
                 <div className="w-8 h-12 bg-white rounded-b-full translate-y-2 shadow-sm"></div>
                 <div className="w-7 h-9 bg-white rounded-b-full shadow-sm"></div>
                 <div className="w-6 h-11 bg-white rounded-b-full shadow-sm"></div>
                 <div className="w-7 h-10 bg-white rounded-b-full translate-y-1 shadow-sm"></div>
              </div>
            </div>

            {/* Piring Kue */}
            <div className="w-64 h-8 bg-white/60 backdrop-blur-sm rounded-[50%] absolute -bottom-4 z-0 shadow-xl border-b-4 border-gray-300" />
            
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 5 }}
            className="mt-8 flex flex-col items-center text-coral-pink/80 font-semibold"
          >
            <Wind size={24} className="mb-2 animate-bounce" />
            <p className="text-sm">Dekatkan mic, lalu tiup santai mic-nya...</p>
            <p className="text-xs font-normal opacity-70 mt-1">(Atau klik api lilinnya jika anginmu tak sampai)</p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-20 flex flex-col items-center"
        >
          <Heart size={64} className="text-coral-pink mb-4" fill="currentColor" />
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md mb-2">
            Makasih Udah Selalu Ada.
          </h2>
          <p className="text-lemon-yellow font-medium text-lg">
            Sampai ketemu di cerita-cerita kita berikutnya...
          </p>
        </motion.div>
      )}

      {/* Global Style untuk animasi lilin */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.1) rotate(-3deg); opacity: 0.9; }
          50% { transform: scale(0.9) rotate(3deg); opacity: 1; }
          75% { transform: scale(1.05) rotate(-1deg); opacity: 0.8; }
        }
      `}} />
    </main>
  );
}