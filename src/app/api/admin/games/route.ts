import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument, createSlug, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const gamesListQuery = groq`
  *[_type == "game"] | order(date desc) {
    _id,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    season->{_id, name, "slug": slug.current},
    "hasStats": defined(playerStats) && count(playerStats) > 0,
    "hasRecap": defined(recap)
  }
`;

export async function GET(request: Request) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("season");

  let query = gamesListQuery;
  const params: Record<string, string> = {};

  if (seasonId) {
    query = groq`
      *[_type == "game" && season._ref == $seasonId] | order(date desc) {
        _id,
        date,
        opponent,
        location,
        homeOrAway,
        result,
        ourScore,
        theirScore,
        season->{_id, name, "slug": slug.current},
        "hasStats": defined(playerStats) && count(playerStats) > 0,
        "hasRecap": defined(recap)
      }
    `;
    params.seasonId = seasonId;
  }

  try {
    const games = await writeClient.fetch(query, params);
    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error("Games list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { seasonId, date, opponent, location, homeOrAway, gameChangerLink } = body;

    if (!seasonId || !date || !opponent || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from opponent and date
    const dateStr = new Date(date).toISOString().split("T")[0];
    const slugText = `${opponent}-${dateStr}`;

    const game = await createDocument("game", {
      season: createReference(seasonId),
      date,
      slug: createSlug(slugText),
      opponent,
      location,
      homeOrAway: homeOrAway || "home",
      gameChangerLink: gameChangerLink || undefined,
    });

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
