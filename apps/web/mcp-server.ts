import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const server = new Server(
  {
    name: "grafz-memory-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_memories",
        description: "Search the user's Grafz memory database for context, facts, or past interactions.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to find relevant memories.",
            },
            userId: {
              type: "string",
              description: "The Privy user ID (did:privy:...) to scope the search to. If not provided, it searches globally (admin mode).",
            },
            limit: {
              type: "number",
              description: "Maximum number of memories to return (default: 5).",
            }
          },
          required: ["query"],
        },
      },
      {
        name: "save_memory",
        description: "Save a new memory to the user's Grafz database.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The content of the memory to save.",
            },
            userId: {
              type: "string",
              description: "The Privy user ID.",
            }
          },
          required: ["content", "userId"],
        },
      }
    ],
  };
});

// Implement the tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "search_memories") {
      const { query, userId, limit = 5 } = request.params.arguments as any;
      
      let dbQuery = supabase.from("memories").select("content, created_at");
      
      if (userId) {
        dbQuery = dbQuery.eq("user_id", userId);
      }
      
      const { data, error } = await dbQuery.order("created_at", { ascending: false }).limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      const formatted = data.map((m: any) => `[${m.created_at}] ${m.content}`).join("\n");

      return {
        content: [
          {
            type: "text",
            text: formatted || "No memories found.",
          },
        ],
      };
    }

    throw new Error("Tool not found");
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Run the server
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
