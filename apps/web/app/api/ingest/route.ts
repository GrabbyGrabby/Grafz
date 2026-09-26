import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Defer PrivyClient creation to runtime to catch missing env vars
function getPrivyClient() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(`Privy env vars missing: appId=${!!appId}, appSecret=${!!appSecret}`);
  }
  const { PrivyClient } = require("@privy-io/server-auth");
  return new PrivyClient(appId, appSecret);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Supabase env vars missing: url=${!!url}, key=${!!key}`);
  }
  return createClient(url, key);
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
    throw new Error(`Gemini embedding failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.embedding.values as number[];
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    let userId;
    try {
      const privy = getPrivyClient();
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        const cookieToken = req.cookies.get("privy-token")?.value;
        if (!cookieToken) throw new Error("No token found");
        const verifiedClaims = await privy.verifyAuthToken(cookieToken);
        userId = verifiedClaims.userId;
      } else {
        const verifiedClaims = await privy.verifyAuthToken(token);
        userId = verifiedClaims.userId;
      }
    } catch (e: any) {
      console.error("Auth error:", e?.message || e);
      return NextResponse.json({ error: "Unauthorized", detail: e?.message }, { status: 401 });
    }

    console.log("INGESTION: userId =", userId);

    const body = await req.json();
    const { content, source, tags = [] } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Embedding
    console.log("INGESTION: generating embedding...");
    const embedding = await getEmbedding(content);
    const paddedEmbedding = [...embedding, ...new Array(Math.max(0, 1536 - embedding.length)).fill(0)];
    console.log("INGESTION: embedding done, dims =", embedding.length);

    // Insert
    const supabase = getSupabase();
    const payload = {
      content,
      metadata: { source, tags },
      embedding: paddedEmbedding,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("memories")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error));
      return NextResponse.json({ error: "Database error", detail: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Memory successfully ingested",
      memory: data,
    }, { status: 201 });

  } catch (error: any) {
    console.error("INGESTION CRASH:", error?.message || error, error?.stack);
    return NextResponse.json(
      { error: "Failed to ingest memory", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
