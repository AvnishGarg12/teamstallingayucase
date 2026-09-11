import { supabase } from "@/integrations/supabase/client";

const BUCKET = "case-documents";

/** Uploads a captured photo to the shared store and returns its path. */
export async function uploadDocumentPhoto(
  caseId: string,
  docId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${caseId}/${docId}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) return null;
  return path;
}

/** Short-lived link so signed-in staff can view a stored photo. */
export async function getDocumentPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
