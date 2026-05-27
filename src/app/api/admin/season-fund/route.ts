import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import groq from "groq";

const currentSeasonFundQuery = groq`
  *[_type == "season" && isCurrent == true][0] {
    _id,
    name,
    "slug": slug.current,
    teamFundTotal,
    playerPayments[]{
      _key,
      player->{
        _id,
        name,
        jerseyNumber
      },
      amountPaid
    }
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const seasonFund = await writeClient.fetch(currentSeasonFundQuery);
    return NextResponse.json({ success: true, seasonFund: seasonFund || null });
  } catch (error) {
    console.error("Season fund fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch season fund data" },
      { status: 500 }
    );
  }
}
