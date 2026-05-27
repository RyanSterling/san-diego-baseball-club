import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { activePlayersQuery } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const players = await client.fetch(activePlayersQuery);
    return NextResponse.json({ players });
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
