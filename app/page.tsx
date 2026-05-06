"use client";

import { useState, useEffect } from "react";
import Link from "next/link";


const MILESTONES = [
  { date: "Aug 2025", label: "Arc announced as Economic OS", done: true },
  { date: "Oct 2025", label: "Public Testnet launched", done: true },
  { date: "Oct 2025", label: "100+ institutions onboarded", done: true },
  { date: "Jan 2026", label: "ERC-8004 live on Arc Testnet", done: true },
  { date: "Feb 2026", label: "ERC-8004 live on Ethereum Mainnet", done: true },
  { date: "Apr 2026", label: "Quantum-resistant wallets announced", done: true },
  { date: "2026", label: "Arc Mainnet Launch", done: false },
];

const PARTNERS = [
  "BlackRock", "Visa", "Goldman Sachs", "HSBC", "BNY Mellon",
  "Anthropic", "Coinbase", "Kraken", "Aave", "Morpho",
  "MetaMask", "Ledger", "Chainlink", "LayerZero", "Alchemy",
];


function useLiveStats() {
  const [stats, setStats] = useState({
    latestBlock: 40642161,
    totalAgents: 0,
    tps: "~150",
  });

  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        ...s,
        latestBlock: s.latestBlock + Math.floor(Math.random() * 3 + 1),
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return stats;
}


export default function HomePage() {
  const stats = useLiveStats();
  const [tickerPos, setTickerPos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerPos((p) => p - 1);
    }, 30);
    return () => clearInterval(id);
  }, []);

  const handleShare = () => {
    const tweet = `Arc Mainnet is coming 🔥\n\nMainnet date: TBA\n\n📦 Block #${stats.latestBlock.toLocaleString()}\n\ntrack it live → arcscore.vercel.app\n\n@arc_network @circle #ArcNetwork #ERC8004`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank");
  };

  const tickerContent = [...PARTNERS, ...PARTNERS].join("  ·  ");
  const charWidth = 10;
  const totalWidth = tickerContent.length * charWidth;
  const wrappedPos = ((tickerPos % totalWidth) + totalWidth) % totalWidth;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070a0e",
        color: "#e8eaf0",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.4,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(240,165,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,165,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(240,165,0,0.1)",
          background: "rgba(7,10,14,0.9)",
          backdropFilter: "blur(20px)",
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f0a500",
              boxShadow: "0 0 8px #f0a500",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px",
              fontWeight: 700,
              color: "#f0a500",
              letterSpacing: "0.1em",
            }}
          >
            ARCSCORE
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "LEADERBOARD", href: "/leaderboard" },
            { label: "ARCSCAN ↗", href: "https://testnet.arcscan.app", external: true },
          ].map(({ label, href, external }) => (
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "#3d5166",
                  textDecoration: "none",
                  padding: "6px 14px",
                  border: "1px solid #1e2d3d",
                  borderRadius: "4px",
                  letterSpacing: "0.08em",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "#3d5166",
                  textDecoration: "none",
                  padding: "6px 14px",
                  border: "1px solid #1e2d3d",
                  borderRadius: "4px",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Hero section */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 40px 60px",
          maxWidth: "1000px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(240,165,0,0.08)",
            border: "1px solid rgba(240,165,0,0.2)",
            borderRadius: "20px",
            padding: "6px 16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00c896",
              boxShadow: "0 0 6px #00c896",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#f0a500",
              letterSpacing: "0.15em",
            }}
          >
            ARC TESTNET LIVE · MAINNET INCOMING
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif",
            marginBottom: "24px",
          }}
        >
          The Economic
          <br />
          <span
            style={{
              color: "#f0a500",
              textShadow: "0 0 60px rgba(240,165,0,0.3)",
            }}
          >
            OS is Coming.
          </span>
        </h1>

        <p
          style={{
            color: "#6b7d8f",
            fontSize: "16px",
            maxWidth: "520px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Arc is building the internet's financial layer — stablecoin-native, 
          sub-second settlement, AI-ready. The mainnet launch will change everything.
        </p>

        {/* Mainnet TBA */}
<div
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(240,165,0,0.06)",
    border: "1px solid rgba(240,165,0,0.2)",
    borderRadius: "12px",
    padding: "20px 40px",
    marginBottom: "48px",
  }}
>
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#f0a500",
      boxShadow: "0 0 12px rgba(240,165,0,0.6)",
      animation: "pulse 2s infinite",
      flexShrink: 0,
    }}
  />
  <div>
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(20px, 3vw, 32px)",
        fontWeight: 700,
        color: "#f0a500",
        letterSpacing: "-0.02em",
      }}
    >
      MAINNET DATE: TBA
    </div>
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        color: "#3d5166",
        letterSpacing: "0.15em",
        marginTop: "4px",
      }}
    >
      OFFICIAL ANNOUNCEMENT COMING FROM @ARC
    </div>
  </div>
