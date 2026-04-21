"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCards";

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl flex-grow">
        <div className="mb-8 flex items-center justify-between border-b border-surface-hover pb-6">
          <div>
            <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 mb-4 inline-flex">
              <span>←</span> Back
            </Link>
            <h1 className="text-4xl font-bold">Your Statistics</h1>
            <p className="text-foreground/60 mt-2">Track your learning journey over time.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-surface rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Current Streak" 
                value={stats?.streak ? `${stats.streak} Days` : "0 Days"} 
                icon="🔥"
                type="warning"
              />
              <StatsCard 
                title="Cards Practiced Today" 
                value={stats?.cardsPracticed || 0} 
                icon="📚"
                type="default"
              />
              <StatsCard 
                title="Total Mastered" 
                value={stats?.masteredCount || 0} 
                icon="🏆"
                type="success"
              />
              <StatsCard 
                title="Needs Work" 
                value={stats?.shakyCount || 0} 
                icon="⚠️"
                type="danger"
              />
            </section>
            
            <section className="bg-surface rounded-3xl p-8 border border-surface-hover">
              <h2 className="text-2xl font-bold mb-6">Learning Analytics Overview</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-surface-hover rounded-xl text-foreground/40">
                <p>Chart coming soon... (More data needed)</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
