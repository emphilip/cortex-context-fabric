import Link from "next/link";
import { TokenBar } from "./TokenBar";

export interface QueryRowProps {
  id: number;
  created_at: string;
  principal: string;
  tool: string;
  query: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  outcome: "ok" | "error";
}

export function QueryRow(props: QueryRowProps) {
  const isError = props.outcome === "error";
  return (
    <Link
      href={`/queries/${props.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "120px 100px 80px 1fr 140px 80px 60px",
        gap: 12,
        padding: "8px 12px",
        borderBottom: "1px solid var(--border)",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>
        {new Date(props.created_at).toLocaleTimeString()}
      </span>
      <span>{props.principal}</span>
      <span style={{ color: "var(--muted)" }}>{props.tool}</span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={props.query}
      >
        {props.query}
      </span>
      <TokenBar
        tokens_in={props.tokens_in}
        tokens_out={props.tokens_out}
        compact
      />
      <span style={{ textAlign: "right", color: "var(--muted)" }}>
        {props.latency_ms} ms
      </span>
      <span
        style={{
          color: isError ? "var(--error)" : "var(--success)",
          fontWeight: 600,
        }}
      >
        {isError ? "ERR" : "OK"}
      </span>
    </Link>
  );
}
