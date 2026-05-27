import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument } from "@/lib/sanity/mutations";
import groq from "groq";

const fundEntriesQuery = groq`
  *[_type == "fundEntry"] | order(date desc) {
    _id,
    date,
    description,
    amount,
    type
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await writeClient.fetch(fundEntriesQuery);
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("Fund entries list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund entries" },
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
    const { date, description, amount, type } = body;

    if (!date || !description || amount === undefined || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await createDocument("fundEntry", {
      date,
      description,
      amount: Math.abs(parseFloat(amount)),
      type,
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Create fund entry error:", error);
    return NextResponse.json(
      { error: "Failed to create fund entry" },
      { status: 500 }
    );
  }
}
