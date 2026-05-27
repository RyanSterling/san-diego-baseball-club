import { NextResponse } from "next/server";
import { writeClient, isWriteConfigured } from "@/lib/sanity/writeClient";

interface PlayerStatInput {
  playerId: string;
  atBats: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  inningsPitched?: number | null;
  earnedRuns?: number | null;
  pitchingStrikeouts?: number | null;
  pitchingWalks?: number | null;
  hitsAllowed?: number | null;
}

interface SaveStatsRequest {
  gameId: string;
  playerStats: PlayerStatInput[];
  gameScore?: {
    ourScore: number;
    theirScore: number;
    result: "W" | "L" | "T";
  };
}

export async function POST(request: Request) {
  try {
    if (!isWriteConfigured) {
      return NextResponse.json(
        { error: "SANITY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const { gameId, playerStats, gameScore }: SaveStatsRequest = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    if (!playerStats || playerStats.length === 0) {
      return NextResponse.json({ error: "playerStats is required" }, { status: 400 });
    }

    // Transform player stats to Sanity format
    const sanityPlayerStats = playerStats.map((stat) => ({
      _type: "playerStat",
      _key: stat.playerId, // Use playerId as unique key
      player: {
        _type: "reference",
        _ref: stat.playerId,
      },
      atBats: stat.atBats || 0,
      hits: stat.hits || 0,
      runs: stat.runs || 0,
      rbi: stat.rbi || 0,
      walks: stat.walks || 0,
      strikeouts: stat.strikeouts || 0,
      doubles: stat.doubles || 0,
      triples: stat.triples || 0,
      homeRuns: stat.homeRuns || 0,
      stolenBases: stat.stolenBases || 0,
      // Only include pitching stats if they exist
      ...(stat.inningsPitched != null && { inningsPitched: stat.inningsPitched }),
      ...(stat.earnedRuns != null && { earnedRuns: stat.earnedRuns }),
      ...(stat.pitchingStrikeouts != null && { pitchingStrikeouts: stat.pitchingStrikeouts }),
      ...(stat.pitchingWalks != null && { pitchingWalks: stat.pitchingWalks }),
      ...(stat.hitsAllowed != null && { hitsAllowed: stat.hitsAllowed }),
    }));

    // Build the patch
    let patch = writeClient.patch(gameId).set({
      playerStats: sanityPlayerStats,
    });

    // Add game score if provided
    if (gameScore) {
      patch = patch.set({
        ourScore: gameScore.ourScore,
        theirScore: gameScore.theirScore,
        result: gameScore.result,
      });
    }

    // Commit the mutation
    const result = await patch.commit();

    return NextResponse.json({
      success: true,
      gameId: result._id,
      statsCount: sanityPlayerStats.length,
    });
  } catch (error) {
    console.error("Save stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save stats" },
      { status: 500 }
    );
  }
}
