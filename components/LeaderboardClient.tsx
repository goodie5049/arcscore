"use client";

import { useState, useEffect, useCallback } from "react";

type Agent = {
  rank: number;
  agentId: string;
  owner: string;
  metadataURI: string;
  avgScore: number;
  feedbackCount: number;
  topTags: string[];
};

type Props = {
  agents: Agent[];
  error?: boolean;
  updatedAt?: string;
};

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--amber)" : "var(--red)";

  return (
    <div
      style={{
        background: "var(--border)",
        borderRadius: "2px",
        height: "4px",
        width: "100px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        className="score-bar"
        style={{
          height: "100%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          "--target-width": `${pct}%`,
          "--delay": `${delay}s`,
        } as React.CSSProperties}
      />
    </div>
  );
}

export default function LeaderboardClient({ agents: initialAgents, error, updatedAt }: Props) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(updatedAt ?? "");
  const [hovered, setHovered] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const data = await res.json();
      if (data.agents?.length > 0) {
        setAgents(data.agents);
        setLastUpdated(data.updatedAt);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  if (error && agents.length === 0) {
    return (
      <div
        style={{
          padding: "48px",
          textAlign: "center",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px" }}>
          Failed to load agent data. Check RPC connection.
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div
        style={{
          padding: "64px",
          textAlign: "center",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--bg-card)",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          No agents registered yet.
        </div>
        <a
          href="https://docs.arc.network/arc/tutorials/register-your-first-ai-agent"
          target="_blank"
          rel="noopener"
          style={{ color: "var(--amber)", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}
        >
          Be the first → Register your agent ↗
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 120px 80px 80px 160px",
          gap: "16px",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          alignItems: "center",
        }}
      >
        {["#", "AGENT", "SCORE", "FEEDBACK", "BAR", "TOP TAGS"].map((h) => (
          <span
            key={h}
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: "var(--text-dim)",
              letterSpacing: "0.12em",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {agents.map((agent, i) => {
          const isHovered = hovered === agent.agentId;
          const rankClass =
            agent.rank === 1 ? "rank-1" : agent.rank === 2 ? "rank-2" : agent.rank === 3 ? "rank-3" : "";

          return (
            <div
              key={agent.agentId}
              className="row-enter"
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 120px 80px 80px 160px",
                gap: "16px",
                padding: "16px 20px",
                background: isHovered ? "var(--bg-hover)" : "var(--bg-card)",
                border: "1px solid transparent",
                borderColor: isHovered ? "var(--border-bright)" : "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                alignItems: "center",
                transition: "all 0.15s ease",
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={() => setHovered(agent.agentId)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                window.open(
                  `https://testnet.arcscan.app/address/${agent.owner}`,
                  "_blank"
                )
              }
            >
              {/* Rank */}
              <span
                className={rankClass}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: rankClass ? undefined : "var(--text-dim)",
                }}
              >
                {agent.rank <= 3 ? ["🥇", "🥈", "🥉"][agent.rank - 1] : `#${agent.rank}`}
              </span>

              {/* Agent info */}
              <div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "13px",
                    color: isHovered ? "var(--amber)" : "var(--text-primary)",
                    transition: "color 0.15s",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Agent #{agent.agentId}
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  {shortAddr(agent.owner)}
                </div>
              </div>

              {/* Score */}
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "22px",
                  fontWeight: 500,
                  color:
                    agent.avgScore >= 80
                      ? "var(--green)"
                      : agent.avgScore >= 50
                      ? "var(--amber)"
                      : agent.feedbackCount === 0
                      ? "var(--text-dim)"
                      : "var(--red)",
                  letterSpacing: "-0.03em",
                }}
              >
                {agent.feedbackCount === 0 ? "—" : agent.avgScore}
              </div>

              {/* Feedback count */}
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                {agent.feedbackCount > 0 ? `${agent.feedbackCount}×` : "0×"}
              </div>

              {/* Score bar */}
              <ScoreBar score={agent.avgScore} delay={i * 0.05} />

              {/* Tags */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {agent.topTags.length > 0 ? (
                  agent.topTags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      color: "var(--text-dim)",
                    }}
                  >
                    no tags
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 4px 0",
          borderTop: "1px solid var(--border)",
          marginTop: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: "var(--text-dim)",
          }}
        >
          {lastUpdated
            ? `Updated ${new Date(lastUpdated).toISOString().slice(11, 19)} UTC`
            : "Auto-refreshes every 60s"}
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: loading ? "var(--text-dim)" : "var(--amber)",
            background: "transparent",
            border: "1px solid",
            borderColor: loading ? "var(--border)" : "var(--amber-dim)",
            padding: "6px 14px",
            borderRadius: "3px",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.08em",
            transition: "all 0.15s",
          }}
        >
          {loading ? "LOADING..." : "↻ REFRESH"}
        </button>
      </div>
    </div>
  );
}
