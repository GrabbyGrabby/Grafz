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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Supabase env vars missing`);
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Unauthorized", detail: e?.message }, { status: 401 });
    }

    const newKey = "grafz_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // We store the API key as a special memory item to avoid needing a schema change
    const supabase = getSupabase();
    const payload = {
      content: "GRAFZ_API_KEY",
      metadata: { isApiKey: true, key: newKey },
      embedding: new Array(1536).fill(0),
      user_id: userId,
    };

    const { error } = await supabase.from("memories").insert([payload]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      apiKey: newKey
    }, { status: 201 });

  } catch (error: any) {
    console.error("API KEY CRASH:", error);
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}
