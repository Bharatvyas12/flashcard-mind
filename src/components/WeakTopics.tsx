import React from "react";

export function WeakTopics({ topics }: { topics: string[] }) {
  if (!topics || topics.length === 0) return null;

  // Simple hardcoded mapping for actionable advice (in a real app, this would come from the AI directly)
  const getActionableStrategy = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes("math") || t.includes("calc") || t.includes("algebra")) return "Use the Feynman Technique: Try explaining this to a 5-year-old on paper.";
    if (t.includes("history") || t.includes("date")) return "Construct a physical timeline. Memory connects better to spatial anchors.";
    if (t.includes("science") || t.includes("physics") || t.includes("chem")) return "Draw a concept map. Do not stare at the definition; trace the system inputs and outputs.";
    if (t.includes("lang") || t.includes("vocab")) return "Mnemonics required. Create absurd, violent, or funny visual associations for these words.";
    return "Stop passive reading. Close your eyes and actively recall the exact mechanism of this topic.";
  };

  return (
    <div className="w-full mt-8 border-4 border-danger bg-danger/5 p-6 shadow-[8px_8px_0px_var(--color-danger)] relative">
      <div className="absolute -top-4 left-4 bg-danger text-background font-black uppercase px-4 py-1 text-sm tracking-widest border-2 border-foreground">
        Critical Failures Detected
      </div>
      
      <p className="text-foreground/80 font-bold mb-4 uppercase text-xs tracking-widest mt-2">
        We noticed you struggled with these concepts. Review immediately:
      </p>
      
      <div className="flex flex-col gap-4">
        {topics.map((t, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-surface border-2 border-foreground p-4">
            <span className="bg-foreground text-background font-black uppercase px-3 py-1 text-sm whitespace-nowrap">
              {t}
            </span>
            <span className="text-sm font-medium">
              <span className="text-danger font-bold uppercase mr-2">Action:</span> 
              {getActionableStrategy(t)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
