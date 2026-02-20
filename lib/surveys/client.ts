import { uploadImagesAndReplaceUrls } from "./upload";

/**
 * Client-side survey save. Uploads images to Supabase Storage first,
 * then sends only URLs in the payload (no base64 in body).
 */
export async function saveSurveyClient(caseData: any): Promise<{
  success?: boolean;
  id?: string;
  error?: string;
}> {
  let payload = caseData;
  try {
    payload = await uploadImagesAndReplaceUrls(
      { ...caseData },
      `survey/${caseData.id || "new"}`
    );
  } catch (uploadErr) {
    console.error("Image upload failed:", uploadErr);
    return {
      error:
        uploadErr instanceof Error ? uploadErr.message : "Failed to upload images",
    };
  }

  const res = await fetch("/api/surveys/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error || "Failed to save" };
  }

  return { success: true, id: data.id };
}
