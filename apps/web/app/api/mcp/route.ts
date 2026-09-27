import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

let server: Server;
let transport: SSEServerTransport;

function initializeServer() {
  if (server) return;
  
  server = new Server(
    { name: "grafz-memory", version: "1.2.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_grafz_memories",
          description: "Search the user's Grafz semantic memory graph for context or facts.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query." },
              limit: { type: "number", description: "Maximum results." },
            },
            required: ["query"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === "search_grafz_memories") {
      // In a real implementation, we would extract the auth token from the request
      // and call the internal Supabase client. 
      // For now, this is a mock response to prove the SSE endpoint is alive.
      return {
        content: [
          { type: "text", text: JSON.stringify([{ id: "1", content: "Grafz SSE endpoint connected successfully!" }]) }
        ]
      };
    }
    throw new Error(`Unknown tool: ${name}`);
  });
}

export async function GET(req: NextRequest) {
  // SSE connection endpoint
  initializeServer();
  transport = new SSEServerTransport("/api/mcp/messages", NextResponse);
  await server.connect(transport);
  return transport.response;
}

export async function POST(req: NextRequest) {
  // Message endpoint
  if (!transport) {
    return NextResponse.json({ error: "SSE connection not initialized" }, { status: 400 });
  }
  await transport.handlePostMessage(req);
  return NextResponse.json({ success: true });
}
