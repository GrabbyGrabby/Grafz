"use client";

import React, { useState } from "react";
import { Terminal, Copy, ArrowRight, Play, BookOpen, Check } from "lucide-react";
import { motion } from "framer-motion";

const editors = ["Claude Code", "Cursor", "Codex", "OpenCode", "Amp", "OpenClaw", "Hermes"];

export default function DashboardOverviewPage() {
  const [activeEditor, setActiveEditor] = useState("Claude Code");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Left: Connect your tools */}
        <div className="md:w-1/3 flex flex-col justify-center">
          <div className="flex gap-3 mb-6 text-faint">
            <Terminal className="w-5 h-5" />
            <BookOpen className="w-5 h-5" />
            <Play className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-main mb-4 tracking-tight">Connect your tools</h1>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            One command installs the plugin for every editor you use.
          </p>
          <div className="relative mb-6">
            <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center group hover:border-border-strong transition-colors">
              <code className="text-sm font-mono text-main">npx grafz plugin</code>
              <button 
                onClick={() => handleCopy("npx grafz plugin", "npx")}
                className="text-faint hover:text-main transition-colors"
              >
                {copied === "npx" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium text-muted">
            <a href="#" className="hover:text-main transition-colors">Connect over MCP ↗</a>
            <a href="#" className="hover:text-main transition-colors">Building with the API? ↗</a>
          </div>
        </div>

        {/* Right: Manual Setup */}
        <div className="md:w-2/3 bg-surface border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <p className="text-sm text-faint mb-4">Or set one up by hand</p>
          
          {/* Editor Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
            {editors.map((editor) => (
              <button
                key={editor}
                onClick={() => setActiveEditor(editor)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  activeEditor === editor 
                    ? "bg-bg border border-border text-main shadow-sm" 
                    : "text-muted hover:text-main hover:bg-bg/50"
                }`}
              >
                {editor === "Claude Code" && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                {editor}
              </button>
            ))}
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-main mb-3">1. Add the marketplace</p>
              <div className="bg-bg border border-border rounded-lg p-3 flex justify-between items-center group">
                <code className="text-sm font-mono text-muted">/plugin marketplace add grafzai/claude-grafz</code>
                <button onClick={() => handleCopy("/plugin marketplace add grafzai/claude-grafz", "step1")} className="text-faint hover:text-main">
                  {copied === "step1" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-main mb-3">2. Install</p>
              <div className="bg-bg border border-border rounded-lg p-3 flex justify-between items-center group">
                <code className="text-sm font-mono text-muted">/plugin install grafz</code>
                <button onClick={() => handleCopy("/plugin install grafz", "step2")} className="text-faint hover:text-main">
                  {copied === "step2" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              </div>
              <p className="text-sm text-faint mt-3">Restart Claude Code and it opens your browser to sign in.</p>
            </div>

            <div className="pt-6 border-t border-border border-dashed">
              <p className="text-sm font-medium text-main mb-3">Check it worked</p>
              <div className="bg-bg border border-border rounded-lg p-3">
                <code className="text-sm font-mono text-muted">what do you remember about me?</code>
              </div>
              <a href="#" className="inline-block mt-4 text-sm text-faint hover:text-main transition-colors">Claude Code docs ↗</a>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <div className="mt-auto pt-8 border-t border-border">
        <p className="text-xs font-semibold text-faint tracking-wider uppercase mb-6">Explore</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Live Demo", icon: Play },
            { title: "Playground", icon: Terminal },
            { title: "Documentation", icon: BookOpen }
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all group">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted group-hover:text-main transition-colors" />
                <span className="font-medium text-main">{item.title}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-faint group-hover:text-main transition-colors transform group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
