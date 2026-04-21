import Link from "next/link";
import { Deck } from "@/types";
import { formatDate } from "@/lib/utils";

interface DeckCardProps {
  deck: Deck;
  onDelete?: (id: string) => void;
}

export default function DeckCard({ deck, onDelete }: DeckCardProps) {
  return (
    <div className="group relative bg-surface border-4 border-foreground p-6 transition-all hover:shadow-[8px_8px_0px_var(--color-primary)] hover:-translate-y-1 hover:-translate-x-1 flex flex-col justify-between h-full min-h-[220px]">
      
      {/* Decorative top-right corner element */}
      <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-b-4 border-foreground bg-coral pointer-events-none transition-colors group-hover:bg-primary"></div>
      
      {onDelete && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(deck.id);
          }}
          className="absolute top-6 right-10 p-1 bg-background border-2 border-foreground hover:bg-danger transition-colors z-10 font-bold uppercase text-xs px-2 shadow-[2px_2px_0px_var(--color-foreground)]"
          title="Delete deck"
        >
          Del
        </button>
      )}
      
      <Link href={`/deck/${deck.id}`} className="block flex-grow cursor-pointer">
        <h3 className="text-2xl font-black uppercase mb-4 pr-16 leading-none tracking-tight">{deck.name}</h3>
        
        <div className="space-y-2 mb-6">
          <p className="text-sm font-bold bg-foreground text-background inline-block px-2 py-1 uppercase">{deck.card_count} cards</p>
          <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest block">Last studied: {formatDate(deck.last_studied)}</p>
        </div>
      </Link>
      
      <div className="flex gap-2 mt-auto pt-4 border-t-2 border-foreground border-dashed">
        <Link 
          href={`/deck/${deck.id}`} 
          className="flex-1 bg-primary border-2 border-foreground text-center py-2 font-black uppercase hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
        >
          Study <span className="text-xl leading-none">→</span>
        </Link>
        <Link 
          href={`/deck/${deck.id}/report`} 
          className="flex-1 bg-surface border-2 border-foreground text-center py-2 font-black uppercase hover:bg-warning transition-colors"
        >
          Report
        </Link>
      </div>
    </div>
  );
}
