"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const stored = localStorage.getItem("mock_user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-[3px] border-foreground bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Background geometric offset card */}
            <div className="absolute w-8 h-8 border-2 border-foreground bg-coral rotate-[-15deg] group-hover:rotate-[-25deg] transition-transform duration-500 ease-out"></div>
            {/* Foreground geometric card */}
            <div className="absolute w-8 h-8 border-2 border-foreground bg-primary rotate-[5deg] group-hover:rotate-[15deg] transition-transform duration-500 ease-out flex items-center justify-center">
              <span className="text-foreground font-black text-xs">FM</span>
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            Flash<span className="text-primary italic border-b-4 border-coral">Mind</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/stats" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
            Stats
          </Link>
          <Link href="/upload" className="text-sm font-black uppercase tracking-wider bg-foreground text-background hover:bg-primary hover:text-foreground px-6 py-3 border-2 border-transparent hover:border-foreground transition-all flex items-center gap-2 shadow-[4px_4px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px]">
            + New Deck
          </Link>
          
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center border-2 border-foreground hover:bg-primary transition-colors hover:shadow-[4px_4px_0px_var(--color-foreground)] bg-background"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? "🌙" : "⚡"}
          </button>

          {/* Dynamic Authentication Block */}
          <div className="pl-4 ml-2 border-l-[3px] border-foreground flex items-center">
            {user ? (
              <Link href="/profile" className="group relative flex items-center justify-center w-12 h-12 border-2 border-foreground bg-coral hover:bg-primary transition-colors shadow-[4px_4px_0px_var(--color-foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <span className="font-black text-xl text-background">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                <span className="absolute -bottom-8 bg-foreground text-background text-xs uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Profile</span>
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-black uppercase tracking-widest bg-primary text-foreground hover:bg-foreground hover:text-primary px-6 py-3 border-2 border-foreground transition-all flex items-center gap-2 shadow-[4px_4px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px]">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
