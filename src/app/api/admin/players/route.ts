import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument, createSlug, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const playersListQuery = groq`
  *[_type == "player"] | order(jerseyNumber asc) {
    _id,
    name,
    jerseyNumber,
    position,
    photo,
    isActive,
    battingSide,
    throwingSide,
    seasons[]->{_id, name}
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const players = await writeClient.fetch(playersListQuery);
    return NextResponse.json({ success: true, players });
  } catch (error) {
    console.error("Players list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
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
    const {
      name,
      jerseyNumber,
      position,
      bio,
      battingSide,
      throwingSide,
      seasonIds,
      isActive,
    } = body;

    if (!name || jerseyNumber === undefined || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const player = await createDocument("player", {
      name,
      slug: createSlug(name),
      jerseyNumber: parseInt(jerseyNumber),
      position,
      bio: bio || undefined,
      battingSide: battingSide || undefined,
      throwingSide: throwingSide || undefined,
      seasons: seasonIds?.map((id: string) => createReference(id)) || [],
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error("Create player error:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
