import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Allow larger payloads for case data with base64 images
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    let caseData: any;
    try {
      caseData = await req.json();
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      const isTruncated = /unterminated|position|unexpected end/i.test(msg);
      return NextResponse.json(
        {
          error: isTruncated
            ? "Request body too large or truncated. Try fewer or smaller images."
            : `Invalid JSON: ${msg}`,
        },
        { status: 400 }
      );
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wizardData = caseData.mlData?.wizardData || {};

    const surveyData = {
      user_id: user.id,
      inspector_name: user.email,
      inspection_date: caseData.assessmentDate || new Date().toISOString(),
      door_number: wizardData.doorNo || "",
      street_number: wizardData.streetNo || "",
      building_name: wizardData.buildingName || "",
      street: wizardData.street || caseData.address || "",
      postcode: wizardData.postcode || caseData.postcode || "",
      compliance_score: caseData.aiScore,
      status: caseData.status,
      thumbnail_url: caseData.thumbnail,
      raw_ai_data: caseData.mlData,
      comments: caseData.description,
      overall_grade: caseData.mlData?.aiReport?.Grade,
      ai_confidence: 0.9,
    };

    const isExistingRecord =
      caseData.id && !isNaN(Number(caseData.id));
    let error;
    let newId = caseData.id;

    if (isExistingRecord) {
      const { error: updateError } = await supabase
        .from("surveys")
        .update(surveyData)
        .eq("id", Number(caseData.id));
      error = updateError;
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from("surveys")
        .insert(surveyData)
        .select("id")
        .single();

      if (insertedData) {
        newId = insertedData.id.toString();
      }
      error = insertError;
    }

    if (error) {
      console.error("Error saving survey:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("Save survey API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
