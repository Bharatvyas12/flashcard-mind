"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DeckCard from "@/components/DeckCard";
import { ProgressRing, StatsCard } from "@/components/StatsCards";
import { Deck } from "@/types";

export default function Dashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const DAILY_GOAL = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [decksRes, statsRes] = await Promise.all([
        fetch("/api/decks").catch(() => null),
        fetch("/api/stats").catch(() => null)
      ]);
      
      const decksData = decksRes ? await decksRes.json().catch(() => ({})) : {};
      const statsData = statsRes ? await statsRes.json().catch(() => null) : null;
      
      let finalDecks = decksData.decks || [];
      let finalStats = statsData && !statsData.error ? statsData : { cardsPracticed: 0, streak: 0, masteredCount: 0, dueCount: 0, shakyCount: 0 };
      
      // Inject Mock deck for previewers
      const storedCards = localStorage.getItem("mock_cards");
      const storedDeckName = localStorage.getItem("mock_deck_name");
      const storedStats = localStorage.getItem("mock_stats");
      
      if (storedCards && storedDeckName) {
         try {
           const parsed = JSON.parse(storedCards);
           // Prevent duplicates if already present
           if (!finalDecks.find((d: any) => d.id === "mock-deck-id")) {
             finalDecks = [
               { id: "mock-deck-id", name: storedDeckName, card_count: parsed.length, created_at: new Date().toISOString() },
               ...finalDecks
             ];
           }
           
           // Calculate mock stats
           const mastered = parsed.filter((c:any) => c.interval > 10).length;
           const shaky = parsed.filter((c:any) => c.repetitions > 0 && c.interval < 1).length;
           const due = parsed.filter((c:any) => !c.next_review || new Date(c.next_review) <= new Date()).length;
           
           finalStats.masteredCount = (finalStats.masteredCount || 0) + mastered;
           finalStats.shakyCount = (finalStats.shakyCount || 0) + shaky;
           finalStats.dueCount = (finalStats.dueCount || 0) + due;
           
         } catch(e) { console.error("Parse mock cards error", e) }
      }
      
      if (storedStats) {
        try {
          const pStats = JSON.parse(storedStats);
          // Only override if real stats are missing or 0
          if (!finalStats.cardsPracticed) {
            finalStats.cardsPracticed = pStats.cardsPracticed || 0;
            finalStats.streak = pStats.streak || 0;
          }
        } catch(e) {}
      }

      setDecks(finalDecks);
      setStats(finalStats);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;
    
    // Intercept deletion for mock preview deck
    if (id === "mock-deck-id") {
      localStorage.removeItem("mock_cards");
      localStorage.removeItem("mock_deck_name");
      setDecks(decks.filter(d => d.id !== id));
      return;
    }

    try {
      await fetch(`/api/decks?id=${id}`, { method: "DELETE" });
      setDecks(decks.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDecks = decks.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const progressPercent = stats ? Math.min(100, Math.round((stats.cardsPracticed / DAILY_GOAL) * 100)) : 0;

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-grow flex flex-col">
        {/* Header & Goal */}
        <section className="mb-12 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-foreground/70 text-lg">
              {stats?.streak > 0 
                ? `You're on a ${stats.streak} day streak. Keep it up!` 
                : "Ready to learn something new today?"}
            </p>
          </div>
          
          <div className="bg-surface rounded-3xl p-6 flex items-center gap-6 shadow-sm border border-surface-hover">
            <ProgressRing radius={40} stroke={6} progress={progressPercent} />
            <div>
              <p className="font-bold text-xl">{stats?.cardsPracticed || 0} / {DAILY_GOAL}</p>
              <p className="text-foreground/60 text-sm">Cards practiced today</p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard 
            title="Mastered Cards" 
            value={stats?.masteredCount || 0} 
            icon="🏆"
            type="success"
            subtitle="Interval > 10 days"
          />
          <StatsCard 
            title="Due Today" 
            value={stats?.dueCount || 0} 
            icon="⏰"
            type="danger"
            subtitle="Needs review now"
          />
          <StatsCard 
            title="Shaky Cards" 
            value={stats?.shakyCount || 0} 
            icon="⚠️"
            type="warning"
            subtitle="Failed multiple times"
          />
        </section>

        {/* Decks Section */}
        <section className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Your Decks</h2>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search decks..."
                className="px-4 py-2 bg-surface border border-surface-hover rounded-xl focus:outline-none focus:border-primary transition-colors flex-grow sm:flex-grow-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Link 
                href="/upload"
                className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
              >
                + New
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-40 bg-surface rounded-2xl"></div>
              ))}
            </div>
          ) : filteredDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map(deck => (
                <DeckCard key={deck.id} deck={deck} onDelete={handleDeleteDeck} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface border border-surface-hover rounded-3xl">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">No decks found</h3>
              <p className="text-foreground/60 mb-6">
                {search ? "Try a different search term" : "Upload a PDF to generate your first flashcard deck!"}
              </p>
              {!search && (
                <Link href="/upload" className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:shadow-lg transition-all inline-block">
                  Upload PDF
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
