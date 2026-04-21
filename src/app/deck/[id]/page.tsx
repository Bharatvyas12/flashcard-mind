"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Flashcard from "@/components/Flashcard";
import { WeakTopics } from "@/components/WeakTopics";
import ConfettiEffect from "@/components/ConfettiEffect";
import { Card, Deck } from "@/types";
import { Rating } from "@/lib/sm2";

export default function PracticeMode({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const deckId = unwrappedParams.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  
  // Track ratings for insight generation at the end
  const [sessionRatings, setSessionRatings] = useState({ easy: 0, hard: 0, again: 0 });

  useEffect(() => {
    fetchData();
  }, [deckId]);

  const fetchData = async () => {
    try {
      // Intercept mock preview mode locally if no DB is configured
      if (deckId === "mock-deck-id") {
        const storedCards = localStorage.getItem("mock_cards");
        const storedName = localStorage.getItem("mock_deck_name");
        if (storedCards) {
          const parsed = JSON.parse(storedCards).map((c: any, i: number) => ({ ...c, id: `mock-${i}` }));
          setCards(parsed);
          setDeck({ id: "mock-deck-id", name: storedName || "Mock Deck Preview", card_count: parsed.length, created_at: new Date().toISOString(), last_studied: new Date().toISOString() });
          setLoading(false);
          return;
        }
      }

      // Parallel fetch deck info and cards
      const [decksRes, cardsRes] = await Promise.all([
        fetch("/api/decks"), // To find our deck info
        fetch(`/api/cards/${deckId}?due=true`), // Only due cards
      ]);
      
      const decksData = await decksRes.json();
      const cardsData = await cardsRes.json();
      
      const currentDeck = decksData.decks?.find((d: Deck) => d.id === deckId);
      if (currentDeck) setDeck(currentDeck);
      
      if (cardsData.cards) {
        // If no due cards, fetch all cards for preview/study mode
        if (cardsData.cards.length === 0) {
          const allCardsRes = await fetch(`/api/cards/${deckId}`);
          const allCardsData = await allCardsRes.json();
          setCards(allCardsData.cards || []);
        } else {
          setCards(cardsData.cards);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: Rating) => {
    if (!cards[currentIndex]) return;
    
    // Track stats for this session
    setSessionRatings(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    
    // Optimistically update UI by moving to the next card safely
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= cards.length) {
        finishSession();
        return prev; // Stay at the end safely
      }
      return nextIndex;
    });

    try {
      // Send update to server (fire and forget)
      if (deckId !== "mock-deck-id") {
        await fetch(`/api/cards/${deckId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: cards[currentIndex].id, rating }),
        });
      }
    } catch (err) {
      console.error("Failed to update rating:", err);
    }
  };

  const finishSession = () => {
    setSessionComplete(true);
    
    // Calculate weak topics based on cards rated "again" or "hard" in this session
    // (In a real app, you'd aggregate this properly per card)
    const topicsList = cards.map(c => c.topic).filter(Boolean) as string[];
    const uniqueTopics = [...new Set(topicsList)];
    // Randomly select 1-2 topics as "weak" for demonstration if we had any tough ratings
    if (sessionRatings.again > 0 || sessionRatings.hard > 0) {
      setWeakTopics(uniqueTopics.slice(0, Math.min(2, uniqueTopics.length)));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="w-16 h-16 border-4 border-surface border-t-primary rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  const progressPercent = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  return (
    <>
      <Navbar />
      <ConfettiEffect fire={sessionComplete} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-grow flex flex-col">
        <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 mb-8 inline-flex">
          <span>←</span> Back to Dashboard
        </Link>
        
        {sessionComplete ? (
          <div className="bg-surface border border-surface-hover rounded-3xl p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold mb-4">Session Complete!</h1>
            <p className="text-xl text-foreground/70 mb-10">
              Great job practicing {cards.length} cards from <strong>{deck?.name}</strong>
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
              <div className="p-4 bg-success/10 rounded-2xl">
                <p className="text-success text-2xl font-bold">{sessionRatings.easy}</p>
                <p className="text-success/70 text-sm font-medium">Easy</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-2xl">
                <p className="text-warning text-2xl font-bold">{sessionRatings.hard}</p>
                <p className="text-warning/70 text-sm font-medium">Hard</p>
              </div>
              <div className="p-4 bg-danger/10 rounded-2xl">
                <p className="text-danger text-2xl font-bold">{sessionRatings.again}</p>
                <p className="text-danger/70 text-sm font-medium">Again</p>
              </div>
            </div>

            <div className="max-w-xl mx-auto mb-10 text-left">
              <WeakTopics topics={weakTopics} />
            </div>

            <Link href="/" className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:shadow-lg transition-all text-lg">
              Return to Dashboard
            </Link>
          </div>
        ) : cards.length > 0 ? (
          <div className="w-full">
            {/* Header & Progress */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-2xl font-bold">{deck?.name}</h1>
                <p className="text-foreground/50 text-sm">
                  Card {currentIndex + 1} of {cards.length}
                </p>
              </div>
              <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            
            <div className="w-full h-2 bg-surface rounded-full mb-12 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Flashcard Area */}
            {cards[currentIndex] && (
              <Flashcard 
                key={cards[currentIndex].id} // Force re-render on new card
                card={cards[currentIndex]} 
                onRate={handleRate} 
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">No cards found</h1>
            <p className="text-foreground/60 mb-8">This deck is missing cards or something went wrong.</p>
          </div>
        )}
      </main>
    </>
  );
}
