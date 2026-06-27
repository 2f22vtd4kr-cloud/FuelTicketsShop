import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const textTop = ["Т", "О", "П"];
  const textLivo = ["л", "и", "в", "о"];
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 1500);
    const autoTimer = setTimeout(() => onComplete(), 4500);
    return () => { clearTimeout(skipTimer); clearTimeout(autoTimer); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center justify-center text-[15vh] font-black leading-none tracking-tighter">
        {textTop.map((char, i) => (
          <motion.span
            key={`top-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="bg-gradient-to-b from-[#EF4444] to-[#EC4899] text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          >
            {char}
          </motion.span>
        ))}
        {textLivo.map((char, i) => (
          <motion.span
            key={`livo-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (textTop.length + i) * 0.2, duration: 0.5 }}
            className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {char}
          </motion.span>
        ))}
      </div>

      <AnimatePresence>
        {showSkip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-10 right-8"
          >
            <Button
              variant="ghost"
              className="text-white/50 hover:text-white glass-panel"
              onClick={onComplete}
            >
              Пропустить
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
