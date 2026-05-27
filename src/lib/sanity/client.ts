import { createClient } from "next-sanity";

// Use a placeholder for build-time if not configured
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
});

// Check if Sanity is properly configured
export const isSanityConfigured = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== undefined;
