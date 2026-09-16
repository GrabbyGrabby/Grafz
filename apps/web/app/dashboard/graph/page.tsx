"use client";

import React, { useEffect, useState } from "react";
import { Network, Hexagon, Circle, FileText, ChevronDown, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function MemoryGraphPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="h-full flex flex-col text-main p-2 font-sans relative">
      
      {/* Background layer */}
      <div className="absolute inset-0 bg-bg z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex-1 bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Floating Legend */}
        <div className="absolute top-6 left-6 w-64 bg-surface/90 backdrop-blur border border-border rounded-2xl p-5 flex flex-col shadow-2xl h-fit z-30">
          <div className="flex items-center gap-2 mb-6 cursor-pointer group">
            <ChevronDown className="w-4 h-4 text-faint group-hover:text-main transition-colors" />
            <span className="font-medium text-main">Legend</span>
          </div>

          <div className="space-y-6">
            
            {/* Statistics */}
            <div>
              <p className="text-[10px] font-bold text-faint uppercase tracking-wider mb-3">Statistics</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Hexagon className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                    <span className="text-muted">Memories</span>
                  </div>
                  <span className="text-faint">{documents.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                    </div>
                    <span className="text-muted">Documents</span>
                  </div>
                  <span className="text-faint">0</span>
                </div>

                <div className="flex items-center justify-between text-sm cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-faint group-hover:text-main transition-colors" />
                    <span className="text-muted group-hover:text-main transition-colors">Connections</span>
                    <ChevronDown className="w-3 h-3 text-faint" />
                  </div>
                  <span className="text-faint">{documents.length * 2}</span>
                </div>

                {/* Connection Types */}
                <div className="pl-6 space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-[2px] bg-yellow-500" />
                    <span className="text-muted">Derives</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-[2px] bg-purple-500" />
                    <span className="text-muted">Updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-[2px] bg-blue-500 border border-blue-500 border-dashed bg-transparent" />
                    <span className="text-muted">Extends</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory Status */}
            <div>
              <p className="text-[10px] font-bold text-faint uppercase tracking-wider mb-3">Memory Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hexagon className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted">Recent (&lt; 24h)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hexagon className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted">Expiring soon</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hexagon className="w-4 h-4 text-red-500" />
                  <span className="text-muted">Forgotten</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Graph Canvas area */}
          
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
              backgroundSize: "24px 24px"
            }}
          />

          {isLoading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : documents.length === 0 ? (
            <div className="text-center z-10">
               <h3 className="text-xl font-bold text-main mb-2 tracking-tight">No data yet</h3>
               <p className="text-muted text-sm">Import data or add documents to build your graph.</p>
            </div>
          ) : (
                 <div className="absolute inset-0 w-full h-full overflow-hidden">
                   {/* Single SVG for all lines to improve performance and fix coordinate issues */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                     {documents.map((doc, i) => {
                       const angle = (i * 137.5) * (Math.PI / 180); 
                       // Deterministic pseudo-random radius to prevent React hydration crash and ensure nodes match lines
                       const pseudoRandom = (Math.sin(i * 12.9898) * 43758.5453) - Math.floor(Math.sin(i * 12.9898) * 43758.5453);
                       const radius = 25 + (pseudoRandom * 15);
                       
                       const xPercent = 50 + (Math.cos(angle) * radius);
                       const yPercent = 50 + (Math.sin(angle) * radius);
                       
                       const isRecent = i % 3 === 0;
                       const strokeColor = isRecent ? "#10B981" : "#3B82F6";

                       return (
                         <motion.line 
                           key={`line-${i}`}
                           initial={{ pathLength: 0, opacity: 0 }}
                           animate={{ pathLength: 1, opacity: 0.3 }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           x1="50%" y1="50%" 
                           x2={`${xPercent}%`} 
                           y2={`${yPercent}%`}
                           stroke={strokeColor}
                           strokeWidth="1.5" 
                         />
                       );
                     })}
                   </svg>

                   {/* Center Node */}
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-surface border-2 border-primary rounded-xl flex items-center justify-center z-20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                   >
                     <span className="font-bold text-main text-xs">Me</span>
                   </motion.div>

                   {/* Memory Nodes */}
                   {documents.map((doc, i) => {
                     const angle = (i * 137.5) * (Math.PI / 180); 
                     // Same deterministic pseudo-random radius
                     const pseudoRandom = (Math.sin(i * 12.9898) * 43758.5453) - Math.floor(Math.sin(i * 12.9898) * 43758.5453);
                     const radius = 25 + (pseudoRandom * 15);
                     
                     const xPercent = 50 + (Math.cos(angle) * radius);
                     const yPercent = 50 + (Math.sin(angle) * radius);
                     
                     const isRecent = i % 3 === 0;
                     const colorClass = isRecent ? "text-emerald-500 fill-emerald-500/20" : "text-blue-500 fill-blue-500/20";

                     return (
                       <motion.div
                         key={`node-${i}`}
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                         className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex items-center justify-center"
                         style={{ 
                           left: `${xPercent}%`, 
                           top: `${yPercent}%`
                         }}
                       >
                         <Hexagon className={`w-8 h-8 ${colorClass} drop-shadow-lg group-hover:scale-125 transition-transform`} />
                         <div className="absolute top-10 w-48 bg-surface border border-border-strong rounded-lg p-3 text-xs text-main opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-30">
                           {doc.content}
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
          )}
      </div>
    </div>
  );
}
