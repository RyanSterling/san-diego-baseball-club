import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument } from "@/lib/sanity/mutations";
import groq from "groq";

const recurringPracticeDetailQuery = groq`
  *[_type == "recurringPractice" && _id == $id][0] {
    _id,
    dayOfWeek,
    time,
    location,
    notes,
    isActive
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
    const practice = await writeClient.fetch(recurringPracticeDetailQuery, { id });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, practice });
  } catch (error) {
    console.error("Recurring practice detail error:", error);
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
    const { dayOfWeek, time, location, notes, isActive } = body;

    const updateData: Record<string, unknown> = {};

    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek.toString();
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    await updateDocument(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update recurring practice error:", error);
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
    console.error("Delete recurring practice error:", error);
    return NextResponse.json(
      { error: "Failed to delete practice" },
      { status: 500 }
    );
  }
}
