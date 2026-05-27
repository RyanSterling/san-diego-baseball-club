import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const practiceDetailQuery = groq`
  *[_type == "practice" && _id == $id][0] {
    _id,
    date,
    location,
    notes,
    season->{_id, name}
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
    const practice = await writeClient.fetch(practiceDetailQuery, { id });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, practice });
  } catch (error) {
    console.error("Practice detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice" },
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
    const { seasonId, date, location, notes } = body;

    const updateData: Record<string, unknown> = {};

    if (seasonId !== undefined) updateData.season = createReference(seasonId);
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;

    await updateDocument(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update practice error:", error);
    return NextResponse.json(
      { error: "Failed to update practice" },
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
    console.error("Delete practice error:", error);
    return NextResponse.json(
      { error: "Failed to delete practice" },
      { status: 500 }
    );
  }
}
