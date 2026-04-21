import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Rating, calculateNextReview } from "@/lib/sm2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const { searchParams } = new URL(request.url);
    const dueOnly = searchParams.get("due") === "true";

    let query = supabase.from("cards").select("*").eq("deck_id", deckId);

    if (dueOnly) {
      query = query.lte("next_review", new Date().toISOString());
    }

    const { data: cards, error } = await query;

    if (error) throw error;

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const body = await request.json();
    const { cardId, rating } = body;

    if (!cardId || !rating) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Get current card
    const { data: card, error: fetchError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate new values using SM-2
    const updates = calculateNextReview(card, rating as Rating);

    // Update card
    const { data: updatedCard, error: updateError } = await supabase
      .from("cards")
      .update(updates)
      .eq("id", cardId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update deck last_studied
    await supabase.from("decks").update({ last_studied: new Date().toISOString() }).eq("id", (await params).deckId);

    // Track user stats (simplified logic for demonstration)
    const todayDate = new Date().toISOString().split("T")[0];
    
    // Attempt to update existing stat or insert new
    const { data: stat, error: statError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("date", todayDate)
      .maybeSingle();
      
    if (stat) {
      await supabase.from("user_stats").update({ 
        cards_practiced: stat.cards_practiced + 1 
      }).eq("id", stat.id);
    } else {
      await supabase.from("user_stats").insert({
        date: todayDate,
        cards_practiced: 1,
        streak: 1 // Naive implementation, would need to check yesterday for real streak
      });
    }

    return NextResponse.json({ card: updatedCard }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating card:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
