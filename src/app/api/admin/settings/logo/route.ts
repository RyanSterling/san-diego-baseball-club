import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { uploadImage, createImageReference, updateDocument, createDocument } from "@/lib/sanity/mutations";
import groq from "groq";

export async function POST(request: Request) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload logo to Sanity
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await uploadImage(buffer, file.name, file.type);
    const logoRef = createImageReference(asset._id);

    // Get or create settings
    const settings = await writeClient.fetch(
      groq`*[_type == "siteSettings"][0]{ _id }`
    );

    if (settings) {
      await updateDocument(settings._id, { logo: logoRef });
    } else {
      await createDocument("siteSettings", { logo: logoRef });
    }

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}
