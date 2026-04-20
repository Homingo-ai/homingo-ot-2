// Walks the question graph. Call `nextQuestion(state)` to get the next node to show;
// call `applyAnswer(state, id, value)` to merge the answer back and move on.

import { QUESTION_GRAPH, type AnswerValue, type Question, type WizardState } from "./questionGraph";

export type WizardHardFail = {
  questionId: string;
  reason: string;
};

export function nextQuestion(state: WizardState): Question | null {
  for (const q of QUESTION_GRAPH) {
    if (q.id in state.answers) continue;
    if (!q.when(state)) continue;
    return q;
  }
  return null;
}

export function remainingQuestions(state: WizardState): Question[] {
  return QUESTION_GRAPH.filter((q) => !(q.id in state.answers) && q.when(state));
}

export function allAnsweredOrSkipped(state: WizardState): boolean {
  return remainingQuestions(state).length === 0;
}

export function applyAnswer(
  state: WizardState,
  questionId: string,
  value: AnswerValue,
): WizardState {
  return {
    ...state,
    answers: { ...state.answers, [questionId]: value },
  };
}

export function hardFailsFromAnswers(state: WizardState): WizardHardFail[] {
  const fails: WizardHardFail[] = [];
  for (const q of QUESTION_GRAPH) {
    if (!(q.id in state.answers) || !q.hardFail) continue;
    const reason = q.hardFail(state.answers[q.id]);
    if (reason) fails.push({ questionId: q.id, reason });
  }
  return fails;
}

export function answersToFormFields(state: WizardState): Record<string, AnswerValue> {
  const out: Record<string, AnswerValue> = {};
  for (const q of QUESTION_GRAPH) {
    if (!(q.id in state.answers)) continue;
    const value = state.answers[q.id];
    for (const field of q.writesTo) {
      out[field] = value;
    }
  }
  return out;
}

export function initWizardState(opts: {
  detection: WizardState["detection"];
  known?: WizardState["known"];
}): WizardState {
  return {
    detection: opts.detection,
    answers: {},
    known: opts.known ?? {},
  };
}
