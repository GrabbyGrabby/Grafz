"use client";

import React, { useState } from "react";
import { BrainCircuit, Mail, Github, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<"google" | "github" | false>(false);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-[#17191D] mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-main tracking-tight mb-2">Welcome to Grafz</h1>
          <p className="text-muted text-sm">Sign in to orchestrate your agentic memories.</p>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          <div className="space-y-4">
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading !== false}
              className="w-full flex items-center justify-center gap-3 bg-bg border border-border hover:border-primary/50 text-main font-medium py-3 rounded-xl transition-all disabled:opacity-50 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {isLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="relative z-10">Continue with Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading !== false}
              className="w-full flex items-center justify-center gap-3 bg-bg border border-border hover:border-primary/50 text-main font-medium py-3 rounded-xl transition-all disabled:opacity-50 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              {isLoading === "github" ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <Github className="w-5 h-5 relative z-10" />
              )}
              <span className="relative z-10">Continue with GitHub</span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-faint uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form className="mt-8 space-y-4 pointer-events-none opacity-50 relative">
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <span className="bg-surface px-3 py-1 rounded-full text-xs border border-border text-faint font-medium">Coming soon</span>
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-main placeholder-faint focus:border-primary outline-none transition-colors"
                disabled
              />
            </div>
            <button className="w-full bg-primary text-[#17191D] font-semibold py-3 rounded-xl flex items-center justify-center gap-2" disabled>
              Continue with Email <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-faint">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
