"use client";

import React, { useEffect } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

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

        <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <button
            onClick={login}
            disabled={!ready}
            className="w-full bg-primary hover:bg-primary-hover text-[#17191D] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg"
          >
            {!ready ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Login / Sign up"
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-faint">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
