import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { createDocument } from "@/lib/sanity/mutations";
import groq from "groq";

const recurringPracticesQuery = groq`
  *[_type == "recurringPractice"] | order(dayOfWeek asc) {
    _id,
    dayOfWeek,
    time,
    location,
    notes,
    isActive
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const practices = await writeClient.fetch(recurringPracticesQuery);
    return NextResponse.json({ success: true, practices });
  } catch (error) {
    console.error("Recurring practices list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring practices" },
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
    const { dayOfWeek, time, location, notes, isActive } = body;

    if (dayOfWeek === undefined || !time || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const practice = await createDocument("recurringPractice", {
      dayOfWeek: dayOfWeek.toString(),
      time,
      location,
      notes: notes || undefined,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, practice });
  } catch (error) {
    console.error("Create recurring practice error:", error);
    return NextResponse.json(
      { error: "Failed to create recurring practice" },
      { status: 500 }
    );
  }
}
