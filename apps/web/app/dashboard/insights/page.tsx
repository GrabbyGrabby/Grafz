import React from "react";
import { Users, TrendingUp, BrainCircuit } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full p-8 text-main">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">User Insights</h1>
          <p className="text-muted">Analyze how agents are interacting with your semantic memory.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-muted">Active Agents</h3>
          </div>
          <div className="text-4xl font-bold mb-1">3</div>
          <p className="text-xs text-faint">Claude Desktop, Cursor, CLI</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-muted">Retrieval Accuracy</h3>
          </div>
          <div className="text-4xl font-bold mb-1">94.2%</div>
          <p className="text-xs text-faint">Based on top-k threshold hits</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-muted">Vector Density</h3>
          </div>
          <div className="text-4xl font-bold mb-1">High</div>
          <p className="text-xs text-faint">Semantic clusters are strongly bound</p>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center mb-6">
          <TrendingUp className="w-8 h-8 text-faint" />
        </div>
        <h3 className="text-xl font-bold mb-2">Detailed charts coming soon</h3>
        <p className="text-muted max-w-md">We are accumulating enough telemetry data to build your personal knowledge graph analytics.</p>
      </div>
    </div>
  );
}
