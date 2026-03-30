import { NextResponse } from "next/server";
import { parseAbiItem, getContract } from "viem";
import {
  publicClient,
  IDENTITY_REGISTRY,
  REPUTATION_REGISTRY,
  identityAbi,
} from "@/lib/arc";
export const dynamic = "force-dynamic";
export const revalidate = 60; // cache for 60 seconds

const BLOCK_CHUNK = 9000n; // stay under 10k RPC limit

// Scan event logs across block range in chunks
async function scanLogs<T extends { topics: readonly string[] }>(
  params: Parameters<typeof publicClient.getLogs>[0],
  fromBlock: bigint,
  toBlock: bigint
): Promise<Awaited<ReturnType<typeof publicClient.getLogs>>> {
  const allLogs: Awaited<ReturnType<typeof publicClient.getLogs>> = [];
  let from = fromBlock;

  while (from <= toBlock) {
    const to = from + BLOCK_CHUNK > toBlock ? toBlock : from + BLOCK_CHUNK;
    try {
      const chunk = await publicClient.getLogs({
        ...params,
        fromBlock: from,
        toBlock: to,
      });
      allLogs.push(...chunk);
    } catch {
      // skip failed chunks silently
    }
    from = to + 1n;
  }

  return allLogs;
}

export async function GET() {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    // Scan last ~200k blocks (roughly 2 weeks on Arc)
    const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;

    // Step 1: Get all registered agents via Transfer(0x0 -> owner) events
    const transferLogs = await scanLogs(
      {
        address: IDENTITY_REGISTRY,
        event: parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
        ),
        args: { from: "0x0000000000000000000000000000000000000000" },
      },
      fromBlock,
      latestBlock
    );

    if (transferLogs.length === 0) {
      return NextResponse.json({ agents: [], scannedBlocks: Number(latestBlock - fromBlock) });
    }

    // Deduplicate agent IDs
    const agentIds = [
      ...new Set(
        transferLogs
          .map((log) => (log as any).args?.tokenId as bigint | undefined)
          .filter((id): id is bigint => id !== undefined)
      ),
    ];

    // Step 2: Get all reputation feedback events
    const feedbackLogs = await scanLogs(
      {
        address: REPUTATION_REGISTRY,
        event: parseAbiItem(
          "event FeedbackGiven(uint256 indexed agentId, address indexed from, int128 score, uint8 feedbackType, string tag)"
        ),
      },
      fromBlock,
      latestBlock
    );

    // Step 3: Aggregate scores per agent
    const scoreMap = new Map<
      string,
      { scores: number[]; tags: string[]; feedbackCount: number }
    >();

    for (const log of feedbackLogs) {
      const args = (log as any).args;
      if (!args) continue;
      const agentId = String(args.agentId as bigint);
      const score = Number(args.score as bigint);
      const tag = (args.tag as string) || "";

      if (!scoreMap.has(agentId)) {
        scoreMap.set(agentId, { scores: [], tags: [], feedbackCount: 0 });
      }
      const entry = scoreMap.get(agentId)!;
      entry.scores.push(score);
      entry.feedbackCount++;
      if (tag) entry.tags.push(tag);
    }

    // Step 4: Resolve owner addresses for each agent
    const identityContract = getContract({
      address: IDENTITY_REGISTRY,
      abi: identityAbi,
      client: publicClient,
    });

    const agents = await Promise.all(
      agentIds.map(async (agentId) => {
        const id = String(agentId);
        const repData = scoreMap.get(id);

        let owner = "0x???";
        let metadataURI = "";

        try {
          owner = await identityContract.read.ownerOf([agentId]);
          metadataURI = await identityContract.read.tokenURI([agentId]);
        } catch {
          // agent may have been burned or transfer failed
        }

        const scores = repData?.scores ?? [];
        const avgScore =
          scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        // Count tag frequency
        const tagFreq: Record<string, number> = {};
        for (const tag of repData?.tags ?? []) {
          tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
        }
        const topTags = Object.entries(tagFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag);

        return {
          agentId: id,
          owner,
          metadataURI,
          avgScore,
          feedbackCount: repData?.feedbackCount ?? 0,
          topTags,
        };
      })
    );

    // Sort by avgScore descending, then feedbackCount
    const ranked = agents
      .sort((a, b) =>
        b.avgScore !== a.avgScore
          ? b.avgScore - a.avgScore
          : b.feedbackCount - a.feedbackCount
      )
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
    return NextResponse.json(
      { error: "Failed to fetch agent data", agents: [] },
      { status: 500 }
    );
  }
}
