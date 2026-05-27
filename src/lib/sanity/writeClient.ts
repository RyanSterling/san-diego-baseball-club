import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

// Write client with API token for mutations
// Only works server-side where SANITY_API_TOKEN is available
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for writes
  token: process.env.SANITY_API_TOKEN,
});

export const isWriteConfigured = !!process.env.SANITY_API_TOKEN;
