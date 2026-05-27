import { NextResponse } from "next/server";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { uploadImage, createImageReference, updateDocument } from "@/lib/sanity/mutations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload image to Sanity
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await uploadImage(buffer, file.name, file.type);

    // Update player with image reference
    const imageRef = createImageReference(asset._id);
    await updateDocument(id, { photo: imageRef });

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
