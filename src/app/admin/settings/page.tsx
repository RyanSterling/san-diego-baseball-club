"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AdminButton,
  AdminInput,
  AdminCard,
  AdminLoadingState,
  AdminImageUpload,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";
import { urlFor } from "@/lib/sanity/image";

interface SocialLink {
  _key: string;
  platform: string;
  url: string;
}

interface Settings {
  _id?: string;
  teamName: string;
  tagline: string;
  logo: unknown | null;
  defaultGameChangerUrl: string;
  contactEmail: string;
  socialLinks: SocialLink[];
}

const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "Twitter",
  "YouTube",
  "TikTok",
];

export default function AdminSettingsPage() {
  const { showSuccess, showError } = useToast();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    teamName: "",
    tagline: "",
    defaultGameChangerUrl: "",
    contactEmail: "",
    socialLinks: [] as SocialLink[],
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();

        if (data.success && data.settings) {
          const s = data.settings;
          setSettings(s);
          setForm({
            teamName: s.teamName || "",
            tagline: s.tagline || "",
            defaultGameChangerUrl: s.defaultGameChangerUrl || "",
            contactEmail: s.contactEmail || "",
            socialLinks: s.socialLinks || [],
          });
          if (s.logo) {
            setLogoPreview(urlFor(s.logo).width(200).url());
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleLogoChange = useCallback(
    async (file: File | null, preview: string | null) => {
      setLogoPreview(preview);

      if (file) {
        setUploadingLogo(true);
        try {
          const formData = new FormData();
          formData.append("logo", file);

          const res = await fetch("/api/admin/settings/logo", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to upload logo");
          }

          showSuccess("Logo uploaded");
        } catch (error) {
          showError(error instanceof Error ? error.message : "Failed to upload logo");
          setLogoPreview(settings?.logo ? urlFor(settings.logo).width(200).url() : null);
        } finally {
          setUploadingLogo(false);
        }
      }
    },
    [settings, showSuccess, showError]
  );

  const handleAddSocialLink = () => {
    setForm({
      ...form,
      socialLinks: [
        ...form.socialLinks,
        { _key: Math.random().toString(36).slice(2, 10), platform: "", url: "" },
      ],
    });
  };

  const handleRemoveSocialLink = (key: string) => {
    setForm({
      ...form,
      socialLinks: form.socialLinks.filter((l) => l._key !== key),
    });
  };

  const handleSocialLinkChange = (
    key: string,
    field: "platform" | "url",
    value: string
  ) => {
    setForm({
      ...form,
      socialLinks: form.socialLinks.map((l) =>
        l._key === key ? { ...l, [field]: value } : l
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      showSuccess("Settings saved");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoadingState variant="form" rows={6} />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white mb-6">
        Site <span className="text-teal">Settings</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <AdminCard title="Branding">
          <div className="space-y-6">
            <AdminImageUpload
              label={uploadingLogo ? "Uploading..." : "Team Logo"}
              value={logoPreview}
              onChange={handleLogoChange}
            />

            <AdminInput
              label="Team Name"
              value={form.teamName}
              onChange={(v) => setForm({ ...form, teamName: v })}
              placeholder="e.g., SD Baseball Club"
            />

            <AdminInput
              label="Tagline"
              value={form.tagline}
              onChange={(v) => setForm({ ...form, tagline: v })}
              placeholder="Optional tagline"
            />
          </div>
        </AdminCard>

        <AdminCard title="Links" className="mt-6">
          <div className="space-y-6">
            <AdminInput
              label="GameChanger URL"
              type="url"
              value={form.defaultGameChangerUrl}
              onChange={(v) => setForm({ ...form, defaultGameChangerUrl: v })}
              placeholder="https://gc.com/..."
            />

            <AdminInput
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(v) => setForm({ ...form, contactEmail: v })}
              placeholder="team@example.com"
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Social Links"
          className="mt-6"
          actions={
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddSocialLink}
            >
              + Add Link
            </AdminButton>
          }
        >
          {form.socialLinks.length > 0 ? (
            <div className="space-y-4">
              {form.socialLinks.map((link) => (
                <div key={link._key} className="flex gap-3 items-start">
                  <div className="w-40">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        handleSocialLinkChange(link._key, "platform", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/20 text-white px-3 py-2.5 rounded-lg"
                    >
                      <option value="" className="bg-dark">
                        Platform
                      </option>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p} className="bg-dark">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <AdminInput
                      type="url"
                      value={link.url}
                      onChange={(v) => handleSocialLinkChange(link._key, "url", v)}
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(link._key)}
                    className="p-2 text-white/50 hover:text-pink transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-4">
              No social links added
            </p>
          )}
        </AdminCard>

        <div className="flex justify-end mt-6">
          <AdminButton type="submit" loading={saving}>
            Save Settings
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
