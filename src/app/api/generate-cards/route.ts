import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

if (typeof global !== "undefined" && typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}

const pdfParseModule = require("pdf-parse");
const pdfParse = typeof pdfParseModule === "function" ? pdfParseModule : (pdfParseModule.default || pdfParseModule.PDFParse || pdfParseModule);
// @google/genai SDK removed due to fetch conflict in Next.js

export const maxDuration = 60; // Max duration to 60s to prevent Vercel Timeout

export async function POST(request: NextRequest) {
  try {
    const rawKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawKey.replace(/^GEMINI_API_KEY=/i, "").replace(/["']/g, "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API Key is missing. Please add GEMINI_API_KEY to your .env.local file." },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF is allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer for pdf-parse
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text extracted from PDF" }, { status: 400 });
    }

    // Prepare deck name from file name
    const deckName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

    // Call Gemini API via native fetch
    const prompt = `You are an expert educator creating flashcards for students. 
Given the text from a PDF, create 15-20 high-quality flashcards.
Each card must have:
- front: A clear, specific question (not vague)
- back: Concise answer with 1 example where possible
- topic: The subject area this card belongs to
- difficulty: easy/medium/hard

Focus on: key concepts, cause-effect relationships, definitions with context, 
important examples, and common misconceptions.
Return ONLY a valid JSON array. No extra text. Format:
[{"front": "", "back": "", "topic": "", "difficulty": ""}]

Text to generate cards from:
${text.substring(0, 50000)} // Limiting text to avoid token limits if PDF is huge
`;

    const apiResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: { text: "You are a helpful assistant that generates exactly a valid JSON output only." } },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      })
    });

    if (!apiResult.ok) {
      const errorText = await apiResult.text();
      console.error("Gemini Native fetch error", errorText);
      let parsedError = "Unknown Google AI Error";
      try {
        const jsonError = JSON.parse(errorText);
        parsedError = jsonError.error?.message || errorText;
      } catch(e) {}
      throw new Error(`Google API Rejected Key: ${parsedError}`);
    }

    const data = await apiResult.json();
    const responseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract JSON from response in case Claude adds markdown or extra text
    const jsonMatch = responseContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from Claude:", responseContent);
      return NextResponse.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    const flashcards = JSON.parse(jsonMatch[0]);

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json({ error: "No cards generated" }, { status: 500 });
    }

    // Save to Supabase (only if configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder-project.supabase.co") {
      // Return the generated cards directly to the frontend for local preview
      return NextResponse.json({ 
        success: true, 
        deckId: "mock-deck-id",
        flashcards: flashcards,
        deckName: deckName,
        warning: "Cards generated but NOT SAVED. Please configure your actual Supabase keys in .env.local" 
      }, { status: 200 });
    }

    // 1. Create Deck
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert({ name: deckName, card_count: flashcards.length })
      .select()
      .single();

    if (deckError) throw deckError;

    // 2. Format cards for insert
    const cardsToInsert = flashcards.map((card: any) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      topic: card.topic || "General",
      difficulty: card.difficulty || "medium",
    }));

    // 3. Insert cards
    const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert);

    if (cardsError) {
      // Rollback deck if cards fail
      await supabase.from("decks").delete().eq("id", deck.id);
      throw cardsError;
    }

    return NextResponse.json({ success: true, deckId: deck.id }, { status: 200 });

  } catch (error: any) {
    console.error("Error generating cards:", error);
    // Determine if it was a Supabase connection error
    if (error.message === "fetch failed" || error.code === "ENOTFOUND") {
      return NextResponse.json(
        { error: "Failed to connect to the database. Are your Supabase URL and Keys correct?" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
