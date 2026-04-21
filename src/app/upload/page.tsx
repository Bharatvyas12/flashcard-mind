"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FileUploader from "@/components/FileUploader";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/generate-cards", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cards");
      }

      // Support mock preview mode
      if (data.deckId === "mock-deck-id" && data.flashcards) {
        localStorage.setItem("mock_cards", JSON.stringify(data.flashcards));
        localStorage.setItem("mock_deck_name", data.deckName || "Mock Deck");
      }

      // Success, navigate to practice mode
      router.push(`/deck/${data.deckId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setIsUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl flex-grow flex flex-col items-center justify-center">
        
        <div className="w-full mb-8">
          <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 mb-8 inline-flex">
            <span>←</span> Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-center">Create New Deck</h1>
          <p className="text-foreground/70 text-center mb-12 text-lg max-w-2xl mx-auto">
            Upload your lecture slides, class notes, or textbook chapter as a PDF. Our AI will automatically extract the key concepts and generate high-quality flashcards for you.
          </p>
        </div>

        <FileUploader onUpload={handleUpload} isUploading={isUploading} />

        {error && (
          <div className="mt-8 p-4 bg-danger/10 border border-danger/20 rounded-xl text-center w-full max-w-2xl">
            <h3 className="text-danger font-bold mb-1">Upload Failed</h3>
            <p className="text-danger/80">{error}</p>
          </div>
        )}
      </main>
    </>
  );
}
