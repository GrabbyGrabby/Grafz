"use client";

import React, { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImportPage() {
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          metadata: {
            source: sourceUrl || "Manual Input",
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!res.ok) throw new Error("Ingestion failed");

      setSuccessMessage("Memory ingested and vectorized successfully.");
      setContent("");
      setSourceUrl("");
    } catch (err) {
      console.error(err);
      alert("Failed to ingest memory. Check console.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  return (
    <div className="h-full flex flex-col text-main p-4 max-w-4xl mx-auto w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-main mb-2 tracking-tight">Import Data</h1>
        <p className="text-muted">Inject raw text, URLs, or documents into your semantic memory graph.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Ingestion Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleIngest} className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
            
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-0 left-0 w-full bg-emerald-500/10 border-b border-emerald-500/20 p-3 flex items-center justify-center gap-2 text-emerald-400 text-sm z-20"
                >
                  <CheckCircle2 className="w-4 h-4" /> {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Raw Text / Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the text you want the agent to remember..."
                  className="w-full h-48 bg-bg border border-border rounded-xl p-4 text-main placeholder-faint focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Source URL (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                  <input 
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 text-main placeholder-faint focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="w-full bg-primary hover:bg-primary-hover text-bg font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isLoading ? "Vectorizing & Storing..." : "Inject into Memory"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-main mb-2">How it works</h3>
            <p className="text-sm text-muted leading-relaxed">
              When you inject data, Grafz processes it through a local Xenova embedding model to generate high-dimensional vectors. It is then stored in Supabase pgvector, making it instantly available in the Playground and via the MCP CLI.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
