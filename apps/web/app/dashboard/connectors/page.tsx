"use client";

import React, { useState } from "react";
import { Globe, Github, Twitter, Figma, CheckCircle2, ChevronRight, Lock, Sparkles, X, Loader2, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Connector = {
  id: string;
  name: string;
  icon: any;
  status: "connected" | "disconnected" | "coming_soon";
  desc: string;
  isPremium: boolean;
};

export default function ConnectorsPage() {
  const [isPro, setIsPro] = useState(false); // Toggle this to test Pro features
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeModal, setActiveModal] = useState<Connector | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const [connectors, setConnectors] = useState<Connector[]>([
    { id: "chrome", name: "Chrome Extension", icon: Globe, status: "disconnected", desc: "Sync web pages and highlights.", isPremium: false },
    { id: "github", name: "GitHub", icon: Github, status: "disconnected", desc: "Sync repos, issues, and PRs.", isPremium: true },
    { id: "twitter", name: "Twitter / X", icon: Twitter, status: "disconnected", desc: "Sync bookmarks and tweets.", isPremium: true },
    { id: "figma", name: "Figma", icon: Figma, status: "coming_soon", desc: "Sync design files and comments.", isPremium: true },
  ]);

  const handleConnectorClick = (connector: Connector) => {
    if (connector.status === "coming_soon") return;

    if (connector.status === "connected") {
      // Disconnect logic
      setConnectors(prev => prev.map(c => c.id === connector.id ? { ...c, status: "disconnected" } : c));
      return;
    }

    if (connector.isPremium && !isPro) {
      setShowPaywall(true);
      return;
    }

    setActiveModal(connector);
  };

  const handleConnect = async () => {
    if (!activeModal) return;
    setIsConnecting(true);
    
    // Simulate API connection verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectors(prev => prev.map(c => c.id === activeModal.id ? { ...c, status: "connected" } : c));
    setIsConnecting(false);
    setActiveModal(null);
    setApiKey("");
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full p-8 text-main relative">
      
      {/* Dev Tool to toggle Pro for testing */}
      <div className="absolute top-8 right-8 flex items-center gap-2 text-xs">
        <span className="text-faint">Dev Test:</span>
        <button 
          onClick={() => setIsPro(!isPro)}
          className={`px-3 py-1 rounded-full border ${isPro ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-surface border-border text-muted'}`}
        >
          {isPro ? "Pro Active" : "Free Plan"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Connectors</h1>
          <p className="text-muted">Automate memory ingestion by connecting your external apps.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map(c => (
          <div 
            key={c.id} 
            onClick={() => handleConnectorClick(c)}
            className={`bg-surface border border-border rounded-2xl p-6 shadow-xl flex items-center justify-between group transition-all
              ${c.status === "coming_soon" ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative
                ${c.status === "connected" ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-bg border border-border text-muted group-hover:text-main'}
              `}>
                <c.icon className="w-6 h-6" />
                {c.isPremium && !isPro && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-bg border border-border rounded-full flex items-center justify-center text-primary shadow-lg">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {c.name}
                  {c.status === "connected" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </h3>
                <p className="text-sm text-muted">{c.desc}</p>
              </div>
            </div>
            <div>
              {c.status === "connected" ? (
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 group/disconnect transition-colors">
                  <span className="group-hover/disconnect:hidden">Connected</span>
                  <span className="hidden group-hover/disconnect:inline">Disconnect</span>
                </span>
              ) : c.status === "coming_soon" ? (
                <span className="text-xs text-faint font-medium px-3 py-1.5 bg-bg rounded-full border border-border">Coming soon</span>
              ) : (
                <div className="text-faint group-hover:text-main transition-colors flex items-center gap-1 text-sm font-medium">
                  Connect <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-faint hover:text-main">
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-bg border border-border flex items-center justify-center mb-6">
                  <activeModal.icon className="w-7 h-7 text-main" />
                </div>
                <h2 className="text-2xl font-bold text-main mb-2">Connect {activeModal.name}</h2>
                <p className="text-muted text-sm mb-8">Authenticate with {activeModal.name} to allow Grafz to automatically index your data.</p>
                
                {activeModal.id === "github" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted mb-2 block">Personal Access Token</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                        <input 
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxx"
                          className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-3 text-main placeholder-faint focus:border-primary outline-none text-sm"
                        />
                      </div>
                      <p className="text-xs text-faint mt-2">Needs `repo` and `read:user` scopes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-bg border border-border rounded-xl p-4 flex items-center justify-center text-sm text-muted">
                    OAuth flow will open in a new window.
                  </div>
                )}

                <button 
                  onClick={handleConnect}
                  disabled={isConnecting || (activeModal.id === "github" && !apiKey)}
                  className="w-full mt-8 bg-primary hover:bg-primary-hover text-[#17191D] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Connect"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface border border-primary/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400" />
              <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-faint hover:text-main z-10">
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="w-20 h-20 rounded-2xl bg-bg border border-border flex items-center justify-center mx-auto mb-6 relative z-10">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-3xl font-bold text-main mb-3 relative z-10">Upgrade to Pro</h2>
                <p className="text-muted text-sm leading-relaxed mb-8 relative z-10">
                  Unlock advanced integrations like GitHub, Twitter, and Figma. Automate your knowledge graph seamlessly.
                </p>
                
                <div className="space-y-3 mb-8 relative z-10 text-left bg-bg/50 border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-3 text-sm text-main"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited automated syncs</div>
                  <div className="flex items-center gap-3 text-sm text-main"><CheckCircle2 className="w-4 h-4 text-primary" /> Priority semantic indexing</div>
                  <div className="flex items-center gap-3 text-sm text-main"><CheckCircle2 className="w-4 h-4 text-primary" /> Premium integrations (GitHub, X, Figma)</div>
                </div>

                <button 
                  onClick={() => {
                    setIsPro(true);
                    setShowPaywall(false);
                  }}
                  className="w-full bg-main hover:bg-white text-bg font-bold py-4 rounded-xl transition-all shadow-xl relative z-10"
                >
                  Upgrade Now — $19/mo
                </button>
                <p className="text-xs text-faint mt-4 relative z-10">For demo purposes, clicking upgrade instantly unlocks Pro.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
