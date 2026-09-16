import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

// Shared Singleton for Embeddings (to keep the API lightning fast in Serverless)
class PipelineSingleton {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
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
    // Basic API Key Authentication (Extremely simple for Omnichannel access)
    const authHeader = req.headers.get("Authorization");
    // TODO: Re-enable auth once NextAuth is fully integrated
    // if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    //   return NextResponse.json({ error: "Unauthorized. Invalid API Key." }, { status: 401 });
    // }

    const { content, source, tags = [] } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // 1. Vectorize Content locally (Free, no OpenAI API costs)
    const embedding = await getEmbedding(content);
    
    // Convert to 1536 dim to match standard pgvector size in db
    const paddedEmbedding = [...embedding, ...new Array(1536 - embedding.length).fill(0)];

    // 2. Store in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          content,
          metadata: { source, tags },
          embedding: paddedEmbedding,
        },
      ])
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
