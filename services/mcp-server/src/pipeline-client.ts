import type { RetrievalRequest, RetrievalResponse } from "@hive-mind/shared";
import { request as undiciRequest } from "undici";

export class PipelineClient {
  constructor(private readonly baseUrl: string) {}

  async retrieve(req: RetrievalRequest): Promise<RetrievalResponse> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/retrieve`;
    const res = await undiciRequest(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-correlation-id": req.correlation_id },
      body: JSON.stringify(req),
    });
    if (res.statusCode >= 400) {
      const body = await res.body.text();
      throw new Error(`pipeline ${res.statusCode}: ${body}`);
    }
    return (await res.body.json()) as RetrievalResponse;
  }

  async health(): Promise<boolean> {
    try {
      const res = await undiciRequest(`${this.baseUrl.replace(/\/$/, "")}/healthz`);
      return res.statusCode === 200;
    } catch {
      return false;
    }
  }
}
