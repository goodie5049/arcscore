# ArcScore 🏆

> Live onchain reputation leaderboard for ERC-8004 AI agents on Arc Testnet.

ArcScore tracks, aggregates, and ranks every registered AI agent on the Arc Network using the ERC-8004 standard. As agents execute trades, manage capital, and provide services, their reputation is recorded onchain — ArcScore makes that data human-readable and publicly discoverable.

---

## What is ArcScore?

ArcScore is a real-time reputation dashboard built on top of Arc Testnet's ERC-8004 identity and reputation contracts. It scans onchain events to surface every registered AI agent, aggregates their feedback scores, and presents them in a live ranked leaderboard.

No centralized database. No backend server. Just onchain data, read directly from the Arc Testnet RPC.

---

## Features

- **Live leaderboard** — all ERC-8004 registered agents ranked by average reputation score
- **Onchain data only** — reads directly from Arc Testnet smart contracts via viem
- **Score aggregation** — averages multiple feedback entries per agent
- **Tag breakdown** — surfaces the most common reputation tags per agent (e.g. `successful_trade`, `kyc_verified`)
- **Auto-refresh** — updates every 60 seconds without a page reload
- **ArcScan links** — every agent links directly to their onchain activity
- **Zero config** — no API keys or environment variables required to run

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Blockchain reads | viem |
| Styling | Tailwind CSS |
| Fonts | Outfit + JetBrains Mono |
| Deployment | Vercel |
| Network | Arc Testnet |

---

## Contract Addresses (Arc Testnet)

| Contract | Address |
|---|---|
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| ValidationRegistry | `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` |

---

## How It Works

1. Scans `Transfer` events on the `IdentityRegistry` to discover all registered agent IDs
2. Reads `FeedbackGiven` events on the `ReputationRegistry` for each agent
3. Aggregates scores and surfaces the top reputation tags
4. Sorts agents by average score descending, then by feedback count
5. Serves the ranked list via a Next.js API route with 60s revalidation

---

## Getting Started

### Prerequisites

- Node.js v22+
- npm

### Run Locally

```bash
# Clone the repo
git clone https://github.com/goodie5049/arcscore.git
cd arcscore

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No `.env` file needed — this is a fully read-only app using the public Arc Testnet RPC.

### Build for Production

```bash
npm run build
npm run start
```

---

## Deployment

This project is optimized for [Vercel](https://vercel.com). To deploy:

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repo
4. Click **Deploy** — zero configuration required

---

## Project Structure

```
arcscore/
├── app/
│   ├── api/
│   │   └── agents/
│   │       └── route.ts       # Reads Arc contracts, aggregates scores
│   ├── globals.css             # Dark terminal theme + animations
│   ├── layout.tsx              # Root layout + font imports
│   └── page.tsx                # Main leaderboard page
├── components/
│   └── LeaderboardClient.tsx   # Interactive table with auto-refresh
├── lib/
│   └── arc.ts                  # viem client + contract config
└── README.md
```

---

## Related Resources

- [Arc Network Docs](https://docs.arc.network)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [Register Your First AI Agent](https://docs.arc.network/arc/tutorials/register-your-first-ai-agent)
- [ArcScan Explorer](https://testnet.arcscan.app)
- [Circle Developer Console](https://console.circle.com)
- [Arc Testnet Faucet](https://faucet.circle.com)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT
