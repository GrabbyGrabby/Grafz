"use client";

import React, { useState } from "react";
import { Key, Copy, Plus, Trash2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<{ id: string; key: string; name: string; created_at: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateKey = () => {
    setIsGenerating(true);
    // Simulate secure network generation
    setTimeout(() => {
      const newKey = {
        id: Math.random().toString(36).substring(2, 9),
        key: "grafz_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name: "Default Key",
        created_at: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
      setApiKeys([newKey, ...apiKeys]);
      setIsGenerating(false);
    }, 600);
  };

  const copyToClipboard = (keyId: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full p-8 text-main overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted text-sm mt-1">Manage your secret API keys to access the Grafz network programmatically.</p>
          </div>
        </div>
        <button 
          onClick={generateKey}
          disabled={isGenerating}
          className="bg-primary hover:bg-primary-hover text-[#17191D] px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Create new secret key"}
        </button>
      </div>
      
      <div className="bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-border bg-surface-hover flex items-center justify-between">
          <h2 className="font-semibold text-sm">Active Secret Keys</h2>
          <span className="text-xs font-mono text-faint bg-bg px-2 py-1 rounded border border-border">{apiKeys.length} / 5 used</span>
        </div>
        
        <div className="p-6">
          <AnimatePresence mode="popLayout">
            {apiKeys.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-12 h-12 rounded-full bg-surface-hover border border-border mx-auto flex items-center justify-center mb-4">
                  <Key className="w-5 h-5 text-faint" />
                </div>
                <h3 className="text-main font-medium mb-1">No API keys found</h3>
                <p className="text-muted text-sm">Generate a key to authenticate your agentic workflows.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((k) => (
                  <motion.div 
                    key={k.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-bg/50 hover:bg-surface transition-colors group"
                  >
                    <div>
                      <h4 className="font-medium text-sm mb-1">{k.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-faint">Created {k.created_at}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-xs text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden relative">
                        <div className="px-3 py-2 font-mono text-xs w-64 truncate text-muted select-none">
                          {visibleKeys[k.id] ? k.key : "grafz_••••••••••••••••••••••••••••"}
                        </div>
                        <button 
                          onClick={() => toggleVisibility(k.id)}
                          className="p-2 text-faint hover:text-main transition-colors border-l border-border bg-surface-hover"
                          title="Toggle visibility"
                        >
                          {visibleKeys[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(k.id, k.key)}
                          className="p-2 text-faint hover:text-primary transition-colors border-l border-border bg-surface-hover"
                          title="Copy to clipboard"
                        >
                          {copiedKey === k.id ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <button 
                        onClick={() => deleteKey(k.id)}
                        className="p-2 text-faint hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
        <div className="bg-surface-hover/50 border-t border-border px-6 py-4 flex items-start gap-3">
          <div className="mt-0.5 text-primary">ℹ️</div>
          <p className="text-xs text-muted leading-relaxed">
            Your secret API keys carry many privileges, so be sure to keep them secure. Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
          </p>
        </div>
      </div>
    </div>
  );
}
