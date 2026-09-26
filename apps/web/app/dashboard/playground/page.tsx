"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useChat } from "ai/react";
import { 
  MessageSquare, Search, Mic, ArrowUp, Plus, Hash, User, 
  Settings2, RotateCcw, Copy, ChevronDown, Terminal, Loader2, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePrivy } from "@privy-io/react-auth";

export default function PlaygroundPage() {
  const { getAccessToken } = usePrivy();
  const [mode, setMode] = useState<"chat" | "search">("chat");
  const [memorySettingTab, setMemorySettingTab] = useState<"agentic" | "autosearch">("agentic");
  
  // Advanced Settings State
  const [useProfile, setUseProfile] = useState(true);
  const [memoriesRetrieved, setMemoriesRetrieved] = useState(10);
  const [matchStrictness, setMatchStrictness] = useState(0.40);
  const [rerank, setRerank] = useState(false);
  const [rewrite, setRewrite] = useState(false);
  const [aggregate, setAggregate] = useState(false);

  // Checkbox Settings
  const [includeRelated, setIncludeRelated] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeChunks, setIncludeChunks] = useState(false);
  const [includeSummaries, setIncludeSummaries] = useState(false);
  
  // Model Selection
  const [selectedModel, setSelectedModel] = useState("gemini-free"); // Default to gemini-free
  const models = [
    { id: "gemini-free", name: "Gemini 3.5 Flash" },
    { id: "gemini-pro", name: "Gemini 3.5 Pro" },
    { id: "gemini-2-flash", name: "Gemini 2.5 Flash" }
  ];

  // Chat State
  const { messages, input, setInput, handleInputChange, append, isLoading } = useChat({
    api: "/api/chat",
    body: { modelOverride: selectedModel }
  });

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");

    // Fetch context using the strictness and retrieval count settings
    let context = [];
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/memory?q=" + encodeURIComponent(userMessage) + "&threshold=" + matchStrictness + "&limit=" + memoriesRetrieved, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.results) {
        context = data.results;
      }
    } catch (err) {
      console.error("Context fetch failed", err);
    }

    append({
      role: 'user',
      content: userMessage
    }, {
      body: { context }
    });
  };

  const suggestions = [
    "What do you know about me?",
    "What have I been working on?",
    "What coffee do I prefer?"
  ];

  return (
    <div className="h-full flex flex-col text-main font-sans">
      {/* Header */}
      <div className="mb-6 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-main mb-2 tracking-tight">Playground</h1>
          <div className="flex items-center gap-2 text-sm text-muted">
            <p>Search your memories and chat with them.</p>
            <a href="#" className="text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              How search works ↗
            </a>
          </div>
        </div>

      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-6 min-h-0 relative">
        
        {/* Center Canvas */}
        <div className="flex-1 bg-bg border border-border rounded-2xl flex flex-col overflow-hidden relative shadow-inner">
          
          {/* Mode Toggle */}
          <div className="absolute top-4 left-4 z-20 flex bg-surface rounded-lg p-1 border border-border">
            <button 
              onClick={() => setMode("chat")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${mode === "chat" ? "bg-surface-hover text-main shadow-sm" : "text-faint hover:text-muted"}`}
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button 
              onClick={() => setMode("search")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${mode === "search" ? "bg-surface-hover text-main shadow-sm" : "text-faint hover:text-muted"}`}
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>

          {/* Chat / Search Content */}
          <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar relative z-10">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center -mt-16 pb-64 md:pb-40">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group border border-border"
                >
                  <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-primary font-bold text-4xl leading-none z-10" style={{fontFamily: "monospace"}}>✱</div>
                </motion.div>
                <h2 className="text-2xl font-bold text-main mb-8">See what Grafz can do</h2>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                  {/* Save to Memory Card */}
                  <Link href="/dashboard/import" className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-main mb-1">Save to memory</h3>
                    <p className="text-sm text-muted leading-relaxed">Ingest URLs, text, or files into your semantic graph for later retrieval.</p>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full max-w-3xl mx-auto space-y-6 pb-32 pt-12">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${m.role === "user" ? "bg-surface-hover text-main border border-border shadow-md" : "bg-transparent text-main"}`}>
                      {m.role === "user" ? (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      ) : (
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-a:text-primary hover:prose-a:text-primary-hover prose-strong:text-main prose-headings:text-main text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-transparent text-main px-4 py-2 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-faint">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area anchored to bottom */}
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-bg via-bg via-70% to-transparent z-20">
            <div className="w-full max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 md:gap-3 mb-4 justify-center">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInput(s)}
                      className="px-3 md:px-4 py-2 rounded-full border border-border bg-surface text-[11px] md:text-xs text-muted hover:text-main hover:bg-surface-hover transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <User className="w-3 h-3" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleChatSubmit} className="w-full bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl transition-all duration-300 focus-within:border-white/30 focus-within:ring-4 focus-within:ring-white/5 flex relative group">
                
                {/* Model Selector - Left Side of input */}
                <div className="flex flex-col justify-end p-2 pl-3 pb-3 flex-shrink-0 relative">
                  <div className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5 cursor-pointer">
                    <Plus className="w-4 h-4 text-faint" />
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Select Model"
                    >
                      <option value="gemini-free">Gemini 3.5 Flash</option>
                      <option value="gemini-pro">Gemini 2.5 Pro</option>
                      <option value="gemini-2-flash">Gemini 2.5 Flash</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-end relative flex-1">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask anything about your memories..."
                    className="w-full bg-transparent px-4 pb-4 pt-2 text-main placeholder-faint resize-none outline-none min-h-[60px] max-h-[200px] font-medium text-[14px] md:text-[15px] leading-relaxed transition-colors custom-scrollbar"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                  />
                  <div className="p-3 flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-faint flex items-center gap-1 hidden sm:flex tracking-wide"><Hash className="w-3 h-3"/> Context</span>
                    <button 
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 bg-white text-black rounded-full hover:bg-gray-200 hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center flex-shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5 stroke-[3]" />}
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="flex items-center gap-2 mt-4 px-2 overflow-x-auto no-scrollbar pb-2">
                <span className="text-[10px] uppercase font-extrabold text-white/30 tracking-widest mr-1 flex-shrink-0">Try</span>
                <button 
                  onClick={() => setInput("Who am I?")}
                  className="text-[11px] font-medium text-muted hover:text-main bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/5 transition-all flex-shrink-0 hover:scale-105"
                >
                  Who am I?
                </button>
                <button 
                  onClick={() => setInput("Summarize my last 5 memories")}
                  className="text-[11px] font-medium text-muted hover:text-main bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/5 transition-all flex-shrink-0 hover:scale-105"
                >
                  Summarize my last 5 memories
                </button>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}
