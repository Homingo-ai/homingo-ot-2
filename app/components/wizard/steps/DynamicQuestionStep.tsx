"use client";

import React, { useMemo, useState } from "react";
import {
  nextQuestion,
  applyAnswer,
  remainingQuestions,
  hardFailsFromAnswers,
  answersToFormFields,
} from "@/lib/wizard/questionEngine";
import type {
  AnswerValue,
  Prefill,
  WizardState,
} from "@/lib/wizard/questionGraph";

type Props = {
  state: WizardState;
  onStateChange: (next: WizardState) => void;
  onComplete: (fields: Record<string, AnswerValue>) => void;
};

function SourceBadge({ prefill }: { prefill: Prefill | undefined }) {
  if (!prefill) return null;
  const bg =
    prefill.source === "detection"
      ? "bg-emerald-100 text-emerald-700"
      : prefill.source === "known"
        ? "bg-sky-100 text-sky-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${bg}`}>
      {prefill.source === "detection" ? "detected" : "from file"} ·{" "}
      {Math.round(prefill.confidence * 100)}%
    </span>
  );
}

export default function DynamicQuestionStep({ state, onStateChange, onComplete }: Props) {
  const question = nextQuestion(state);
  const remaining = remainingQuestions(state);
  const hardFails = hardFailsFromAnswers(state);

  const prefill = useMemo(
    () => (question?.prefill ? question.prefill(state) : undefined),
    [question, state],
  );

  const [draft, setDraft] = useState<AnswerValue | null>(
    prefill ? (prefill.value as AnswerValue) : null,
  );

  React.useEffect(() => {
    setDraft(prefill ? (prefill.value as AnswerValue) : null);
  }, [question?.id, prefill]);

  if (!question) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All follow-ups answered</h2>
        <p className="text-sm text-slate-600">
          Detection covered the rest. Review the form on the next step.
        </p>
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => onComplete(answersToFormFields(state))}
        >
          Continue to report
        </button>
      </div>
    );
  }

  const submit = () => {
    const value =
      question.kind === "number" || question.kind === "measurement"
        ? typeof draft === "number"
          ? draft
          : draft
            ? Number(draft)
            : null
        : draft;
    const next = applyAnswer(state, question.id, value);
    onStateChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{question.label}</h2>
        <SourceBadge prefill={prefill} />
      </div>
      {question.helperText ? (
        <p className="text-sm text-slate-600">{question.helperText}</p>
      ) : null}

      {question.kind === "yesno" && (
        <div className="flex gap-2">
          {[
            { v: true, label: "Yes" },
            { v: false, label: "No" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setDraft(opt.v)}
              className={`rounded border px-4 py-2 text-sm ${
                draft === opt.v
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {(question.kind === "number" || question.kind === "measurement") && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={draft === null || draft === undefined ? "" : String(draft)}
            onChange={(e) => setDraft(e.target.value === "" ? null : Number(e.target.value))}
            className="w-40 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {question.unit ? (
            <span className="text-sm text-slate-500">{question.unit}</span>
          ) : null}
        </div>
      )}

      {question.kind === "text" && (
        <input
          type="text"
          value={draft === null || draft === undefined ? "" : String(draft)}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      )}

      {question.kind === "choice" && question.choices && (
        <div className="flex flex-wrap gap-2">
          {question.choices.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setDraft(c.value)}
              className={`rounded border px-3 py-1.5 text-sm ${
                draft === c.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {hardFails.length > 0 && (
        <div className="rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-medium">LAHR hard-fail triggered</p>
          <ul className="list-inside list-disc">
            {hardFails.map((f) => (
              <li key={f.questionId}>{f.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          {remaining.length} follow-up{remaining.length === 1 ? "" : "s"} remaining
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={draft === null || draft === undefined}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
