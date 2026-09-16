"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BrainCircuit, Search, Plus, Home, Terminal, FileText, 
  Tags, Share2, Activity, Users, Plug, Download, HelpCircle, FileJson, 
  MoreHorizontal, Key, Copy, Bot, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Playground", href: "/dashboard/playground", icon: Terminal },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Container Tags", href: "/dashboard/tags", icon: Tags },
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
  const pathname = usePathname();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleCreateApiKey = () => {
    // Generate a dummy API key for the UI
    const key = "grafz_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(key);
    setShowApiKeyModal(true);
  };

  return (
    <div className="flex h-screen bg-bg text-muted overflow-hidden font-sans">
      
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

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="flex-shrink-0 flex flex-col border-r border-border bg-bg relative z-20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3 text-main whitespace-nowrap h-16">
          <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-[#17191D]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, w: 0 }}
                animate={{ opacity: 1, w: "auto" }}
                exit={{ opacity: 0, w: 0 }}
                className="font-bold tracking-tight text-xl"
              >
                grafz™
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
                 onClick={async () => {
                   const { createClient } = await import('@/lib/supabase/client');
                   const supabase = createClient();
                   await supabase.auth.signOut();
                   window.location.href = '/login';
                 }}
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
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-border z-10 relative bg-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border text-sm cursor-pointer hover:bg-surface-hover transition-colors">
            <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center text-[10px] text-[#17191D] font-bold">G</div>
            <span className="text-main font-medium">Grabby</span>
            <span className="text-[10px] uppercase bg-bg border border-border px-1.5 py-0.5 rounded text-faint">Free</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <button className="text-muted hover:text-main transition-colors">Help</button>
            <button className="text-muted hover:text-main transition-colors">Docs ↗</button>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-auto p-4 md:p-6 z-0">
          <div className="bg-surface border border-border rounded-[2rem] min-h-full p-8 md:p-12 relative overflow-hidden shadow-2xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
