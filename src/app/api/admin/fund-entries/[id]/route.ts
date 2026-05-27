import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument } from "@/lib/sanity/mutations";
import groq from "groq";

const fundEntryDetailQuery = groq`
  *[_type == "fundEntry" && _id == $id][0] {
    _id,
    date,
    description,
    amount,
    type
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
    const entry = await writeClient.fetch(fundEntryDetailQuery, { id });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Fund entry detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry" },
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
    const { date, description, amount, type } = body;

    const updateData: Record<string, unknown> = {};

    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = Math.abs(parseFloat(amount));
    if (type !== undefined) updateData.type = type;

    await updateDocument(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update fund entry error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
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
    console.error("Delete fund entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
