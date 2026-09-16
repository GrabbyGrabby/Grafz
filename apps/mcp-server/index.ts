#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "cross-fetch";

// MCP Server Setup
const server = new Server(
  {
    name: "grafz-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const API_BASE = process.env.GRAFZ_API_URL || "http://localhost:3000/api";

// Define the tools Claude/Cursor can use
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_memory",
        description: "Search the Grafz semantic memory layer for context about a specific topic.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The semantic query to search for (e.g. 'What is the user's favorite framework?')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "save_memory",
        description: "Save a new piece of information or context to the Grafz memory layer for future retrieval.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The information to save.",
            },
          },
          required: ["content"],
        },
      }
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "search_memory") {
      const query = (request.params.arguments as any).query;
      const res = await fetch(`\${API_BASE}/memory?q=\${encodeURIComponent(query)}`);
      const data = await res.json();
      
      const memories = data.results 
        ? data.results.map((r: any) => `- \${r.content} (\${(r.similarity * 100).toFixed(1)}% match)`).join("\\n")
        : "No relevant memories found.";

      return {
        content: [
          {
            type: "text",
            text: `Memory Search Results for '\${query}':\\n\\n\${memories}`,
          },
        ],
      };
    } 
    
    if (request.params.name === "save_memory") {
      const content = (request.params.arguments as any).content;
      const res = await fetch(`\${API_BASE}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          source: "mcp-server", 
          tags: ["mcp"] 
        })
      });
      
      if (!res.ok) throw new Error("Failed to ingest");
      
      return {
        content: [
          {
            type: "text",
            text: "Successfully saved to Grafz Memory.",
          },
        ],
      };
    }

    throw new Error("Unknown tool");
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: \${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Grafz MCP Server running on stdio");
}

run().catch(console.error);
