import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embedding failed: ${err}`);
  }

  const data = await res.json();
  return data.embedding.values as number[];
}

export async function POST(req: NextRequest) {
  try {
    let userId;
    try {
      const authHeader = req.headers.get("Authorization") || "";
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
      return NextResponse.json({ error: "Unauthorized. Invalid Token." }, { status: 401 });
    }

    console.log("================= INGESTION TRIGGERED ======================");
    console.log("Extracted Privy User ID:", userId);

    const { content, source, tags = [] } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const embedding = await getEmbedding(content);
    // Gemini text-embedding-004 outputs 768 dimensions; pad to 1536 for the DB column
    const paddedEmbedding = [...embedding, ...new Array(Math.max(0, 1536 - embedding.length)).fill(0)];
    
    const payload = {
      content,
      metadata: { source, tags },
      embedding: paddedEmbedding,
      user_id: userId,
    };
    
    console.log("Inserting Payload:", { ...payload, embedding: "[VECTOR BLOB HIDDEN]" });

    const { data, error } = await supabase
      .from("memories")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Memory successfully ingested",
      memory: data 
    }, { status: 201 });

  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: "Failed to ingest memory" }, { status: 500 });
  }
}
