import { NextResponse } from "next/server";
import { writeClient, isWriteConfigured } from "@/lib/sanity/writeClient";
import { client } from "@/lib/sanity/client";

interface PlayerStatInput {
  playerId: string;
  plateAppearances: number;
  atBats: number;
  singles: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  sacrifices: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  caughtStealing: number;
  inningsPitched?: number | null;
  earnedRuns?: number | null;
  pitchingStrikeouts?: number | null;
  pitchingWalks?: number | null;
  hitsAllowed?: number | null;
}

interface ExistingPlayerStat {
  _key: string;
  player: { _ref: string };
  plateAppearances?: number;
  atBats?: number;
  singles?: number;
  hits?: number;
  runs?: number;
  rbi?: number;
  walks?: number;
  hitByPitch?: number;
  sacrifices?: number;
  strikeouts?: number;
  doubles?: number;
  triples?: number;
  homeRuns?: number;
  stolenBases?: number;
  caughtStealing?: number;
  inningsPitched?: number;
  earnedRuns?: number;
  pitchingStrikeouts?: number;
  pitchingWalks?: number;
  hitsAllowed?: number;
}

interface SaveStatsRequest {
  gameId: string;
  playerStats: PlayerStatInput[];
  gameScore?: {
    ourScore: number;
    theirScore: number;
    result: "W" | "L" | "T";
  };
  clearAll?: boolean; // If true, replace all stats instead of merging
}

export async function POST(request: Request) {
  try {
    if (!isWriteConfigured) {
      return NextResponse.json(
        { error: "SANITY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const { gameId, playerStats, gameScore, clearAll }: SaveStatsRequest = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    if (!playerStats || playerStats.length === 0) {
      return NextResponse.json({ error: "playerStats is required" }, { status: 400 });
    }

    // Fetch existing stats to merge with (unless clearAll is true)
    let existingStats: ExistingPlayerStat[] = [];
    if (!clearAll) {
      const existingGame = await client.fetch<{ playerStats: ExistingPlayerStat[] } | null>(
        `*[_type == "game" && _id == $gameId][0]{ playerStats }`,
        { gameId }
      );
      existingStats = existingGame?.playerStats || [];
    }

    // Create a map of existing stats by player ID for quick lookup
    const existingStatsMap = new Map<string, ExistingPlayerStat>();
    for (const stat of existingStats) {
      if (stat.player?._ref) {
        existingStatsMap.set(stat.player._ref, stat);
      }
    }

    // Transform and merge player stats
    const sanityPlayerStats = playerStats.map((stat) => {
      const existing = existingStatsMap.get(stat.playerId);

      // Always use incoming value - only fall back to existing if incoming is undefined
      const mergeValue = (incoming: number | undefined, existingVal?: number) => {
        if (incoming !== undefined) return incoming;
        return existingVal ?? 0;
      };

      // Helper: use incoming pitching value if not null, otherwise keep existing
      const mergePitching = (incoming: number | null | undefined, existingVal?: number) => {
        if (incoming != null) return incoming;
        return existingVal;
      };

      return {
        _type: "playerStat",
        _key: stat.playerId,
        player: {
          _type: "reference",
          _ref: stat.playerId,
        },
        plateAppearances: mergeValue(stat.plateAppearances, existing?.plateAppearances),
        atBats: mergeValue(stat.atBats, existing?.atBats),
        singles: mergeValue(stat.singles, existing?.singles),
        hits: mergeValue(stat.hits, existing?.hits),
        runs: mergeValue(stat.runs, existing?.runs),
        rbi: mergeValue(stat.rbi, existing?.rbi),
        walks: mergeValue(stat.walks, existing?.walks),
        hitByPitch: mergeValue(stat.hitByPitch, existing?.hitByPitch),
        sacrifices: mergeValue(stat.sacrifices, existing?.sacrifices),
        strikeouts: mergeValue(stat.strikeouts, existing?.strikeouts),
        doubles: mergeValue(stat.doubles, existing?.doubles),
        triples: mergeValue(stat.triples, existing?.triples),
        homeRuns: mergeValue(stat.homeRuns, existing?.homeRuns),
        stolenBases: mergeValue(stat.stolenBases, existing?.stolenBases),
        caughtStealing: mergeValue(stat.caughtStealing, existing?.caughtStealing),
        // Pitching stats: keep existing if incoming is null
        ...(mergePitching(stat.inningsPitched, existing?.inningsPitched) != null && {
          inningsPitched: mergePitching(stat.inningsPitched, existing?.inningsPitched)
        }),
        ...(mergePitching(stat.earnedRuns, existing?.earnedRuns) != null && {
          earnedRuns: mergePitching(stat.earnedRuns, existing?.earnedRuns)
        }),
        ...(mergePitching(stat.pitchingStrikeouts, existing?.pitchingStrikeouts) != null && {
          pitchingStrikeouts: mergePitching(stat.pitchingStrikeouts, existing?.pitchingStrikeouts)
        }),
        ...(mergePitching(stat.pitchingWalks, existing?.pitchingWalks) != null && {
          pitchingWalks: mergePitching(stat.pitchingWalks, existing?.pitchingWalks)
        }),
        ...(mergePitching(stat.hitsAllowed, existing?.hitsAllowed) != null && {
          hitsAllowed: mergePitching(stat.hitsAllowed, existing?.hitsAllowed)
        }),
      };
    });

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

// DELETE - Clear all stats for a game
export async function DELETE(request: Request) {
  try {
    if (!isWriteConfigured) {
      return NextResponse.json(
        { error: "SANITY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    // Clear playerStats array and game score
    await writeClient.patch(gameId).set({
      playerStats: [],
      ourScore: undefined,
      theirScore: undefined,
      result: undefined,
    }).commit();

    return NextResponse.json({ success: true, gameId });
  } catch (error) {
    console.error("Clear stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear stats" },
      { status: 500 }
    );
  }
}
