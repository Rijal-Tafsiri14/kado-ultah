"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, ArrowRight, PartyPopper, Play, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memoryLevels } from "@/data/memories";

interface CardItem {
  instanceId: string;
  originalId: string;
  imageUrl: string;
  caption: string;
}

export default function GamePage() {
  const router = useRouter();
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [activeMemory, setActiveMemory] = useState<{ imageUrl: string; caption: string } | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // State untuk alur Pop-up awal
  const [hasStarted, setHasStarted] = useState<boolean>(false); 
  const [showTutorial, setShowTutorial] = useState<boolean>(false); 

  const currentLevel = memoryLevels[currentLevelIdx];
  
  // Audio Refs
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const matchAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handler klik tombol "Mulai Petualangan" di awal
  const handleStartGameAudio = () => {
    setHasStarted(true);
    setShowTutorial(true); 

    // Nyalakan BGM dan pancing audio effects biar aktif
    if (bgmRef.current) {
      bgmRef.current.volume = 0.3;
      bgmRef.current.play().catch(() => {});
    }
    if (flipAudioRef.current) {
      flipAudioRef.current.volume = 0.5;
      flipAudioRef.current.play().then(() => flipAudioRef.current?.pause()).catch(() => {});
    }
    if (matchAudioRef.current) {
      matchAudioRef.current.volume = 0.6;
      matchAudioRef.current.play().then(() => matchAudioRef.current?.pause()).catch(() => {});
    }
  };

  useEffect(() => {
    if (!currentLevel) return;
    const duplicatedCards: CardItem[] = [];
    currentLevel.cards.forEach((card) => {
      duplicatedCards.push({ instanceId: `${card.id}-a`, originalId: card.id, imageUrl: card.imageUrl, caption: card.caption });
      duplicatedCards.push({ instanceId: `${card.id}-b`, originalId: card.id, imageUrl: card.imageUrl, caption: card.caption });
    });

    const shuffled = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedIds([]);
    setIsLevelComplete(false);
  }, [currentLevelIdx]);

  const handleCardClick = (index: number) => {
    if (!hasStarted || flippedCards.length === 2 || flippedCards.includes(index) || matchedIds.includes(cards[index].originalId)) return;

    // Play Suara Flip
    if (flipAudioRef.current) {
      flipAudioRef.current.currentTime = 0;
      flipAudioRef.current.play().catch(() => {});
    }

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.originalId === card2.originalId) {
        setTimeout(() => {
          // Play Suara Finish / Match
          if (matchAudioRef.current) {
            matchAudioRef.current.currentTime = 0;
            matchAudioRef.current.play().catch(() => {});
          }

          setMatchedIds((prev) => [...prev, card1.originalId]);
          setActiveMemory({ imageUrl: card1.imageUrl, caption: card1.caption });
          setFlippedCards([]);

          if (matchedIds.length + 1 === currentLevel.cards.length) {
            setIsLevelComplete(true);
          }
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1200);
      }
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIdx + 1 < memoryLevels.length) {
      setCurrentLevelIdx((prev) => prev + 1);
    } else {
      setIsTransitioning(true);
      if (bgmRef.current) {
        let vol = bgmRef.current.volume;
        const fadeOut = setInterval(() => {
          if (vol > 0.05) {
            vol -= 0.05;
            if (bgmRef.current) bgmRef.current.volume = vol;
          } else {
            clearInterval(fadeOut);
            if (bgmRef.current) bgmRef.current.pause();
          }
        }, 150);
      }
      setTimeout(() => {
        router.push("/finale");
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-pastel-blue py-8 px-4 font-sans text-gray-800 flex flex-col items-center relative overflow-x-hidden">
      
      {/* Audio Elements dengan joe.mpeg */}
      <audio ref={bgmRef} src="/audio/joe.mpeg" loop preload="auto" />
      <audio ref={flipAudioRef} src="/audio/flip.mp3" preload="auto" />
      <audio ref={matchAudioRef} src="/audio/finish.mp3" preload="auto" />

      {/* POP-UP 1: WELCOME SCREEN */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-lemon-yellow p-8 md:p-10 rounded-3xl max-w-md w-full text-center border-4 border-white shadow-2xl flex flex-col items-center"
            >
              <Heart size={56} className="text-coral-pink mb-4 animate-bounce" fill="currentColor" />
              <h2 className="text-2xl font-bold text-coral-pink mb-2">
                Waktunya Nostalgia ✨
              </h2>
              <p className="text-gray-700 text-sm md:text-base mb-8 leading-relaxed">
                Sebelum mulai main, nyalakan musik dan suasananya biar makin seru ya.
              </p>
              <button
                onClick={handleStartGameAudio}
                className="w-full py-4 bg-coral-pink text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-base flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                <span>Mulai Petualangan</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POP-UP 2: TUTORIAL SINGKAT */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-lemon-yellow p-8 md:p-10 rounded-3xl max-w-md w-full text-center border-4 border-white shadow-2xl flex flex-col items-center"
            >
              <HelpCircle size={56} className="text-coral-pink mb-4" />
              <h2 className="text-2xl font-bold text-coral-pink mb-2">
                Cara Mainnya Gampang Kok!
              </h2>
              <p className="text-gray-700 text-sm md:text-base mb-8 leading-relaxed">
                Buka kartu satu per satu, cari pasangan foto yang sama, dan baca memori seru di setiap kecocokannya. Selesaikan semua levelnya ya! 🧩
              </p>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full py-4 bg-coral-pink text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-base"
              >
                Siap, Yuk Main! ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-lemon-yellow/80 backdrop-blur px-6 py-3 rounded-2xl shadow-md border-2 border-white/60">
        <div className="flex items-center gap-2 text-coral-pink font-bold text-lg">
          <Heart fill="currentColor" size={24} />
          <span>Level {currentLevelIdx + 1} dari {memoryLevels.length}</span>
        </div>

        <h2 className="hidden md:block font-bold text-gray-700 text-sm tracking-wide">
          {currentLevel.title}
        </h2>

        <div className="text-xs font-bold text-coral-pink bg-white px-3 py-1.5 rounded-xl shadow-sm">
          🎵 Musik Aktif
        </div>
      </div>

      {/* Grid Kartu Game */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-4">
        <motion.div 
          key={currentLevelIdx} 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className={`grid gap-4 w-full justify-center ${
            currentLevel.cards.length <= 4 
              ? "grid-cols-2 sm:grid-cols-4" 
              : currentLevel.cards.length <= 6 
              ? "grid-cols-3 sm:grid-cols-4" 
              : "grid-cols-4 sm:grid-cols-4"
          }`}
        >
          {cards.map((card, idx) => {
            const isFlipped = flippedCards.includes(idx) || matchedIds.includes(card.originalId);
            const isMatched = matchedIds.includes(card.originalId);

            return (
              <motion.div
                key={card.instanceId}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
                }}
                whileHover={{ scale: isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(idx)}
                className="h-32 sm:h-40 md:h-44 aspect-[3/4] cursor-pointer perspective-1000"
              >
                <div
                  className={`w-full h-full relative rounded-2xl transition-all duration-500 transform-style-3d shadow-lg border-3 ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <div className="absolute inset-0 w-full h-full bg-lemon-yellow rounded-2xl flex flex-col items-center justify-center border-4 border-white backface-hidden shadow-md">
                    <Heart size={36} className="text-coral-pink/70 mb-1" fill="currentColor" />
                    <Sparkles size={16} className="text-coral-pink/40 animate-pulse" />
                  </div>

                  <div className="absolute inset-0 w-full h-full bg-white rounded-2xl overflow-hidden rotate-y-180 backface-hidden border-4 border-coral-pink flex items-center justify-center">
                    <img src={card.imageUrl} alt="Memory" className="w-full h-full object-cover" />
                    {isMatched && (
                      <div className="absolute inset-0 bg-coral-pink/20 backdrop-blur-[1px] flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.6 }}
                        >
                          <Heart className="text-white drop-shadow-md" size={32} fill="currentColor" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Pop-up Modal Foto Memori */}
      <AnimatePresence>
        {activeMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-lemon-yellow p-6 sm:p-8 rounded-3xl max-w-md w-full text-center border-4 border-white shadow-2xl relative"
            >
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden mb-5 border-4 border-white shadow-md">
                <img src={activeMemory.imageUrl} alt="Memory Detail" className="w-full h-full object-cover" />
              </div>
              <p className="text-gray-800 font-medium text-base sm:text-lg mb-6 leading-relaxed italic">
                "{activeMemory.caption}"
              </p>
              <button
                onClick={() => setActiveMemory(null)}
                className="w-full py-3.5 bg-coral-pink text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all text-base"
              >
                Simpan Memori Ini ✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Selesai Level */}
      <AnimatePresence>
        {isLevelComplete && !activeMemory && !isTransitioning && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 bg-lemon-yellow border-4 border-white p-6 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-40 max-w-lg w-full"
          >
            <div className="flex items-center gap-3 text-coral-pink">
              <PartyPopper size={36} />
              <div>
                <h3 className="font-bold text-lg">Babak Ini Selesai! 🎉</h3>
                <p className="text-xs text-gray-700">Semua memori di babak ini udah kebuka.</p>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full sm:w-auto px-6 py-3 bg-coral-pink text-white font-bold rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 whitespace-nowrap ml-auto"
            >
              <span>{currentLevelIdx + 1 < memoryLevels.length ? "Lanjut Level Berikutnya" : "Buka Surat Rahasia"}</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Transisi Dramatis ke Finale */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-pastel-blue flex items-center justify-center flex-col"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Heart size={80} className="text-coral-pink animate-pulse" fill="currentColor" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 text-coral-pink font-bold text-xl tracking-widest"
            >
              Menyiapkan sesuatu untukmu...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}