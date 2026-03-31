import { NextResponse } from "next/server";
import { parseAbiItem } from "viem";
import {
  publicClient,
  IDENTITY_REGISTRY,
  REPUTATION_REGISTRY,
  identityAbi,
} from "@/lib/arc";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 3000n ? latestBlock - 3000n : 0n;

    // Get Transfer + Feedback logs in PARALLEL
    const [transferLogs, feedbackLogs] = await Promise.all([
      publicClient.getLogs({
        address: IDENTITY_REGISTRY,
        event: parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
        ),
        args: { from: "0x0000000000000000000000000000000000000000" },
        fromBlock,
        toBlock: latestBlock,
      }),
      publicClient.getLogs({
        address: REPUTATION_REGISTRY,
        event: parseAbiItem(
          "event FeedbackGiven(uint256 indexed agentId, address indexed from, int128 score, uint8 feedbackType, string tag)"
        ),
        fromBlock,
        toBlock: latestBlock,
      }),
    ]);

    if (transferLogs.length === 0) {
      return NextResponse.json({ agents: [], scannedBlocks: Number(latestBlock - fromBlock) });
    }

    const agentIds = [
      ...new Set(
        transferLogs
          .map((log) => (log as any).args?.tokenId as bigint | undefined)
          .filter((id): id is bigint => id !== undefined)
      ),
    ];

    // Aggregate scores
    const scoreMap = new Map<string, { scores: number[]; tags: string[]; feedbackCount: number }>();
    for (const log of feedbackLogs) {
      const args = (log as any).args;
      if (!args) continue;
      const agentId = String(args.agentId as bigint);
      const score = Number(args.score as bigint);
      const tag = (args.tag as string) || "";
      if (!scoreMap.has(agentId)) scoreMap.set(agentId, { scores: [], tags: [], feedbackCount: 0 });
      const entry = scoreMap.get(agentId)!;
      entry.scores.push(score);
      entry.feedbackCount++;
      if (tag) entry.tags.push(tag);
    }

    // Resolve owners in PARALLEL (not sequentially)
    const agents = await Promise.all(
      agentIds.map(async (agentId) => {
        const id = String(agentId);
        const repData = scoreMap.get(id);
        let owner = "0x???";
        try {
          const result = await publicClient.readContract({
            address: IDENTITY_REGISTRY,
            abi: identityAbi,
            functionName: "ownerOf",
            args: [agentId],
          });
          owner = result as string;
        } catch {}

        const scores = repData?.scores ?? [];
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        const tagFreq: Record<string, number> = {};
        for (const tag of repData?.tags ?? []) tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
        const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

        return { agentId: id, owner, metadataURI: "", avgScore, feedbackCount: repData?.feedbackCount ?? 0, topTags };
      })
    );

    const ranked = agents
      .sort((a, b) => b.avgScore !== a.avgScore ? b.avgScore - a.avgScore : b.feedbackCount - a.feedbackCount)
      .map((agent, i) => ({ ...agent, rank: i + 1 }));

    return NextResponse.json({
      agents: ranked,
      totalAgents: ranked.length,
      scannedBlocks: Number(latestBlock - fromBlock),
      latestBlock: Number(latestBlock),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return NextResponse.json({ error: "Failed to fetch agent data", agents: [] }, { status: 500 });
  }
}