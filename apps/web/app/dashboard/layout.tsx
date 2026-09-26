"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BrainCircuit, Search, Plus, Home, Terminal, FileText, 
  Tags, Share2, Activity, Users, Plug, Download, HelpCircle, FileJson, 
  MoreHorizontal, Key, Copy, Bot, ChevronLeft, ChevronRight, LogOut, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { usePrivy } from "@privy-io/react-auth";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Playground", href: "/dashboard/playground", icon: Terminal },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Memory Graph", href: "/dashboard/graph", icon: Share2 },
  { name: "Requests", href: "/dashboard/requests", icon: Activity },
];

const analyticsItems = [
  { name: "User Insights", href: "/dashboard/insights", icon: Users },
];

const dataItems = [
  { name: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { name: "Import", href: "/dashboard/import", icon: Download },
];

const developerItems = [
  { name: "API Keys", href: "/dashboard/apikeys", icon: Key },
  { name: "Agents", href: "/dashboard/agents", icon: Bot },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return <div className="min-h-screen bg-bg" />;
  }

  const userEmail = user?.email?.address || user?.google?.email || "User";

  const handleCreateApiKey = () => {
    // Generate a dummy API key for the UI
    const key = "grafz_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    setShowApiKeyModal(true);
  };

  return (
    <div className="flex h-screen w-full bg-bg text-main overflow-hidden relative">
      {/* Animated Background Orbs for Glass Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-main mb-2">Your New API Key</h3>
              <p className="text-sm text-faint mb-6">Please copy this key and store it securely. You won't be able to see it again.</p>
              
              <div className="bg-bg border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
                <code className="text-primary font-mono text-sm break-all">{apiKey}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="ml-4 text-faint hover:text-main transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="w-full bg-primary hover:bg-primary-hover text-[#17191D] py-3 rounded-xl font-semibold transition-colors"
              >
                I've copied it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 240 : 64,
          x: typeof window !== 'undefined' && window.innerWidth < 768 ? (isMobileMenuOpen ? 0 : -240) : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex-shrink-0 flex flex-col relative z-40 border-r border-white/5 bg-black/80 md:bg-black/40 backdrop-blur-xl shadow-2xl h-full",
          "absolute md:relative left-0 top-0 bottom-0"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <BrainCircuit className="w-5 h-5 text-[#17191D]" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg tracking-tight whitespace-nowrap text-main"
              >
                Grafz
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-6 custom-scrollbar">
          
          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-main hover:bg-surface rounded-md transition-colors" title="Search">
              <Search className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-between flex-1 whitespace-nowrap"
                  >
                    <span>Search...</span>
                    <span className="text-xs bg-surface px-1.5 py-0.5 rounded border border-border">⌘K</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button 
              onClick={handleCreateApiKey}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-main hover:text-primary hover:bg-surface rounded-md transition-colors font-medium"
              title="Create API key"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Create API key</span>}
            </button>
          </div>

          {/* Main Nav */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isSidebarOpen ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted hover:text-main hover:bg-surface"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-faint group-hover:text-muted")} />
                  {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Analytics Nav */}
          <div>
            {isSidebarOpen && <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Analytics</div>}
            {!isSidebarOpen && <div className="w-full h-px bg-border my-2" />}
            <nav className="space-y-0.5">
              {analyticsItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isSidebarOpen ? item.name : undefined}
                  className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-muted hover:text-main hover:bg-surface transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-faint group-hover:text-muted flex-shrink-0" />
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Data Nav */}
          <div>
            {isSidebarOpen && <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Data</div>}
            {!isSidebarOpen && <div className="w-full h-px bg-border my-2" />}
            <nav className="space-y-0.5">
              {dataItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={cn("flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group", isActive ? "bg-primary/10 text-primary font-medium" : "text-muted hover:text-main hover:bg-surface")}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-faint group-hover:text-muted")} />
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Developer Nav */}
          <div>
            {isSidebarOpen && <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-faint">Developer</div>}
            {!isSidebarOpen && <div className="w-full h-px bg-border my-2" />}
            <nav className="space-y-0.5">
              {developerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={cn("flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group", isActive ? "bg-primary/10 text-primary font-medium" : "text-muted hover:text-main hover:bg-surface")}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-faint group-hover:text-muted")} />
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-main">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "ME"}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-main truncate" title={userEmail || ""}>{userEmail || "Loading..."}</p>
                <p className="text-xs text-faint truncate">Pro Plan</p>
              </div>
            )}
            {isSidebarOpen && (
               <button 
                 onClick={() => logout()}
                 className="text-faint hover:text-red-400 transition-colors ml-auto p-1"
                 title="Sign out"
               >
                 <LogOut className="w-4 h-4" />
               </button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-16 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center text-muted shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:text-primary hover:border-primary/50 hover:bg-surface-hover hover:scale-110 transition-all z-50 group"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 z-10 relative bg-black/40 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden mr-2 text-muted hover:text-main"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-[10px] text-black font-bold shadow-lg">G</div>
              <span className="text-main font-semibold tracking-wide">Grafz</span>
              <span className="text-[9px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-muted font-bold tracking-widest ml-1">Free</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <button className="text-muted hover:text-main transition-colors">Help</button>
            <button className="text-muted hover:text-main transition-colors flex items-center gap-1">Support</button>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-auto p-4 md:p-6 z-0 relative">
          <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] min-h-full p-8 md:p-12 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10 h-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
