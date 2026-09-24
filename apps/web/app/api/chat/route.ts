import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  // Initialize inside POST to ensure env variables are loaded
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
  });

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
      const contextString = context.map((c: any) => `- ${c.content || JSON.stringify(c)}`).join("\n");
      const enhancedContent = `[RETRIEVED MEMORIES FROM DATABASE]:\n${contextString}\n\n[USER QUESTION]:\n${lastMessage.content}`;
      lastMessage.content = enhancedContent;
      // Also mutate parts if they exist, to ensure Vercel AI SDK uses the enhanced prompt
      if (lastMessage.parts && lastMessage.parts.length > 0 && lastMessage.parts[0].type === "text") {
         lastMessage.parts[0].text = enhancedContent;
      }
      console.log("MUTATED LAST MESSAGE:", lastMessage.content);
    }
  }

  // Base models map
  const availableModels = [
    { id: "gemini-free", name: "Gemini 3.5 Flash", model: google("models/gemini-3.5-flash") },
    { id: "gemini-pro", name: "Gemini 3.5 Pro", model: google("models/gemini-3.5-pro") },
    { id: "gemini-2-flash", name: "Gemini 2.5 Flash", model: google("models/gemini-2.5-flash") }
  ];

  // If a specific model is selected (not auto), filter the list to ONLY try that model
  const modelsToTry = (modelOverride && modelOverride !== "auto") 
    ? availableModels.filter(m => m.id === modelOverride)
    : availableModels;

  let lastError = null;

  for (const { name, model } of modelsToTry) {
    try {
      console.log(`Attempting generation with ${name}...`);
      const result = await streamText({
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
