import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder-project.supabase.co") {
      return NextResponse.json({ 
        cardsPracticed: 20, 
        streak: 1,
        masteredCount: 15,
        dueCount: 0,
        shakyCount: 5
      }, { status: 200 });
    }
    // 1. Get total cards mastered (interval > 10 days generally indicates mastery in simple sm-2)
    const { count: masteredCount, error: error1 } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .gt("interval", 10);
      
    if (error1) throw error1;

    // 2. Get cards due today
    const countQuery = supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .lte("next_review", new Date().toISOString());
      
    const { count: dueCount, error: error2 } = await countQuery;
    if (error2) throw error2;

    // 3. Get shaky cards (interval = 0 and repetitions > 0, meaning they keep forgetting it)
    const { count: shakyCount, error: error3 } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("interval", 0)
      .gt("repetitions", 0);
      
    if (error3) throw error3;
    
    // 4. Get today's stats for progress ring
    const todayDate = new Date().toISOString().split("T")[0];
    const { data: todayStats, error: error4 } = await supabase
      .from("user_stats")
      .select("*")
      .eq("date", todayDate)
      .maybeSingle();

    const streak = todayStats?.streak || 0;
    const cardsPracticed = todayStats?.cards_practiced || 0;

    return NextResponse.json({ 
      masteredCount: masteredCount || 0,
      dueCount: dueCount || 0,
      shakyCount: shakyCount || 0,
      streak,
      cardsPracticed
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
