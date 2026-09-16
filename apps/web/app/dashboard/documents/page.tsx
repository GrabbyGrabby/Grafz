"use client";

import React, { useEffect, useState } from "react";
import { Search, Tag, Filter, Download, FileText, ChevronDown, Clock, Layers, Hash } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all saved memories (documents)
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/memory");
        const data = await res.json();
        if (data.results) {
          setDocuments(data.results);
        }
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  return (
    <div className="h-full flex flex-col text-main p-2">
      {/* Header */}
      <div className="mb-8 flex-shrink-0 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-main mb-2 tracking-tight">Documents</h1>
          <div className="flex items-center gap-2 text-sm text-muted">
            <p>Everything you have added to your memory layer.</p>
            <a href="#" className="text-primary hover:text-blue-300 transition-colors flex items-center gap-1">
              How memories work ↗
            </a>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-main placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-surface border border-border px-3 py-2 rounded-lg text-sm text-muted hover:text-main transition-colors">
            <Tag className="w-3.5 h-3.5" /> All tags <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-2 bg-surface border border-border px-3 py-2 rounded-lg text-sm text-muted hover:text-main transition-colors">
            <Filter className="w-3.5 h-3.5" /> All statuses <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <button className="bg-primary hover:bg-primary text-main px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Import data
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-bg border border-border rounded-xl flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-border text-xs font-semibold text-faint tracking-wider">
          <div className="uppercase">Document</div>
          <div className="uppercase flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Containers</div>
          <div className="uppercase flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Memories</div>
          <div className="uppercase">Status</div>
          <div className="uppercase flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-muted" />
              </div>
              <h3 className="text-main font-medium mb-2">No documents yet</h3>
              <p className="text-sm text-muted mb-6 max-w-sm">
                Documents you ingest through the API appear here.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-sm text-primary hover:text-blue-300 transition-colors">
                  Learn how ↗
                </a>
                <button className="bg-primary hover:bg-primary text-main px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Import data
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {documents.map((doc, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="font-medium text-sm text-main truncate pr-4">
                    {doc.content.substring(0, 60)}{doc.content.length > 60 ? "..." : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-muted border border-border">default</span>
                  </div>
                  <div className="text-sm text-muted font-mono">1</div>
                  <div>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full w-fit">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                    </span>
                  </div>
                  <div className="text-sm text-faint">Just now</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
