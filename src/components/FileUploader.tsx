"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function FileUploader({ onUpload, isUploading }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative w-full p-12 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-surface-hover hover:border-primary/50"}
          ${isDragReject ? "border-danger bg-danger/5" : ""}
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-surface border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-lg font-bold text-primary animate-pulse">
              Generating Flashcards...
            </p>
            <p className="text-sm text-foreground/60 mt-2 text-center max-w-sm">
              Our AI is reading your PDF and extracting the most important concepts. This might take a minute.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-surface rounded-full shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-xl font-bold mb-2">
              {isDragActive ? "Drop the PDF here" : "Drag & drop your PDF"}
            </p>
            <p className="text-foreground/60 mb-6">
              or click to browse files (Max 10MB)
            </p>
            <span className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Select File
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-danger mt-4 text-center font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
