// Detection-driven question graph. Each node decides whether it's relevant based on
// the current wizard state (which folds in DetectionState + prior answers). The engine
// walks the graph, yields the next unanswered node whose `when` is true, merges the
// answer back into state, and persists the answer to the named report fields.

import type { DetectionState } from "@/lib/detection/types";

export type QuestionKind =
  | "yesno"
  | "number"
  | "text"
  | "choice"
  | "measurement";

export type AnswerValue = string | number | boolean | null;

export type WizardState = {
  detection: DetectionState;
  answers: Record<string, AnswerValue>;
  // Pass-through bag for anything the wizard already knows (client info, property type).
  known: Record<string, AnswerValue>;
};

export type PrefillSource = "detection" | "known" | "none";

export type Prefill = {
  value: AnswerValue;
  source: PrefillSource;
  confidence: number;
  evidenceImageId?: string;
};

export type Question = {
  id: string;
  label: string;
  helperText?: string;
  kind: QuestionKind;
  choices?: { value: string; label: string }[];
  unit?: "cm" | "mm";

  // Graph conditions
  when: (state: WizardState) => boolean;

  // Prefill: when detection or known state already contains a likely answer, surface it
  // pre-populated for the assessor to confirm or override.
  prefill?: (state: WizardState) => Prefill | undefined;

  // Which report-form fields this question writes to.
  writesTo: string[];

  // Hard-fail short-circuit: if the answer matches, flag a LAHR hard fail with this label.
  hardFail?: (answer: AnswerValue) => string | null;
};

// ---------- Prefill helpers ----------

function prefillFromDetection(
  state: WizardState,
  field: string,
): Prefill | undefined {
  for (const group of [state.detection.floorPlans, state.detection.photos]) {
    for (const resp of group) {
      for (const fv of resp.fields) {
        if (fv.field === field) {
          return {
            value: fv.value,
            source: "detection",
            confidence: fv.confidence,
            evidenceImageId: fv.evidence_image_id ?? undefined,
          };
        }
      }
    }
  }
  return undefined;
}

function prefillFromKnown(state: WizardState, key: string): Prefill | undefined {
  if (key in state.known && state.known[key] !== null && state.known[key] !== undefined) {
    return { value: state.known[key], source: "known", confidence: 1.0 };
  }
  return undefined;
}

function hasDetectedClass(state: WizardState, cls: string): boolean {
  for (const group of [state.detection.floorPlans, state.detection.photos]) {
    for (const resp of group) {
      if (resp.annotations.some((a) => a.object_class === cls)) return true;
    }
  }
  return false;
}

function isFlat(state: WizardState): boolean {
  const t = state.known.property_type;
  return typeof t === "string" && /flat|apartment/i.test(t);
}

// ---------- The question graph ----------

