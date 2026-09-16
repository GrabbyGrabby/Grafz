import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

export default function RequestsPage() {
  const requests = [
    { id: "req_1", endpoint: "POST /api/chat", status: 200, time: "2.1s", date: "Just now" },
    { id: "req_2", endpoint: "GET /api/memory", status: 200, time: "112ms", date: "2 mins ago" },
    { id: "req_3", endpoint: "POST /api/ingest", status: 201, time: "4.3s", date: "15 mins ago" },
    { id: "req_4", endpoint: "POST /api/chat", status: 504, time: "30.0s", date: "1 hour ago", error: true },
    { id: "req_5", endpoint: "GET /api/memory", status: 200, time: "95ms", date: "2 hours ago" },
  ];

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full p-8 text-main">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">API Requests</h1>
          <p className="text-muted">Monitor your real-time agent API usage and latency.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface border border-border px-4 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-faint uppercase font-bold tracking-wider">Total</span>
            <span className="font-semibold text-lg">12,401</span>
          </div>
          <div className="bg-surface border border-border px-4 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-faint uppercase font-bold tracking-wider">Errors</span>
            <span className="font-semibold text-lg text-red-400">0.02%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-5 px-6 py-4 border-b border-border text-xs font-semibold uppercase tracking-wider text-faint bg-surface-hover">
          <div className="col-span-2">Endpoint</div>
          <div>Status</div>
          <div>Latency</div>
          <div className="text-right">Timestamp</div>
        </div>
        <div className="divide-y divide-border">
          {requests.map(req => (
            <div key={req.id} className="grid grid-cols-5 px-6 py-4 items-center hover:bg-surface-hover/50 transition-colors cursor-pointer">
              <div className="col-span-2 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${req.error ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                  {req.error ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-medium font-mono text-sm">{req.endpoint}</span>
                  <span className="block text-xs text-muted">{req.id}</span>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${req.error ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {req.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono text-muted">
                <Clock className="w-3 h-3 text-faint" /> {req.time}
              </div>
              <div className="text-right text-sm text-faint">{req.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
