import { describe, expect, it } from "vitest";
import {
  NotImplementedInMvpError,
  TOOL_DEFINITIONS,
  callTool,
} from "./tools.js";
import type { McpConfig } from "./config.js";
import type { PipelineClient } from "./pipeline-client.js";

const config: McpConfig = {
  tenant: "default",
  identity: { principal: "alice", roles: ["reader"] },
  pipelineUrl: "http://unused",
  port: 8080,
};

class FakePipeline {
  public lastRequest: any = null;
  async retrieve(req: any) {
    this.lastRequest = req;
    return {
      correlation_id: req.correlation_id,
      fragments: [],
      usage: { total_tokens_in: 0, total_tokens_out: 0, total_latency_ms: 1, by_stage: [] },
      final_context_hash: "deadbeef",
    };
  }
  async health() {
    return true;
  }
}

describe("tools/list", () => {
  it("includes all five v0 tools, all under hive_mind/ namespace", () => {
    const names = TOOL_DEFINITIONS.map((t) => t.name);
    expect(names).toContain("hive_mind/retrieve_for_context");
    expect(names).toContain("hive_mind/search");
    expect(names).toContain("hive_mind/get_entity");
    expect(names).toContain("hive_mind/traverse_graph");
    expect(names).toContain("hive_mind/submit_feedback");
    for (const t of TOOL_DEFINITIONS) {
      expect(t.name.startsWith("hive_mind/")).toBe(true);
      expect(t.inputSchema).toBeTypeOf("object");
    }
  });
});

describe("retrieve_for_context", () => {
  it("propagates identity and generates a correlation id when none supplied", async () => {
    const pipeline = new FakePipeline() as unknown as PipelineClient;
    const result = await callTool(
      "hive_mind/retrieve_for_context",
      { query: "hello" },
      { config, pipeline },
    );
    const sent = (pipeline as any).lastRequest;
    expect(sent.identity.principal).toBe("alice");
    expect(sent.identity.tenant).toBe("default");
    expect(sent.identity.roles).toEqual(["reader"]);
    expect(sent.correlation_id).toBeTypeOf("string");
    expect((result as any).correlation_id).toEqual(sent.correlation_id);
  });

  it("preserves a caller-supplied correlation id", async () => {
    const pipeline = new FakePipeline() as unknown as PipelineClient;
    await callTool(
      "hive_mind/retrieve_for_context",
      { query: "hello" },
      { config, pipeline, correlationId: "cid-123" },
    );
    expect((pipeline as any).lastRequest.correlation_id).toBe("cid-123");
  });

  it("rejects empty queries", async () => {
    const pipeline = new FakePipeline() as unknown as PipelineClient;
    await expect(
      callTool("hive_mind/retrieve_for_context", { query: " " }, { config, pipeline }),
    ).rejects.toThrow(/required/);
  });
});

describe("stub tools", () => {
  it.each([
    "hive_mind/search",
    "hive_mind/get_entity",
    "hive_mind/traverse_graph",
    "hive_mind/submit_feedback",
  ])("%s throws NotImplementedInMvpError", async (name) => {
    const pipeline = new FakePipeline() as unknown as PipelineClient;
    await expect(callTool(name, {}, { config, pipeline })).rejects.toBeInstanceOf(
      NotImplementedInMvpError,
    );
  });
});
