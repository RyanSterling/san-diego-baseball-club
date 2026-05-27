import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, deleteDocument, setCurrentSeason } from "@/lib/sanity/mutations";
import groq from "groq";

const seasonDetailQuery = groq`
  *[_type == "season" && _id == $id][0] {
    _id,
    name,
    "slug": slug.current,
    startDate,
    endDate,
    isCurrent,
    teamFundTotal,
    playerPayments[]{
      _key,
      player->{_id, name, jerseyNumber},
      amountPaid
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
    const season = await writeClient.fetch(seasonDetailQuery, { id });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, season });
  } catch (error) {
    console.error("Season detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch season" },
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
    const { name, startDate, endDate, isCurrent, teamFundTotal, playerPayments } = body;

    // If setting as current, handle unsetting others
    if (isCurrent === true) {
      await setCurrentSeason(id);
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (isCurrent !== undefined && isCurrent !== true) updateData.isCurrent = isCurrent;
    if (teamFundTotal !== undefined) updateData.teamFundTotal = teamFundTotal;
    if (playerPayments !== undefined) updateData.playerPayments = playerPayments;

    if (Object.keys(updateData).length > 0) {
      await updateDocument(id, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update season error:", error);
    return NextResponse.json(
      { error: "Failed to update season" },
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
    console.error("Delete season error:", error);
    return NextResponse.json(
      { error: "Failed to delete season" },
      { status: 500 }
    );
  }
}
