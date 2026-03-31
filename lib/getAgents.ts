import { parseAbiItem } from "viem";
import {
  publicClient,
  IDENTITY_REGISTRY,
  REPUTATION_REGISTRY,
  identityAbi,
} from "@/lib/arc";

export async function getAgentData() {
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

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
    return { agents: [], totalAgents: 0, scannedBlocks: 10000, latestBlock: Number(latestBlock) };
  }

  const agentIds = [
    ...new Set(
      transferLogs
        .map((log) => (log as any).args?.tokenId as bigint | undefined)
        .filter((id): id is bigint => id !== undefined)
    ),
  ];

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

  // Fetch all owners in parallel (no multicall needed)
  const owners = await Promise.all(
    agentIds.map((agentId) =>
      publicClient.readContract({
        address: IDENTITY_REGISTRY,
        abi: identityAbi,
        functionName: "ownerOf",
        args: [agentId],
      }).then((r) => r as string).catch(() => "0x???")
    )
  );

  const agents = agentIds.map((agentId, index) => {
    const id = String(agentId);
    const repData = scoreMap.get(id);
    const owner = owners[index];

    const scores = repData?.scores ?? [];
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const tagFreq: Record<string, number> = {};
    for (const tag of repData?.tags ?? []) tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
    const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

    return { agentId: id, owner, metadataURI: "", avgScore, feedbackCount: repData?.feedbackCount ?? 0, topTags };
  });

  const ranked = agents
    .sort((a, b) => b.avgScore !== a.avgScore ? b.avgScore - a.avgScore : b.feedbackCount - a.feedbackCount)
    .map((agent, i) => ({ ...agent, rank: i + 1 }));

  return {
    agents: ranked,
    totalAgents: ranked.length,
    scannedBlocks: Number(latestBlock - fromBlock),
    latestBlock: Number(latestBlock),
    updatedAt: new Date().toISOString(),
  };
}