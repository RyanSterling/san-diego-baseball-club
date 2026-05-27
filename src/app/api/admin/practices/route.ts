import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument, createReference } from "@/lib/sanity/mutations";
import groq from "groq";

const practicesListQuery = groq`
  *[_type == "practice"] | order(date desc) {
    _id,
    date,
    location,
    notes,
    season->{_id, name}
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const practices = await writeClient.fetch(practicesListQuery);
    return NextResponse.json({ success: true, practices });
  } catch (error) {
    console.error("Practices list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch practices" },
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
    const { seasonId, date, location, notes } = body;

    if (!seasonId || !date || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const practice = await createDocument("practice", {
      season: createReference(seasonId),
      date,
      location,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, practice });
  } catch (error) {
    console.error("Create practice error:", error);
    return NextResponse.json(
      { error: "Failed to create practice" },
      { status: 500 }
    );
  }
}
