"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { Card } from "@/types";
import { Rating } from "@/lib/sm2";

interface FlashcardProps {
  card: Card;
  onRate: (rating: Rating) => void;
}

export default function Flashcard({ card, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Tinder Swipe Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]);
  const controls = useAnimation();

  // Mouse Parallax Physics wrapper
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Slight tilt constraints based on cursor offset
    x.set(mouseX * 0.05);
    y.set(mouseY * 0.05);
  };

  const handleMouseLeave = () => {
    if (isFlipped) return;
    x.set(0);
    y.set(0);
  };

  const triggerSwipe = async (direction: "left" | "right" | "down", rating: Rating) => {
    const targetX = direction === "left" ? -400 : direction === "right" ? 400 : 0;
    const targetY = direction === "down" ? 400 : 0;
    
    await controls.start({
      x: targetX,
      y: targetY,
      rotate: direction === "left" ? -30 : direction === "right" ? 30 : 0,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    });
    onRate(rating);
  };

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > 150 || velocity > 500) {
      await triggerSwipe("right", "easy");
    } else if (offset < -150 || velocity < -500) {
      await triggerSwipe("left", "again");
    } else if (info.offset.y > 150 || info.velocity.y > 500) {
      await triggerSwipe("down", "hard");
    } else {
      // Snap back if threshold not met
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
    }
  };

  const handleRate = (rating: Rating) => {
    if (rating === "easy") triggerSwipe("right", rating);
    if (rating === "again") triggerSwipe("left", rating);
    if (rating === "hard") triggerSwipe("down", rating);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div 
        className="w-full h-[400px] perspective-1000"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full relative cursor-grab active:cursor-grabbing transform-style-3d"
          drag={isFlipped ? "x" : false}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          style={{ x, y, rotate, opacity, scale }}
          animate={controls}
          initial={{ x: 0, y: -50, opacity: 0, rotate: 0 }}
          whileInView={{ y: 0, opacity: 1, transition: { type: "spring" } }}
        >
          <motion.div
            className="w-full h-full absolute transform-style-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {/* Front Card (Brutalist style) */}
            <div className="absolute w-full h-full backface-hidden bg-surface border-4 border-foreground flex flex-col justify-center items-center text-center shadow-[8px_8px_0px_var(--color-foreground)] hover:shadow-[12px_12px_0px_var(--color-foreground)] transition-shadow">
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wLDBIMHYxSDZaIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] pointer-events-none"></div>
              
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center border-b-2 border-foreground pb-2">
                <span className="text-sm font-bold uppercase tracking-widest bg-foreground text-background px-3 py-1">
                  Q
                </span>
                {card.topic && (
                  <span className="px-3 py-1 bg-primary border-2 border-foreground text-foreground text-xs font-bold uppercase truncate max-w-[200px]">
                    {card.topic}
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-none uppercase p-8 break-words text-foreground">
                {card.front}
              </h2>
              <div className="absolute bottom-6 px-6 py-2 border-2 border-foreground bg-coral text-foreground text-xs font-bold uppercase animate-pulse">
                Click to reveal
              </div>
            </div>

            {/* Back Card */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-surface border-4 border-foreground p-8 flex flex-col text-left shadow-[8px_8px_0px_var(--color-foreground)]">
              <span className="absolute top-4 right-4 text-xs font-bold bg-primary text-foreground border-2 border-foreground px-2 py-1 uppercase tracking-wider">
                A
              </span>
              <div className="mt-8 flex-grow overflow-y-auto pr-4 scrollbar-brutalist">
                <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-foreground whitespace-pre-wrap">
                  {card.back}
                </h3>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Swipe Controls */}
      <div 
        className={`w-full mt-12 grid grid-cols-3 gap-6 transition-all duration-300 ${
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleRate("again"); }}
          className="relative group border-4 border-foreground bg-surface py-4 hover:bg-danger transition-colors hover:shadow-[4px_4px_0px_var(--color-danger)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-danger -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-3xl mb-1 group-hover:-rotate-12 transition-transform">😰</span>
            <span className="font-black uppercase tracking-tighter">Swipe Left</span>
            <span className="text-xs font-bold uppercase px-2 bg-foreground text-background mt-2">&lt; 10m</span>
          </div>
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); handleRate("hard"); }}
          className="relative group border-4 border-foreground bg-surface py-4 hover:bg-warning transition-colors hover:shadow-[4px_4px_0px_var(--color-warning)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-warning translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">😐</span>
            <span className="font-black uppercase tracking-tighter">Swipe Down</span>
            <span className="text-xs font-bold uppercase px-2 bg-foreground text-background mt-2">1d</span>
          </div>
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); handleRate("easy"); }}
          className="relative group border-4 border-foreground bg-surface py-4 hover:bg-success transition-colors hover:shadow-[4px_4px_0px_var(--color-success)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-success translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-3xl mb-1 group-hover:rotate-12 transition-transform">😊</span>
            <span className="font-black uppercase tracking-tighter">Swipe Right</span>
            <span className="text-xs font-bold uppercase px-2 bg-foreground text-background mt-2">4d</span>
          </div>
        </button>
      </div>
    </div>
  );
}
