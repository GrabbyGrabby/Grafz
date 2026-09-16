"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Check, LogOut } from "lucide-react";
import Link from "next/link";

const companySizes = ["Just me", "2-10", "11-50", "51-200", "201-1,000", "1,000+"];

export default function OnboardingPage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedSize, setSelectedSize] = useState("Just me");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call to create workspace
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-bg text-white selection:bg-blue-500/30">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-between w-full lg:w-[45%] p-8 md:p-16 lg:p-24 z-10 relative">
        <div className="flex items-center gap-2 mb-16">
          <BrainCircuit className="w-8 h-8 text-white" />
          <span className="text-xl font-bold tracking-tight">grafz™</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto lg:mx-0 flex-1 flex flex-col justify-center"
        >
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Create a workspace</h1>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed">
            Memories, keys and connectors all live inside one. You can rename it later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="workspaceName" className="text-sm text-gray-400 font-medium">
                Workspace name
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-bg border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400 font-medium">Company size</label>
                <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Optional</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {companySizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-all border ${
                      selectedSize === size
                        ? "bg-blue-600/10 border-blue-500/50 text-blue-400"
                        : "bg-bg border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !workspaceName}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create workspace"
              )}
            </button>
          </form>
        </motion.div>

        <div className="flex justify-between items-center mt-16 text-sm text-gray-500 max-w-md w-full mx-auto lg:mx-0">
          <span>Signed in as user@example.com</span>
          <button className="text-gray-400 hover:text-white transition-colors">Sign out</button>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-bg">
        {/* Soft Dreamy Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-emerald-400/20 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300/30 via-transparent to-transparent blur-3xl" />
        
        {/* Floating elements to simulate the flowers/sky */}
        <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-blue-400/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-white/20 rounded-full blur-[120px]" />

        <div className="relative w-full h-full flex flex-col items-center justify-center p-12">
          
          {/* Avatar bubbles */}
          <div className="flex -space-x-3 mb-6 relative z-10">
            <img className="w-10 h-10 rounded-full border-2 border-[#121212]" src="https://i.pravatar.cc/100?img=11" alt="Avatar" />
            <img className="w-10 h-10 rounded-full border-2 border-[#121212]" src="https://i.pravatar.cc/100?img=33" alt="Avatar" />
            <img className="w-10 h-10 rounded-full border-2 border-[#121212]" src="https://i.pravatar.cc/100?img=12" alt="Avatar" />
          </div>

          {/* Glassmorphic Testimonial Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="backdrop-blur-xl bg-white/95 text-gray-900 p-8 rounded-2xl max-w-md w-full shadow-2xl relative z-10"
          >
            <p className="text-lg font-medium leading-relaxed mb-8">
              Grafz let us scale usage without losing the thread of every conversation.
            </p>
            <div className="flex items-center gap-3">
              <img className="w-10 h-10 rounded-full" src="https://i.pravatar.cc/100?img=12" alt="Max Peters" />
              <div>
                <div className="font-semibold text-sm">Max Peters</div>
                <div className="text-gray-500 text-xs">Founder, Adapta</div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Pills */}
          <div className="flex gap-4 mt-8 relative z-10">
            <div className="backdrop-blur-md bg-white/20 text-white/90 px-4 py-2 rounded-full text-xs font-medium border border-white/10 shadow-lg">
              100B+ tokens a month
            </div>
            <div className="backdrop-blur-md bg-white/20 text-white/90 px-4 py-2 rounded-full text-xs font-medium border border-white/10 shadow-lg">
              &lt;300ms p95 recall
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
