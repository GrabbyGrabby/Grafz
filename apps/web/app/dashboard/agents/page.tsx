"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Blocks, Database } from "lucide-react";

export default function DashboardOverviewPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const mcpConfig = JSON.stringify({
  "mcpServers": {
    "grafz-memory": {
      "command": "bun",
      "args": [
        "run",
        "mcp-server.ts"
      ]
    }
  }
}, null, 2);

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Left: Connect your tools */}
        <div className="md:w-1/3 flex flex-col justify-center">
          <div className="flex gap-3 mb-6 text-faint">
            <Blocks className="w-5 h-5 text-primary" />
            <Database className="w-5 h-5" />
            <Terminal className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-main mb-4 tracking-tight">Connect Agents</h1>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Grafz natively exposes an MCP Server. Connect it to Claude or other MCP clients to give them direct access to your graph.
          </p>
          <div className="relative mb-6">
            <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center group hover:border-border-strong transition-colors cursor-pointer">
              <code className="text-sm font-mono text-main">@modelcontextprotocol</code>
            </div>
          </div>
        </div>

        {/* Right: Manual Setup */}
        <div className="md:w-2/3 bg-surface border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <p className="text-sm text-faint mb-4">MCP Server Configuration</p>
          
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all bg-bg border border-border text-main shadow-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              Claude Desktop
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all text-muted hover:text-main hover:bg-bg/50">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              MCP Inspector
            </button>
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-main mb-3">1. Add to Claude Desktop Config</p>
              <p className="text-xs text-muted mb-3">Open <code className="text-faint">claude_desktop_config.json</code> and paste this server block:</p>
              <div className="bg-bg border border-border rounded-lg p-3 flex justify-between items-start group relative">
                <pre className="text-xs font-mono text-muted overflow-x-auto custom-scrollbar">{mcpConfig}</pre>
                <button onClick={() => handleCopy(mcpConfig, "config")} className="absolute top-3 right-3 text-faint hover:text-main bg-bg p-1 rounded">
                  {copied === "config" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-main mb-3">2. Test with MCP Inspector</p>
              <p className="text-xs text-muted mb-3">Alternatively, run the official inspector to test the tools locally in your browser:</p>
              <div className="bg-bg border border-border rounded-lg p-3 flex justify-between items-center group">
                <code className="text-sm font-mono text-muted">npx @modelcontextprotocol/inspector bun apps/web/mcp-server.ts</code>
                <button onClick={() => handleCopy("npx @modelcontextprotocol/inspector bun apps/web/mcp-server.ts", "inspector")} className="text-faint hover:text-main">
                  {copied === "inspector" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-border border-dashed">
              <p className="text-sm font-medium text-main mb-3">Check it worked</p>
              <div className="bg-bg border border-border rounded-lg p-3">
                <code className="text-sm font-mono text-muted">Ask Claude: "Search my memories for information about Next.js"</code>
              </div>
              <span className="inline-block mt-4 text-xs text-faint">Claude will automatically trigger the <code className="text-muted">search_memories</code> MCP tool.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
