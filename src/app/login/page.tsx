"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill all required fields.");
      return;
    }

    // Mock Authentication Logic (Local Storage)
    const userPayload = {
      id: "mock_" + Date.now(),
      name: isLogin ? "Cyber Scholar" : name,
      email: email,
      created_at: new Date().toISOString()
    };

    localStorage.setItem("mock_user", JSON.stringify(userPayload));
    
    // Dispatch an event so Navbar can update immediately if it listens
    window.dispatchEvent(new Event("storage"));
    
    // Redirect to Dashboard
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center min-h-[calc(100vh-80px)]">
        
        <div className="w-full max-w-md relative">
          {/* Brutalist Shadow Box */}
          <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 lg:translate-x-4 lg:translate-y-4"></div>
          
          <div className="relative bg-surface border-4 border-foreground p-8 md:p-10 z-10 flex flex-col">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              {isLogin ? "Authenticate" : "Initialize"}
            </h1>
            <p className="text-foreground/70 font-bold text-sm tracking-widest uppercase mb-8 border-b-2 border-foreground pb-4">
              {isLogin ? "Access your learning modules" : "Deploy a new learning profile"}
            </p>

            {error && (
              <div className="mb-6 border-4 border-danger bg-danger/10 p-3 text-danger font-bold text-sm uppercase tracking-widest text-center shadow-[4px_4px_0px_var(--color-danger)]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black uppercase tracking-widest">Operator Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
                  placeholder="contact@flashmind.ai"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Passcode Key</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                className="mt-4 w-full bg-foreground text-background font-black text-xl uppercase tracking-widest py-4 border-4 border-foreground hover:bg-primary hover:text-foreground transition-all shadow-[4px_4px_0px_var(--color-foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                {isLogin ? "System Login ->" : "Execute Registration"}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t-2 border-foreground border-dashed">
              <p className="text-sm font-bold text-foreground/70">
                {isLogin ? "NO ACTIVE PERMIT?" : "ALREADY HAVE CLEARANCE?"}
              </p>
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="mt-2 text-primary font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-coral transition-colors"
              >
                {isLogin ? "Create Account" : "Return to Login"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
