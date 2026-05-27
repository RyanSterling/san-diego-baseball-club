import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";
import { getAuthCookie, verifyAuthToken } from "@/lib/auth";
import { updateDocument, createDocument } from "@/lib/sanity/mutations";
import groq from "groq";

const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    teamName,
    tagline,
    logo,
    defaultGameChangerUrl,
    contactEmail,
    socialLinks[]{
      _key,
      platform,
      url
    }
  }
`;

export async function GET() {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await writeClient.fetch(siteSettingsQuery);
    return NextResponse.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const token = await getAuthCookie();
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      teamName,
      tagline,
      defaultGameChangerUrl,
      contactEmail,
      socialLinks,
    } = body;

    // Get existing settings or create new
    let settings = await writeClient.fetch(siteSettingsQuery);

    if (!settings) {
      // Create settings document
      settings = await createDocument("siteSettings", {
        teamName: teamName || "",
        tagline: tagline || "",
        defaultGameChangerUrl: defaultGameChangerUrl || "",
        contactEmail: contactEmail || "",
        socialLinks: socialLinks || [],
      });
    } else {
      // Update existing
      const updateData: Record<string, unknown> = {};

      if (teamName !== undefined) updateData.teamName = teamName;
      if (tagline !== undefined) updateData.tagline = tagline;
      if (defaultGameChangerUrl !== undefined)
        updateData.defaultGameChangerUrl = defaultGameChangerUrl;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

      await updateDocument(settings._id, updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
