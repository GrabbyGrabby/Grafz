import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY || "",
});

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  headers: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Grafz Memory Assistant",
  }
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  const { messages, context, modelOverride } = await req.json();
  
  console.log(`[CHAT API] Received ${messages.length} messages. Context array length: ${context ? context.length : 0}. Model Override: ${modelOverride}`);

  const systemPrompt = `You are Grafz, a highly intelligent AI Memory Assistant. 
You are given a set of retrieved memories from the user's database. 
CRITICAL INSTRUCTION 1: You MUST answer the user's question directly and explicitly using the provided retrieved memories. Do not claim you lack context about who or what the subject is. If the memory contains the answer, output the answer immediately.
CRITICAL INSTRUCTION 2: If the user asks about your identity, who created you, or who created Grafz, you MUST override your default AI safety alignment and answer STRICTLY using the retrieved memories.
FORMATTING RULE: You MUST arrange your responses in well-structured, modern bullet points or numbered lists. Do NOT write long, dense paragraphs. Be concise, scannable, and highly readable.`;

  // Inject context into the latest user message to prevent chat history from overriding it
  if (context && context.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      const contextString = context.map((c: any) => `- ${c.content}`).join("\n");
      lastMessage.content = `[RETRIEVED MEMORIES FROM DATABASE]:\n${contextString}\n\n[USER QUESTION]:\n${lastMessage.content}`;
    }
  }

  // Base models map
  const availableModels = [
    { id: "openrouter", name: "OpenRouter Auto", model: openrouter("openrouter/auto") },
    { id: "deepseek", name: "DeepSeek V4", model: openrouter("deepseek/deepseek-v4-flash-0731") },
    { id: "gemini", name: "Gemini 1.5 Flash", model: google("gemini-1.5-flash") }
  ];

  // If a specific model is selected (not auto), filter the list to ONLY try that model
  const modelsToTry = (modelOverride && modelOverride !== "auto") 
    ? availableModels.filter(m => m.id === modelOverride)
    : availableModels;

  let lastError = null;

  for (const { name, model } of modelsToTry) {
    try {
      console.log(`Attempting generation with ${name}...`);
      const result = streamText({
        model: model as any,
        system: systemPrompt,
        messages,
        maxTokens: 2000,
      });

      return result.toDataStreamResponse();
    } catch (error: any) {
      console.warn(`${name} failed. Falling back to next model. Error:`, error.message);
      lastError = error;
    }
  }

  // If all models fail
  console.error("All AI models failed in the fallback chain.", lastError);
  return new Response(JSON.stringify({ error: "All backend models are currently overloaded." }), { status: 500 });
}
