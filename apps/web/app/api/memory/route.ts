import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getPrivyClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(`Privy env vars missing`);
  }
  const { PrivyClient } = require("@privy-io/server-auth");
  return new PrivyClient(appId, appSecret);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.warn(`Gemini embedding failed (${res.status}): ${err}`);
    return new Array(1536).fill(0);
  }

  const data = await res.json();
  return data.embedding.values as number[];
}

export async function POST(req: NextRequest) {
  try {
    const { content, metadata } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let userId;
    try {
      const privy = getPrivyClient();
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

    const embedding = await getEmbedding(content);
    const paddedEmbedding = [...embedding, ...new Array(Math.max(0, 1536 - embedding.length)).fill(0)];
    const finalEmbedding = paddedEmbedding.slice(0, 1536);
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          content,
          metadata: metadata || {},
          embedding: finalEmbedding,
          user_id: userId,
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
    let userId;
    try {
      const privy = getPrivyClient();
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

    const supabase = getSupabase();

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

    const embedding = await getEmbedding(query);
    const paddedEmbedding = [...embedding, ...new Array(Math.max(0, 1536 - embedding.length)).fill(0)];
    const finalEmbedding = paddedEmbedding.slice(0, 1536);

    let { data, error } = await supabase.rpc("match_memories", {
      query_embedding: finalEmbedding,
      match_threshold: 0.1,
      match_count: 5,
      match_user_id: userId
    });

    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }

    // FALLBACK: If vector search fails (e.g., memory was inserted as a zero-vector during API rate limits),
    // perform a standard text search.
    if (!data || data.length === 0) {
      console.log("Vector search yielded 0 results, falling back to text search.");
      // Create a simple broad search by splitting query into words
      const words = query.split(/\s+/).filter(w => w.length > 3);
      let textQuery = supabase.from("memories").select("*").eq("user_id", userId);
      
      if (words.length > 0) {
        // Use ilike on the most prominent word for a simple fallback
        textQuery = textQuery.ilike("content", `%${words[0]}%`);
      } else {
        textQuery = textQuery.ilike("content", `%${query}%`);
      }

      const textFallback = await textQuery.limit(5);
      if (textFallback.data && textFallback.data.length > 0) {
        data = textFallback.data;
      }
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error("Memory search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
