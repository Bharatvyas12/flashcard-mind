"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{text: string, type: "success" | "error"} | null>(null);

  useEffect(() => {
    // Read from Mock Auth
    const storedUser = localStorage.getItem("mock_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
    } else {
      // Not logged in
      router.push("/login");
    }
  }, [router]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setMessage({text: "Name and Email are required parameters.", type: "error"});
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      // In a real app we'd hash and store the new password securely if changed
    };

    localStorage.setItem("mock_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setMessage({text: "Identity Protocol successfully updated.", type: "success"});
    window.dispatchEvent(new Event("storage"));
    
    // Clear password field after save
    setPassword("");
    
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("mock_user");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-background"></div>;

  // Derive mock stats
  const mockCards = typeof window !== "undefined" ? localStorage.getItem("mock_cards") : null;
  const statCount = mockCards ? JSON.parse(mockCards).length : 0;

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 lg:py-16 max-w-4xl flex-grow flex flex-col">
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8 border-b-4 border-foreground pb-8">
          {/* Avatar Block */}
          <div className="w-32 h-32 bg-primary border-4 border-foreground flex items-center justify-center shadow-[6px_6px_0px_var(--color-foreground)] shrink-0">
            <span className="text-5xl font-black text-background">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>

          <div className="flex-grow">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2">
              {user.name}
            </h1>
            <p className="text-foreground/60 font-bold uppercase tracking-widest bg-foreground text-background inline-block px-3 py-1">
              {user.id}
            </p>
            
            <div className="flex gap-4 mt-6">
              <div className="bg-surface border-2 border-foreground px-4 py-2 flex flex-col">
                <span className="text-xs font-bold text-foreground/50 uppercase">Access Level</span>
                <span className="font-black">Standard</span>
              </div>
              <div className="bg-surface border-2 border-foreground px-4 py-2 flex flex-col">
                <span className="text-xs font-bold text-foreground/50 uppercase">Data Cards</span>
                <span className="font-black">{statCount} Local</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              Configure Identity <span className="text-primary text-xl">⚡</span>
            </h2>

            {message && (
              <div className={`mb-6 border-4 p-4 font-bold text-sm uppercase tracking-widest ${
                message.type === "success" 
                ? "border-success bg-success/10 text-success shadow-[4px_4px_0px_var(--color-success)]" 
                : "border-danger bg-danger/10 text-danger shadow-[4px_4px_0px_var(--color-danger)]"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-6 bg-surface border-4 border-foreground p-6 shadow-[8px_8px_0px_var(--color-foreground)]">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground">Operator Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground">Email Contact</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-6 border-t-2 border-foreground border-dashed">
                <label className="text-sm font-black uppercase tracking-widest text-foreground flex justify-between">
                  <span>Reset Passcode</span>
                  <span className="text-foreground/40 text-xs">Optional</span>
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new passcode to apply"
                  className="bg-background border-4 border-foreground px-4 py-3 font-bold focus:outline-none focus:border-warning focus:bg-warning/5 transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="mt-6 w-full bg-primary text-foreground border-4 border-foreground font-black text-lg uppercase tracking-widest py-4 hover:bg-foreground hover:text-primary transition-all shadow-[4px_4px_0px_var(--color-foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Overwrite Configurations
              </button>
            </form>
          </div>

          {/* Action Center Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col gap-6">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Actions</h2>
            
            <Link 
              href="/"
              className="w-full text-center bg-surface border-4 border-foreground font-black text-sm uppercase py-4 hover:bg-primary transition-colors shadow-[4px_4px_0px_var(--color-foreground)] hover:-translate-y-1"
            >
              Return to Grid
            </Link>

            <button 
              onClick={handleLogout}
              className="w-full text-center mt-auto bg-danger/10 border-4 border-danger text-danger font-black text-sm uppercase py-4 hover:bg-danger hover:text-background transition-colors hover:shadow-[4px_4px_0px_var(--color-danger)]"
            >
              Terminate Session
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
