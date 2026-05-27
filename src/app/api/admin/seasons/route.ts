import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument, createSlug } from "@/lib/sanity/mutations";
import groq from "groq";

const seasonsListQuery = groq`
  *[_type == "season"] | order(startDate desc) {
    _id,
    name,
    "slug": slug.current,
    startDate,
    endDate,
    isCurrent,
    teamFundTotal,
    "gameCount": count(*[_type == "game" && references(^._id)]),
    "playerCount": count(playerPayments)
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const seasons = await writeClient.fetch(seasonsListQuery);
    return NextResponse.json({ success: true, seasons });
  } catch (error) {
    console.error("Seasons list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seasons" },
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
    const { name, startDate, endDate, isCurrent, teamFundTotal } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const season = await createDocument("season", {
      name,
      slug: createSlug(name),
      startDate,
      endDate,
      isCurrent: isCurrent || false,
      teamFundTotal: teamFundTotal || 0,
    });

    return NextResponse.json({ success: true, season });
  } catch (error) {
    console.error("Create season error:", error);
    return NextResponse.json(
      { error: "Failed to create season" },
      { status: 500 }
    );
  }
}
