import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { recentGamesForStatsQuery } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const games = await client.fetch(recentGamesForStatsQuery);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
