"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { WeakTopics } from "@/components/WeakTopics";
import { Card, Deck } from "@/types";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const deckId = unwrappedParams.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [deckId]);

  const fetchData = async () => {
    try {
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

      const [decksRes, cardsRes] = await Promise.all([
        fetch("/api/decks"),
        fetch(`/api/cards/${deckId}`),
      ]);
      
      const decksData = await decksRes.json();
      const cardsData = await cardsRes.json();
      
      const currentDeck = decksData.decks?.find((d: Deck) => d.id === deckId);
      if (currentDeck) setDeck(currentDeck);
      if (cardsData.cards) setCards(cardsData.cards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-2xl font-black uppercase animate-pulse border-4 border-foreground px-6 py-2 bg-primary">Loading Report</div>
        </main>
      </>
    );
  }

  // Analytics Math
  const totalCards = cards.length;
  // Simulated difficulty metrics for report (in a real app, query `interval` from sm2 algorithm)
  const mastered = cards.filter(c => (c.interval || 0) > 10).length;
  const learning = cards.filter(c => (c.interval || 0) >= 1 && (c.interval || 0) <= 10).length;
  const shaking = cards.filter(c => (c.interval || 0) < 1).length;

  const getDistinctTopics = () => {
    const list = cards.filter(c => (c.interval || 0) < 1).map(c => c.topic).filter(Boolean) as string[];
    return [...new Set(list)].slice(0, 3);
  };
  
  const weakTopics = getDistinctTopics();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-5xl flex-grow flex flex-col">
        <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 mb-8 inline-flex font-bold uppercase tracking-widest text-sm w-fit border-b-2 border-transparent hover:border-primary">
          <span>←</span> Back to Dashboard
        </Link>
        
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 pr-16 bg-foreground text-background inline-block px-4 py-2">
            Deck Analytics
          </h1>
          <h2 className="text-3xl font-bold italic text-foreground tracking-tight border-b-4 border-primary pb-4 inline-block w-full">
            {deck?.name}
          </h2>
        </div>

        {totalCards === 0 ? (
          <div className="border-4 border-foreground p-12 text-center bg-surface w-full shadow-[8px_8px_0px_var(--color-foreground)]">
            <h2 className="text-4xl font-black uppercase mb-4">No Data Found</h2>
            <p className="text-foreground/60 font-bold">This deck contains no cards to analyze.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Data Grid */}
            <div className="flex flex-col gap-8">
              
              {/* Geometric Mastery Chart */}
              <div className="border-4 border-foreground bg-surface p-6 shadow-[8px_8px_0px_var(--color-foreground)]">
                <h3 className="text-xl font-black uppercase tracking-widest mb-6 border-b-2 border-foreground pb-2">Cognitive Distribution</h3>
                
                <div className="flex w-full h-8 border-2 border-foreground mb-4">
                  <div style={{ width: `${(mastered / totalCards) * 100}%` }} className="bg-success transition-all border-r-2 border-foreground"></div>
                  <div style={{ width: `${(learning / totalCards) * 100}%` }} className="bg-warning transition-all border-r-2 border-foreground"></div>
                  <div style={{ width: `${(shaking / totalCards) * 100}%` }} className="bg-danger transition-all"></div>
                </div>
                
                <div className="flex flex-col gap-2 mt-6">
                  <div className="flex justify-between items-center text-sm font-bold uppercase border-b border-foreground/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-success border-2 border-foreground"></div>
                      Mastered
                    </div>
                    <span>{mastered} ({Math.round((mastered / totalCards) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold uppercase border-b border-foreground/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-warning border-2 border-foreground"></div>
                      Learning
                    </div>
                    <span>{learning} ({Math.round((learning / totalCards) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold uppercase border-b border-foreground/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-danger border-2 border-foreground"></div>
                      Critical Weaknesses
                    </div>
                    <span>{shaking} ({Math.round((shaking / totalCards) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Total Cards Metric */}
              <div className="border-4 border-foreground bg-primary p-6 shadow-[8px_8px_0px_var(--color-foreground)]">
                <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-foreground">Total Vocabulary</h3>
                <p className="text-6xl font-black text-foreground drop-shadow-[2px_2px_0px_white]">{totalCards}</p>
              </div>

            </div>

            {/* Right Column: AI Actionable Advise */}
            <div className="flex flex-col h-full">
              {weakTopics.length > 0 ? (
                <WeakTopics topics={weakTopics} />
              ) : (
                <div className="h-full border-4 border-foreground bg-success/10 p-12 text-center flex flex-col justify-center items-center shadow-[8px_8px_0px_var(--color-foreground)]">
                  <span className="text-6xl mb-4">🏆</span>
                  <h3 className="text-2xl font-black uppercase mb-2">Optimal Status</h3>
                  <p className="font-bold text-foreground/70">No critical weaknesses detected in this deck yet. Keep studying!</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </>
  );
}
