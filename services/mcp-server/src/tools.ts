// MCP tool schemas + handlers for the thin MVP.
// Only `retrieve_for_context` is implemented end-to-end; the other tool stubs
// are registered (so `tools/list` returns the v0 surface) but throw a
// `not_implemented_in_mvp` error if called.

import { randomUUID } from "node:crypto";
import type { RetrievalRequest, RetrievalResponse } from "@hive-mind/shared";
import type { McpConfig } from "./config.js";
import type { PipelineClient } from "./pipeline-client.js";

export type ToolName =
  | "search"
  | "retrieve_for_context"
  | "get_entity"
  | "traverse_graph"
  | "submit_feedback";

export interface ToolDefinition {
  name: `hive_mind/${ToolName}`;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "hive_mind/retrieve_for_context",
    description:
      "Retrieve context fragments from the knowledge catalogue for a natural language query. Returns ordered fragments fitting a token budget, plus per-stage usage telemetry and a correlation_id that links back to the immutable audit record.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language query." },
        top_k: { type: "integer", minimum: 1, maximum: 200, default: 20 },
        token_budget: { type: "integer", minimum: 100, default: 4000 },
        filters: { type: "object", additionalProperties: true },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "hive_mind/search",
    description: "Lightweight search returning entity IDs + scores. (Not implemented in thin MVP.)",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, top_k: { type: "integer" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "hive_mind/get_entity",
    description: "Fetch a single entity by ID. (Not implemented in thin MVP.)",
    inputSchema: {
      type: "object",
      properties: { entity_id: { type: "string" } },
      required: ["entity_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hive_mind/traverse_graph",
    description:
      "Traverse the named-relationship knowledge graph from a starting entity. (Not implemented in thin MVP — knowledge-graph capability ships in a follow-up change.)",
    inputSchema: {
      type: "object",
      properties: {
        entity_id: { type: "string" },
        types: { type: "array", items: { type: "string" } },
        depth: { type: "integer", default: 2 },
        limit: { type: "integer", default: 50 },
      },
      required: ["entity_id"],
      additionalProperties: false,
    },
  },
  {
    name: "hive_mind/submit_feedback",
    description: "Submit usage feedback for a prior retrieval. (Not implemented in thin MVP.)",
    inputSchema: {
      type: "object",
      properties: {
        correlation_id: { type: "string" },
        rating: { type: "string", enum: ["useful", "partially_useful", "not_useful"] },
        notes: { type: "string" },
      },
      required: ["correlation_id", "rating"],
      additionalProperties: false,
    },
  },
];

export class NotImplementedInMvpError extends Error {
  code = "not_implemented_in_mvp" as const;
}

export interface RetrieveContextArgs {
  query: string;
  top_k?: number;
  token_budget?: number;
  filters?: Record<string, unknown>;
}

export interface ToolCallContext {
  correlationId?: string;
  config: McpConfig;
  pipeline: PipelineClient;
}

export async function callTool(
  name: string,
  args: unknown,
  ctx: ToolCallContext,
): Promise<RetrievalResponse | Record<string, unknown>> {
  switch (name) {
    case "hive_mind/retrieve_for_context":
      return retrieveForContext(args as RetrieveContextArgs, ctx);
    case "hive_mind/search":
    case "hive_mind/get_entity":
    case "hive_mind/traverse_graph":
    case "hive_mind/submit_feedback":
      throw new NotImplementedInMvpError(`${name} ships in a follow-up change`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function retrieveForContext(
  args: RetrieveContextArgs,
  ctx: ToolCallContext,
): Promise<RetrievalResponse> {
  if (!args || typeof args.query !== "string" || !args.query.trim()) {
    throw new Error("query is required and must be a non-empty string");
  }
  const correlation_id = ctx.correlationId || randomUUID();
  const req: RetrievalRequest = {
    correlation_id,
    identity: {
      principal: ctx.config.identity.principal,
      roles: ctx.config.identity.roles,
      tenant: ctx.config.tenant,
    },
    tool: "retrieve_for_context",
    query: args.query,
    ...(args.top_k !== undefined ? { top_k: args.top_k } : {}),
    ...(args.token_budget !== undefined ? { token_budget: args.token_budget } : {}),
    ...(args.filters !== undefined ? { filters: args.filters } : {}),
  };
  return await ctx.pipeline.retrieve(req);
}