</div>
        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleShare}
            style={{
              background: "#f0a500",
              color: "#000",
              border: "none",
              padding: "14px 28px",
              borderRadius: "6px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 30px rgba(240,165,0,0.3)",
              transition: "all 0.2s",
            }}
          >
            𝕏 SHARE ON TWITTER
          </button>
          <Link
            href="/leaderboard"
            style={{
              background: "transparent",
              color: "#f0a500",
              border: "1px solid rgba(240,165,0,0.3)",
              padding: "14px 28px",
              borderRadius: "6px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            VIEW LEADERBOARD →
          </Link>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          borderTop: "1px solid rgba(240,165,0,0.08)",
          borderBottom: "1px solid rgba(240,165,0,0.08)",
          background: "rgba(240,165,0,0.02)",
          padding: "32px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "32px",
            textAlign: "center",
          }}
        >
          {[
            { label: "Latest Block", value: `#${stats.latestBlock.toLocaleString()}`, live: true },
            { label: "Testnet TPS", value: stats.tps, live: true },
            { label: "ERC-8004 Agents", value: stats.totalAgents.toString(), live: false },
            { label: "Institutions", value: "100+", live: false },
            { label: "USDC Gas", value: "Native", live: false },
            { label: "Finality", value: "<1s", live: false },
          ].map(({ label, value, live }) => (
            <div key={label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                {live && (
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#00c896",
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#e8eaf0",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {value}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: "#3d5166",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 40px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#f0a500",
              letterSpacing: "0.2em",
            }}
          >
            THE JOURNEY
          </span>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
              color: "#e8eaf0",
            }}
          >
            Milestones
          </h2>
        </div>

        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: "119px",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "linear-gradient(180deg, transparent, rgba(240,165,0,0.3) 10%, rgba(240,165,0,0.1) 80%, transparent)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                  padding: "16px 0",
                  opacity: m.done ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "#3d5166",
                    width: "80px",
                    flexShrink: 0,
                    textAlign: "right",
                    paddingTop: "2px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {m.date}
                </div>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: "2px",
                    position: "relative",
                    zIndex: 1,
                    background: m.done ? "#f0a500" : "transparent",
                    border: m.done ? "none" : "1px solid #2a3f55",
                    boxShadow: m.done ? "0 0 12px rgba(240,165,0,0.5)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!m.done && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f0a500", animation: "pulse 2s infinite" }} />
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "15px",
                    color: m.done ? "#e8eaf0" : "#f0a500",
                    paddingTop: "1px",
                    fontWeight: m.done ? 400 : 700,
                  }}
                >
                  {m.label}
                  {!m.done && (
                    <span
                      style={{
                        marginLeft: "10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        color: "#f0a500",
                        background: "rgba(240,165,0,0.1)",
                        border: "1px solid rgba(240,165,0,0.2)",
                        padding: "2px 8px",
                        borderRadius: "3px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      NEXT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Ticker */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          borderTop: "1px solid rgba(240,165,0,0.08)",
          borderBottom: "1px solid rgba(240,165,0,0.08)",
          padding: "20px 0",
          overflow: "hidden",
          background: "rgba(240,165,0,0.02)",
        }}
      >
        <div style={{ marginBottom: "8px", textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "#2a3f55",
              letterSpacing: "0.2em",
            }}
          >
            BUILDING ON ARC
          </span>
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            transform: `translateX(-${wrappedPos}px)`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            color: "#2a3f55",
            letterSpacing: "0.1em",
          }}
        >
          {tickerContent}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#3d5166",
            letterSpacing: "0.2em",
            marginBottom: "16px",
          }}
        >
          ALREADY ON TESTNET
        </p>
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#e8eaf0",
            marginBottom: "32px",
          }}
        >
          Register your AI agent today.
          <br />
          <span style={{ color: "#f0a500" }}>Build reputation before mainnet.</span>
        </h2>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="https://docs.arc.network/arc/tutorials/register-your-first-ai-agent"
            target="_blank"
            rel="noopener"
            style={{
              background: "#f0a500",
              color: "#000",
              padding: "14px 28px",
              borderRadius: "6px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(240,165,0,0.2)",
            }}
          >
            REGISTER AGENT →
          </a>
          <Link
            href="/leaderboard"
            style={{
              border: "1px solid rgba(240,165,0,0.2)",
              color: "#f0a500",
              padding: "14px 28px",
              borderRadius: "6px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            VIEW LEADERBOARD
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 2,
          borderTop: "1px solid #0d1520",
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#1e2d3d",
            letterSpacing: "0.1em",
          }}
        >
          ARCSCORE · BUILT ON ARC TESTNET
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#1e2d3d",
            letterSpacing: "0.1em",
          }}
        >
          NOT AFFILIATED WITH CIRCLE OR ARC NETWORK
        </span>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
