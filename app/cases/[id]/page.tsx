import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import CaseDetailView from "./CaseDetailView";
import { mapSurveyToCase } from "@/lib/surveys/mapper";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const surveyId = parseInt(id, 10);
  // #region agent log
  const _ = await fetch('http://127.0.0.1:7776/ingest/358c4c1c-d29f-415a-9f11-2e32b017b478',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'420f70'},body:JSON.stringify({sessionId:'420f70',location:'cases/[id]/page.tsx',message:'Case page loaded',data:{id,surveyId,isNaN:Number.isNaN(surveyId)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>null);
  // #endregion
  if (Number.isNaN(surveyId)) {
    return <div className="p-8 text-center text-red-600">Invalid case ID.</div>;
  }
  const { data: survey, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", surveyId)
    .single();

  if (error || !survey) {
    console.error("Error fetching survey:", error);
    // Handle error or redirect
    return (
      <div className="p-8 text-center text-red-600">
        Case not found or error loading case.
      </div>
    );
  }

  const caseData = mapSurveyToCase(survey);

  return <CaseDetailView caseData={caseData} />;
}
