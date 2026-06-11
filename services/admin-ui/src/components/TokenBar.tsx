export interface TokenBarProps {
  tokens_in: number;
  tokens_out: number;
  compact?: boolean;
}

export function TokenBar({ tokens_in, tokens_out, compact = false }: TokenBarProps) {
  const total = Math.max(1, tokens_in + tokens_out);
  const inPct = Math.round((tokens_in / total) * 100);
  const outPct = 100 - inPct;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      title={`in: ${tokens_in}, out: ${tokens_out}`}
    >
      {!compact && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>↑ {tokens_in}</span>
          <span>↓ {tokens_out}</span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          height: compact ? 6 : 8,
          background: "var(--code-bg)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            width: `${inPct}%`,
            background: "var(--accent)",
          }}
        />
        <span style={{ width: `${outPct}%`, background: "var(--success)" }} />
      </div>
    </div>
  );
}
