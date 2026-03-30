import { Suspense } from "react";
import LeaderboardClient from "@/components/LeaderboardClient";

export const revalidate = 60;

async function getAgents() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/agents`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch {
    return { agents: [], totalAgents: 0, error: true };
  }
}

export default async function Home() {
  const data = await getAgents();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "0",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(9,11,15,0.95)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--amber)",
              boxShadow: "0 0 8px var(--amber)",
            }}
            className="pulse"
          />
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: "var(--text-secondary)",
              letterSpacing: "0.1em",
            }}
          >
            ARC TESTNET · ERC-8004
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--text-dim)",
              textDecoration: "none",
              letterSpacing: "0.08em",
            }}
          >
            ARCSCAN ↗
          </a>
          <a
            href="https://docs.arc.network/arc/tutorials/register-your-first-ai-agent"
            target="_blank"
            rel="noopener"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--amber)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              border: "1px solid var(--amber-dim)",
              padding: "4px 10px",
              borderRadius: "3px",
            }}
          >
            REGISTER AGENT ↗
          </a>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          padding: "64px 32px 48px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--amber)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Onchain Reputation
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
          className="text-glow"
        >
          Agent
          <br />
          <span style={{ color: "var(--amber)" }}>Leaderboard</span>
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "15px",
            maxWidth: "480px",
            lineHeight: 1.6,
          }}
        >
          Live rankings for every ERC-8004 AI agent registered on Arc Testnet.
          Scores aggregated from onchain reputation events.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Total Agents", value: data.totalAgents ?? 0 },
            { label: "Latest Block", value: data.latestBlock ? `#${data.latestBlock.toLocaleString()}` : "—" },
            { label: "Blocks Scanned", value: data.scannedBlocks ? data.scannedBlocks.toLocaleString() : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <Suspense fallback={<LoadingSkeleton />}>
          <LeaderboardClient agents={data.agents ?? []} error={data.error} updatedAt={data.updatedAt} />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "72px",
            background: "var(--bg-card)",
            borderRadius: "4px",
            opacity: 1 - i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
