import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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
      model: "claude-sonnet-4-5",
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

Here are the players on the team roster (try to match names/numbers to these):
${playerList}

Extract the following stats for each player you can identify:
- Player name and jersey number (if visible)
- AB (at bats), H (hits), R (runs), RBI, BB (walks), K (strikeouts)
- 2B (doubles), 3B (triples), HR (home runs), SB (stolen bases)
- If pitching stats are shown: IP (innings pitched), ER (earned runs), K (pitching strikeouts), BB (pitching walks), H (hits allowed)

Return a JSON object with this exact structure:
{
  "players": [
    {
      "playerName": "Name from stat sheet",
      "jerseyNumber": 10,
      "matchedPlayerId": "player ID from roster if matched, or null",
      "atBats": 4,
      "hits": 2,
      "runs": 1,
      "rbi": 2,
      "walks": 0,
      "strikeouts": 1,
      "doubles": 0,
      "triples": 0,
      "homeRuns": 0,
      "stolenBases": 0,
      "inningsPitched": null,
      "earnedRuns": null,
      "pitchingStrikeouts": null,
      "pitchingWalks": null,
      "hitsAllowed": null
    }
  ],
  "gameScore": {
    "ourScore": 5,
    "theirScore": 3
  },
  "confidence": "high/medium/low",
  "notes": "Any issues or uncertainties"
}

If a stat is not visible or not applicable, use 0 for batting stats and null for pitching stats.
Only include pitching stats if the player actually pitched.
Match player names to the roster IDs when possible.
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
