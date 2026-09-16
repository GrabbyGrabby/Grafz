"use client";

import React, { useState } from "react";
import { Tags, Plus, Search } from "lucide-react";

export default function TagsPage() {
  const [tags, setTags] = useState([
    { id: 1, name: "Project Alpha", count: 42, color: "bg-blue-500" },
    { id: 2, name: "Meetings", count: 12, color: "bg-purple-500" },
    { id: 3, name: "Research", count: 87, color: "bg-emerald-500" }
  ]);
  const [newTag, setNewTag] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setTags([...tags, { id: Date.now(), name: newTag, count: 0, color: "bg-primary" }]);
    setNewTag("");
  };

  return (
    <div className="h-full flex flex-col font-sans max-w-5xl mx-auto w-full p-8 text-main">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Container Tags</h1>
          <p className="text-muted">Organize your semantic memory into isolated knowledge boundaries.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-bg px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Tag
        </button>
      </div>
      
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl mb-6">
        <form onSubmit={handleCreate} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
            <input 
              type="text" 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Search or create a new tag..." 
              className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-main placeholder-faint focus:border-primary outline-none transition-all"
            />
          </div>
          <button type="submit" disabled={!newTag.trim()} className="bg-surface-hover border border-border px-6 rounded-xl font-medium hover:border-primary transition-all disabled:opacity-50">
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tags.map(tag => (
          <div key={tag.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-border-strong transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-3 h-3 rounded-full ${tag.color}`} />
              <span className="text-xs text-faint font-medium">{tag.count} memories</span>
            </div>
            <h3 className="font-semibold text-lg">{tag.name}</h3>
            <p className="text-xs text-muted mt-2 group-hover:text-primary transition-colors">View container →</p>
          </div>
        ))}
      </div>
    </div>
  );
}
