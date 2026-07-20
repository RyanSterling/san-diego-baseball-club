import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { activePlayersQuery } from "@/lib/sanity/queries";

interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
}

interface ParsedPlayerStat {
  playerName: string;
  jerseyNumber?: number;
  matchedPlayerId?: string;
  plateAppearances: number;
  atBats: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  sacrifices: number;
  strikeouts: number;
  stolenBases: number;
  caughtStealing: number;
  inningsPitched?: number;
  earnedRuns?: number;
  pitchingStrikeouts?: number;
  pitchingWalks?: number;
  hitsAllowed?: number;
}

function normalizePlayerName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function findBestPlayerMatch(csvName: string, players: Player[]): Player | null {
  const normalizedCsvName = normalizePlayerName(csvName);

  // Exact match
  for (const player of players) {
    if (normalizePlayerName(player.name) === normalizedCsvName) {
      return player;
    }
  }

  // Partial match (first name + last name)
  const csvParts = normalizedCsvName.split(" ");
  for (const player of players) {
    const playerParts = normalizePlayerName(player.name).split(" ");

    // Check if first and last names match
    if (csvParts.length >= 2 && playerParts.length >= 2) {
      if (csvParts[0] === playerParts[0] && csvParts[csvParts.length - 1] === playerParts[playerParts.length - 1]) {
        return player;
      }
    }

    // Check if last name matches
    if (csvParts[csvParts.length - 1] === playerParts[playerParts.length - 1]) {
      return player;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { csv } = await request.json();

    if (!csv) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 });
    }

    // Fetch existing players for matching
    const players: Player[] = await client.fetch(activePlayersQuery);

    // Parse CSV
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have header and at least one data row" }, { status: 400 });
    }

    // Parse header to find column indices
    const header = lines[0].split(",").map((h: string) => h.trim().toUpperCase());

    const colIndex = {
      name: header.findIndex((h: string) => h === "NAME" || h === "PLAYER"),
      pa: header.findIndex((h: string) => h === "PA"),
      ab: header.findIndex((h: string) => h === "AB"),
      singles: header.findIndex((h: string) => h === "1B"),
      doubles: header.findIndex((h: string) => h === "2B"),
      triples: header.findIndex((h: string) => h === "3B"),
      hr: header.findIndex((h: string) => h === "HR"),
      runs: header.findIndex((h: string) => h === "RUNS" || h === "R"),
      rbi: header.findIndex((h: string) => h === "RBI"),
      bb: header.findIndex((h: string) => h === "BB" || h === "WALKS"),
      hbp: header.findIndex((h: string) => h === "HBP"),
      sac: header.findIndex((h: string) => h === "SAC"),
      so: header.findIndex((h: string) => h === "SO" || h === "K"),
      sb: header.findIndex((h: string) => h === "SB"),
      cs: header.findIndex((h: string) => h === "CS"),
    };

    if (colIndex.name === -1) {
      return NextResponse.json({ error: "CSV must have a 'Name' column" }, { status: 400 });
    }

    const parsedPlayers: ParsedPlayerStat[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith("total")) continue;

      const cols = line.split(",").map((c: string) => c.trim());
      const playerName = cols[colIndex.name];

      if (!playerName) continue;

      // Match to roster
      const matchedPlayer = findBestPlayerMatch(playerName, players);

      const getNum = (idx: number): number => {
        if (idx === -1) return 0;
        const val = parseFloat(cols[idx]);
        return isNaN(val) ? 0 : val;
      };

      const singles = getNum(colIndex.singles);
      const doubles = getNum(colIndex.doubles);
      const triples = getNum(colIndex.triples);
      const homeRuns = getNum(colIndex.hr);
      const hits = singles + doubles + triples + homeRuns;

      const stat: ParsedPlayerStat = {
        playerName,
        jerseyNumber: matchedPlayer?.jerseyNumber,
        matchedPlayerId: matchedPlayer?._id,
        plateAppearances: getNum(colIndex.pa),
        atBats: getNum(colIndex.ab),
        singles,
        doubles,
        triples,
        homeRuns,
        hits,
        runs: getNum(colIndex.runs),
        rbi: getNum(colIndex.rbi),
        walks: getNum(colIndex.bb),
        hitByPitch: getNum(colIndex.hbp),
        sacrifices: getNum(colIndex.sac),
        strikeouts: getNum(colIndex.so),
        stolenBases: getNum(colIndex.sb),
        caughtStealing: getNum(colIndex.cs),
        inningsPitched: undefined,
        earnedRuns: undefined,
        pitchingStrikeouts: undefined,
        pitchingWalks: undefined,
        hitsAllowed: undefined,
      };

      parsedPlayers.push(stat);
    }

    if (parsedPlayers.length === 0) {
      return NextResponse.json({ error: "No valid player rows found in CSV" }, { status: 400 });
    }

    return NextResponse.json({
      parsedStats: {
        players: parsedPlayers,
        gameScore: null,
        confidence: "high",
        notes: "Parsed from CSV",
      },
      roster: players,
    });
  } catch (error) {
    console.error("Parse CSV error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse CSV" },
      { status: 500 }
    );
  }
}