export const QUESTION_GRAPH: Question[] = [
  // Lift on a flat above ground floor.
  {
    id: "lift_present",
    label: "Is there a communal lift in this block?",
    kind: "yesno",
    when: (s) => isFlat(s),
    prefill: (s) => {
      const fromDetection = prefillFromDetection(s, "has_communal_lift");
      if (fromDetection) return fromDetection;
      return hasDetectedClass(s, "lift")
        ? { value: true, source: "detection", confidence: 0.75 }
        : undefined;
    },
    writesTo: ["has_communal_lift"],
  },
  {
    id: "lift_door_width",
    label: "Communal lift door opening width",
    kind: "measurement",
    unit: "cm",
    when: (s) => isFlat(s) && s.answers.has_communal_lift === true,
    prefill: (s) => prefillFromDetection(s, "communal_lift_door_width"),
    writesTo: ["communal_lift_door_width"],
  },
  {
    id: "lift_internal_width",
    label: "Communal lift internal width",
    kind: "measurement",
    unit: "cm",
    when: (s) => isFlat(s) && s.answers.has_communal_lift === true,
    prefill: (s) => prefillFromDetection(s, "communal_lift_dim_width"),
    writesTo: ["communal_lift_dim_width"],
  },
  {
    id: "lift_internal_depth",
    label: "Communal lift internal depth",
    kind: "measurement",
    unit: "cm",
    when: (s) => isFlat(s) && s.answers.has_communal_lift === true,
    prefill: (s) => prefillFromDetection(s, "communal_lift_dim_depth"),
    writesTo: ["communal_lift_dim_depth"],
  },
  {
    id: "floor_level",
    label: "Which floor is this property on?",
    kind: "number",
    when: (s) => isFlat(s) && s.answers.has_communal_lift === false,
    prefill: (s) => prefillFromKnown(s, "entrance_floor_level"),
    writesTo: ["entrance_floor_level"],
    hardFail: (ans) =>
      typeof ans === "number" && ans > 0
        ? "Upper-floor flat with no communal lift — LAHR F (no step-free access)."
        : null,
  },

  // Internal stairs → handrails + stairlift feasibility.
  {
    id: "handrails_present",
    label: "Do the internal stairs have handrails?",
    kind: "yesno",
    when: (s) => hasDetectedClass(s, "stairs") || s.answers.has_internal_stairs === true,
    prefill: (s) => {
      const detected = prefillFromDetection(s, "stair_70cm_clearance");
      if (detected) return detected;
      return hasDetectedClass(s, "handrail")
        ? { value: true, source: "detection", confidence: 0.7 }
        : undefined;
    },
    writesTo: ["stair_70cm_clearance"],
  },
  {
    id: "handrails_can_be_added",
    label: "Could handrails be added (clear 70cm stair width)?",
    kind: "yesno",
    when: (s) =>
      (hasDetectedClass(s, "stairs") || s.answers.has_internal_stairs === true) &&
      s.answers.handrails_present === false,
    writesTo: ["adaptation_handrail_feasible"],
  },
  {
    id: "stairlift_feasible",
    label: "Is a stair lift feasible on these stairs?",
    helperText: "Stair width ≥ 70cm straight / 75cm curved and no obstructions.",
    kind: "yesno",
    when: (s) => hasDetectedClass(s, "stairs") || s.answers.has_internal_stairs === true,
    prefill: (s) => {
      if (hasDetectedClass(s, "stairlift")) {
        return { value: true, source: "detection", confidence: 0.85 };
      }
      const w = prefillFromDetection(s, "stair_width_cm");
      if (w && typeof w.value === "number") {
        return { value: w.value >= 70, source: "detection", confidence: 0.6 };
      }
      return undefined;
    },
    writesTo: ["has_stair_lift"],
  },

  // Bathroom: wet-room conversion feasibility.
  {
    id: "wet_room_conversion_feasible",
    label: "Can the bathroom be converted to a level-access wet room?",
    kind: "yesno",
    when: (s) => {
      const hasBathtub = hasDetectedClass(s, "bathtub");
      const hasLAS = hasDetectedClass(s, "level_access_shower");
      return hasBathtub && !hasLAS;
    },
    writesTo: ["adaptation_wetroom_feasible"],
  },

  // Entrance steps → ramp feasibility.
  {
    id: "entrance_step_count",
    label: "How many steps at the property front door?",
    kind: "number",
    when: (s) => hasDetectedClass(s, "threshold_step") || hasDetectedClass(s, "external_door"),
    prefill: (s) => prefillFromDetection(s, "property_door_steps_count"),
    writesTo: ["property_door_steps_count"],
  },
  {
    id: "ramp_feasible",
    label: "Is a ramp feasible here (max 1:12 run length)?",
    kind: "yesno",
    when: (s) => {
      const steps = s.answers.entrance_step_count;
      return typeof steps === "number" && steps > 0;
    },
    writesTo: ["adaptation_ramp_feasible"],
  },

  // Hallway widths — always asked if not detected with high confidence.
  {
    id: "hallway_head_on_width",
    label: "Hallway head-on width",
    kind: "measurement",
    unit: "cm",
    when: (s) => {
      const pre = prefillFromDetection(s, "hallway_width_head_on_cm");
      return !pre || pre.confidence < 0.8;
    },
    prefill: (s) => prefillFromDetection(s, "hallway_width_head_on_cm"),
    writesTo: ["hallway_width_head_on_cm"],
  },
  {
    id: "hallway_turn_width",
    label: "Hallway width at turning points",
    kind: "measurement",
    unit: "cm",
    when: (s) => {
      const pre = prefillFromDetection(s, "hallway_width_turn_cm");
      return !pre || pre.confidence < 0.8;
    },
    prefill: (s) => prefillFromDetection(s, "hallway_width_turn_cm"),
    writesTo: ["hallway_width_turn_cm"],
  },
];
