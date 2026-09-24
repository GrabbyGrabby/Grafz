import { NextRequest, NextResponse } from "next/server";
import { pipeline, env } from "@xenova/transformers";
import { PrivyClient } from "@privy-io/server-auth";
import { createClient } from "@supabase/supabase-js";

env.allowLocalModels = false;

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 1. Authenticate the User with Privy
    let userId;
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        // Fallback to checking the session cookie (privy-token)
        const cookieToken = req.cookies.get("privy-token")?.value;
        if (!cookieToken) throw new Error("No token");
        const verifiedClaims = await privy.verifyAuthToken(cookieToken);
        userId = verifiedClaims.userId;
      } else {
        const verifiedClaims = await privy.verifyAuthToken(token);
        userId = verifiedClaims.userId;
      }
    } catch (e) {
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
          user_id: userId, // Store Privy ID
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
    // 1. Authenticate the User with Privy
    let userId;
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        const cookieToken = req.cookies.get("privy-token")?.value;
        if (!cookieToken) throw new Error("No token");
        const verifiedClaims = await privy.verifyAuthToken(cookieToken);
        userId = verifiedClaims.userId;
      } else {
        const verifiedClaims = await privy.verifyAuthToken(token);
        userId = verifiedClaims.userId;
      }
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // If no query, return all documents (latest 50) for this user
    if (!query) {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return NextResponse.json({ results: data });
    }

    // If query exists, perform semantic search
    const embedding = await getEmbedding(query);
    const paddedEmbedding = [...embedding, ...new Array(1536 - embedding.length).fill(0)];

    // We must pass match_user_id to the RPC so it filters internally, since we bypass RLS with Service Key
    const { data, error } = await supabase.rpc("match_memories", {
      query_embedding: paddedEmbedding,
      match_threshold: 0.1,
      match_count: 5,
      match_user_id: userId
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

