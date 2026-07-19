import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";

interface PlayerStat {
  player: {
    _id: string;
    name: string;
    jerseyNumber: number;
  };
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
  inningsPitched?: number;
  earnedRuns?: number;
  pitchingStrikeouts?: number;
  pitchingWalks?: number;
  hitsAllowed?: number;
}

interface GameStats {
  _id: string;
  ourScore?: number;
  theirScore?: number;
  playerStats: PlayerStat[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    const game = await client.fetch<GameStats | null>(
      `*[_type == "game" && _id == $gameId][0]{
        _id,
        ourScore,
        theirScore,
        playerStats[]{
          player->{
            _id,
            name,
            jerseyNumber
          },
          plateAppearances,
          atBats,
          singles,
          hits,
          runs,
          rbi,
          walks,
          hitByPitch,
          sacrifices,
          strikeouts,
          doubles,
          triples,
          homeRuns,
          stolenBases,
          caughtStealing,
          inningsPitched,
          earnedRuns,
          pitchingStrikeouts,
          pitchingWalks,
          hitsAllowed
        }
      }`,
      { gameId }
    );

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ game });
  } catch (error) {
    console.error("Fetch game stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch game stats" },
      { status: 500 }
    );
  }
}
