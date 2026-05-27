import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import groq from "groq";

const dashboardStatsQuery = groq`{
  "gamesPlayed": count(*[_type == "game" && defined(result)]),
  "upcomingGames": count(*[_type == "game" && date > now()]),
  "activeRoster": count(*[_type == "player" && isActive == true]),
  "currentSeason": *[_type == "season" && isCurrent == true][0]{
    _id,
    name,
    "slug": slug.current
  },
  "recentGames": *[_type == "game"] | order(date desc) [0...5] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    result,
    ourScore,
    theirScore,
    "hasStats": defined(playerStats) && count(playerStats) > 0
  },
  "upcomingGamesList": *[_type == "game" && date > now()] | order(date asc) [0...5] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway
  },
  "totalFundIn": math::sum(*[_type == "fundEntry" && type == "in"].amount),
  "totalFundOut": math::sum(*[_type == "fundEntry" && type == "out"].amount)
}`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await writeClient.fetch(dashboardStatsQuery);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        fundBalance: (data.totalFundIn || 0) - (data.totalFundOut || 0),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
