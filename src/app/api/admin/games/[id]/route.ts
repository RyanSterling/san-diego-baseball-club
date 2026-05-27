import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const gameDetailQuery = groq`
  *[_type == "game" && _id == $id][0] {
    _id,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    ourInnings,
    theirInnings,
    ourHits,
    theirHits,
    ourErrors,
    theirErrors,
    recap,
    gameChangerLink,
    season->{_id, name, "slug": slug.current},
    playerStats[]{
      _key,
      player->{_id, name, jerseyNumber},
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const game = await writeClient.fetch(gameDetailQuery, { id });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error("Game detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      seasonId,
      date,
      opponent,
      location,
      homeOrAway,
      result,
      ourScore,
      theirScore,
      ourInnings,
      theirInnings,
      ourHits,
      theirHits,
      ourErrors,
      theirErrors,
      recap,
      gameChangerLink,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (seasonId !== undefined) updateData.season = createReference(seasonId);
    if (date !== undefined) updateData.date = date;
    if (opponent !== undefined) updateData.opponent = opponent;
    if (location !== undefined) updateData.location = location;
    if (homeOrAway !== undefined) updateData.homeOrAway = homeOrAway;
    if (result !== undefined) updateData.result = result;
    if (ourScore !== undefined) updateData.ourScore = ourScore;
    if (theirScore !== undefined) updateData.theirScore = theirScore;
    if (ourInnings !== undefined) updateData.ourInnings = ourInnings;
    if (theirInnings !== undefined) updateData.theirInnings = theirInnings;
    if (ourHits !== undefined) updateData.ourHits = ourHits;
    if (theirHits !== undefined) updateData.theirHits = theirHits;
    if (ourErrors !== undefined) updateData.ourErrors = ourErrors;
    if (theirErrors !== undefined) updateData.theirErrors = theirErrors;
    if (recap !== undefined) updateData.recap = recap;
    if (gameChangerLink !== undefined) updateData.gameChangerLink = gameChangerLink;

    await updateDocument(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update game error:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete game error:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
