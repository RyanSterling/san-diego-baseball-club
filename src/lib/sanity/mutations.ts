import { writeClient, isWriteConfigured } from "./writeClient";

// Check write capability
export function ensureWriteCapability() {
  if (!isWriteConfigured) {
    throw new Error("SANITY_API_TOKEN not configured");
  }
}

// Create document
export async function createDocument<T extends Record<string, unknown>>(
  type: string,
  data: T
): Promise<T & { _id: string }> {
  ensureWriteCapability();
  const doc = {
    _type: type,
    ...data,
  };
  return writeClient.create(doc) as unknown as Promise<T & { _id: string }>;
}

// Update document
export async function updateDocument(
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  ensureWriteCapability();
  return writeClient.patch(id).set(data).commit();
}

// Delete document
export async function deleteDocument(id: string): Promise<void> {
  ensureWriteCapability();
  await writeClient.delete(id);
}

// Upload image asset
export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ _id: string; url: string }> {
  ensureWriteCapability();
  return writeClient.assets.upload("image", file, {
    filename,
    contentType,
  });
}

// Upload image from File/Blob
export async function uploadImageFromFile(
  file: File | Blob,
  filename?: string
): Promise<{ _id: string; url: string }> {
  ensureWriteCapability();
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = filename || (file instanceof File ? file.name : "image");
  const type = file.type || "image/jpeg";
  return uploadImage(buffer, name, type);
}

// Create image reference from asset ID
export function createImageReference(assetId: string) {
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: assetId,
    },
  };
}

// Create document reference
export function createReference(id: string) {
  return {
    _type: "reference",
    _ref: id,
  };
}

// Create slug from string
export function createSlug(text: string) {
  return {
    _type: "slug",
    current: generateSlug(text),
  };
}

// Generate slug string from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generate unique key for array items
export function generateKey(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Append to array field
export async function appendToArray(
  id: string,
  fieldName: string,
  item: Record<string, unknown>
): Promise<void> {
  ensureWriteCapability();
  await writeClient
    .patch(id)
    .setIfMissing({ [fieldName]: [] })
    .append(fieldName, [{ _key: generateKey(), ...item }])
    .commit();
}

// Remove from array by key
export async function removeFromArray(
  id: string,
  fieldName: string,
  key: string
): Promise<void> {
  ensureWriteCapability();
  await writeClient
    .patch(id)
    .unset([`${fieldName}[_key=="${key}"]`])
    .commit();
}

// Update array item by key
export async function updateArrayItem(
  id: string,
  fieldName: string,
  key: string,
  data: Record<string, unknown>
): Promise<void> {
  ensureWriteCapability();
  const setData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    setData[`${fieldName}[_key=="${key}"].${k}`] = v;
  }
  await writeClient.patch(id).set(setData).commit();
}

// Unset current season flag on all seasons
export async function clearCurrentSeason(): Promise<void> {
  ensureWriteCapability();
  const currentSeasons = await writeClient.fetch<string[]>(
    `*[_type == "season" && isCurrent == true]._id`
  );
  for (const seasonId of currentSeasons) {
    await updateDocument(seasonId, { isCurrent: false });
  }
}

// Set a season as current (clears others first)
export async function setCurrentSeason(seasonId: string): Promise<void> {
  await clearCurrentSeason();
  await updateDocument(seasonId, { isCurrent: true });
}
