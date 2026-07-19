import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { client } from "@/lib/sanity/client";
import { activePlayersQuery } from "@/lib/sanity/queries";

// Extend Netlify function timeout (max 60s on Pro plan)
export const maxDuration = 60;

interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
}

interface ParsedPlayerStat {
  playerName: string;
  jerseyNumber?: number;
  matchedPlayerId?: string;
  // Batting stats matching stat sheet format
  plateAppearances: number;
  atBats: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  hits: number; // Total hits (1B+2B+3B+HR)
  runs: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  sacrifices: number;
  strikeouts: number;
  stolenBases: number;
  caughtStealing: number;
  // Pitching (optional)
  inningsPitched?: number;
  earnedRuns?: number;
  pitchingStrikeouts?: number;
  pitchingWalks?: number;
  hitsAllowed?: number;
}

export async function POST(request: Request) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Fetch existing players to help with matching
    const players: Player[] = await client.fetch(activePlayersQuery);
    const playerList = players
      .map((p) => `#${p.jerseyNumber} ${p.name} (ID: ${p._id})`)
      .join("\n");

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType || "image/jpeg",
                data: image.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
            {
              type: "text",
              text: `You are a baseball statistics expert. Extract player stats from this stat sheet image.

CRITICAL COLUMN ORDER - Read each column EXACTLY as labeled:
BO | Name | PA | AB | 1B | 2B | 3B | HR | RUNS | RBI | BB | HBP | SAC | SO | SB | CS

IMPORTANT: There is NO "H" or "Hits" column in the stat sheet!
- The columns go: ... HR | RUNS | RBI | BB ...
- You must CALCULATE "hits" as: 1B + 2B + 3B + HR (do NOT read from any column)
- "runs" comes from the RUNS column (runs scored by the player)
- "rbi" comes from the RBI column (runs batted in)
- "walks" comes from the BB column

Column-to-field mapping:
- PA column → "plateAppearances"
- AB column → "atBats"
- 1B column → "singles" (NOT total hits!)
- 2B column → "doubles"
- 3B column → "triples"
- HR column → "homeRuns"
- RUNS column → "runs" (this is runs SCORED, NOT hits!)
- RBI column → "rbi"
- BB column → "walks"
- HBP column → "hitByPitch"
- SAC column → "sacrifices"
- SO column → "strikeouts"
- SB column → "stolenBases"
- CS column → "caughtStealing"

Here are the players on the team roster (try to match names/numbers to these):
${playerList}

Return a JSON object with this exact structure:
{
  "players": [
    {
      "playerName": "Name from stat sheet",
      "jerseyNumber": null,
      "matchedPlayerId": "player ID from roster if matched, or null",
      "plateAppearances": 0,
      "atBats": 0,
      "singles": 0,
      "doubles": 0,
      "triples": 0,
      "homeRuns": 0,
      "hits": 0,
      "runs": 0,
      "rbi": 0,
      "walks": 0,
      "hitByPitch": 0,
      "sacrifices": 0,
      "strikeouts": 0,
      "stolenBases": 0,
      "caughtStealing": 0,
      "inningsPitched": null,
      "earnedRuns": null,
      "pitchingStrikeouts": null,
      "pitchingWalks": null,
      "hitsAllowed": null
    }
  ],
  "gameScore": {
    "ourScore": 0,
    "theirScore": 0
  },
  "confidence": "high/medium/low",
  "notes": "Any issues or uncertainties"
}

CRITICAL RULES:
1. ONLY include players that match someone on the roster above - SKIP any players not on the roster
2. "hits" = singles + doubles + triples + homeRuns (CALCULATE this, do NOT read from a column!)
3. "runs" = value from RUNS column (runs SCORED by player crossing home plate)
4. "rbi" = value from RBI column (runs batted IN by this player)
5. DO NOT confuse RUNS with hits - they are completely different stats!
6. Use 0 for batting stats if not visible, null for pitching stats
7. Only include pitching stats if the player actually pitched
Return ONLY valid JSON, no other text.`,
            },
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedStats;
    try {
      // Try to extract JSON from the response (Claude sometimes wraps in markdown)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedStats = JSON.parse(jsonMatch[0]);
      } else {
        parsedStats = JSON.parse(textContent.text);
      }
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse Claude response",
          raw: textContent.text
        },
        { status: 500 }
      );
    }

    // Attach player roster for UI matching
    return NextResponse.json({
      parsedStats,
      roster: players,
    });
  } catch (error) {
    console.error("Parse stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse stats" },
      { status: 500 }
    );
  }
}
