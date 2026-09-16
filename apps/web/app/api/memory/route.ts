import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

class PipelineSingleton {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2"; // 384 dimensions
  static instance: any = null;

  static async getInstance(progress_callback: any = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task as any, this.model, { progress_callback });
    }
    return this.instance;
  }
}

async function getEmbedding(text: string) {
  const extractor = await PipelineSingleton.getInstance();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
}

export async function POST(req: NextRequest) {
  try {
    const { content, metadata } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // 1. Authenticate the User
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Generate Embeddings using direct REST API
    const embedding = await getEmbedding(content);
    
    // Convert embedding vector to 1536 by padding with zeros
    const paddedEmbedding = [...embedding, ...new Array(1536 - embedding.length).fill(0)];
    
    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          content,
          metadata: metadata || {},
          embedding: paddedEmbedding, // 1536 dimensions
          user_id: user.id, // Store for this specific user
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, memory: data }, { status: 201 });
  } catch (error) {
    console.error("Memory ingestion error:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");

  try {
    // 1. Authenticate the User
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // If no query, return all documents (latest 50) for this user
    if (!query) {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return NextResponse.json({ results: data });
    }

    // If query exists, perform semantic search
    const embedding = await getEmbedding(query);
    const paddedEmbedding = [...embedding, ...new Array(1536 - embedding.length).fill(0)];

    // By using the authenticated client, RLS (if enabled) will automatically filter out other users' memories.
    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: paddedEmbedding,
      match_threshold: 0.1,
      match_count: 5,
    });

    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error("Memory search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

