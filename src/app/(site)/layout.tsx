import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/types/sanity";

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch(siteSettingsQuery);
  } catch {
    return null;
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-dark">{children}</main>
      <Footer
        teamName={settings?.teamName}
        contactEmail={settings?.contactEmail}
        socialLinks={settings?.socialLinks}
      />
    </div>
  );
}
