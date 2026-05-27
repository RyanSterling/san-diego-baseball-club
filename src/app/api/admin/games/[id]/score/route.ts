import { NextResponse } from "next/server";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument } from "@/lib/sanity/mutations";

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
    const { ourScore, theirScore } = body;

    if (ourScore === undefined || theirScore === undefined) {
      return NextResponse.json(
        { error: "Both scores are required" },
        { status: 400 }
      );
    }

    // Calculate result
    let result: string;
    if (ourScore > theirScore) {
      result = "W";
    } else if (ourScore < theirScore) {
      result = "L";
    } else {
      result = "T";
    }

    await updateDocument(id, {
      ourScore,
      theirScore,
      result,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Update score error:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
