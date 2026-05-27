import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const playerDetailQuery = groq`
  *[_type == "player" && _id == $id][0] {
    _id,
    name,
    "slug": slug.current,
    jerseyNumber,
    position,
    photo,
    bio,
    battingSide,
    throwingSide,
    isActive,
    seasons[]->{_id, name}
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
    const player = await writeClient.fetch(playerDetailQuery, { id });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error("Player detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
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
      name,
      jerseyNumber,
      position,
      bio,
      battingSide,
      throwingSide,
      seasonIds,
      isActive,
      photo,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = parseInt(jerseyNumber);
    if (position !== undefined) updateData.position = position;
    if (bio !== undefined) updateData.bio = bio;
    if (battingSide !== undefined) updateData.battingSide = battingSide;
    if (throwingSide !== undefined) updateData.throwingSide = throwingSide;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (photo !== undefined) updateData.photo = photo;
    if (seasonIds !== undefined) {
      updateData.seasons = seasonIds.map((sid: string) => createReference(sid));
    }

    await updateDocument(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update player error:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
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
    console.error("Delete player error:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}
