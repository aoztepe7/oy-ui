"use client";

import { useState } from "react";
import type { FormQuestion } from "@/lib/types";
import { DateField } from "./DateField";

const OTHER = "Diğer";
const OTHER_PREFIX = `${OTHER}: `;
const ERROR = "mt-1 text-sm font-semibold text-[#9b3a26]";
const PILL =
  "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 ring-1 ring-line transition has-checked:bg-sage-soft has-checked:ring-2 has-checked:ring-moss";

/** Values by question id. MultiSelect: one option per line. */
export type AnswerValues = Record<string, string>;

const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

/** Whether the question's condition holds for the given answers (no condition: always). */
export function isShown(q: FormQuestion, values: AnswerValues): boolean {
  const cond = q.showIf;
  if (!cond) return true;
  const value = values[cond.questionId];
  if (!value) return false;
  return value.split("\n").some((part) => cond.values.includes(part.startsWith(OTHER_PREFIX) ? OTHER : part));
}

/** Checkbox answers arrive as "true" from the form and as "Evet" from the API; conditions compare with Evet / Hayır. */
export const conditionValue = (q: FormQuestion, value: string) =>
  q.type === "Checkbox" ? (value === "true" || value === "on" || value === "Evet" ? "Evet" : "Hayır") : value;

/** Hint lines the rules imply ("50 – 200 cm", "En fazla 3 seçim"). */
function ruleHint(q: FormQuestion): string {
  const parts: string[] = [];
  if (q.type === "Number") {
    const unit = q.unit ? ` ${q.unit}` : "";
    if (q.min != null && q.max != null) parts.push(`${fmt(q.min)} – ${fmt(q.max)}${unit} arası`);
    else if (q.min != null) parts.push(`En az ${fmt(q.min)}${unit}`);
    else if (q.max != null) parts.push(`En fazla ${fmt(q.max)}${unit}`);
    if (q.integer) parts.push("küsuratsız");
  }
  if (q.type === "MultiSelect") {
    if (q.minChoices && q.maxChoices) parts.push(q.minChoices === q.maxChoices ? `${q.minChoices} seçim yapın` : `${q.minChoices} – ${q.maxChoices} seçim`);
    else if (q.maxChoices) parts.push(`En fazla ${q.maxChoices} seçim`);
    else if (q.minChoices && q.minChoices > 1) parts.push(`En az ${q.minChoices} seçim`);
    else parts.push("Birden fazla seçebilirsiniz");
  }
  if (q.type === "Text" && q.format === "NationalId") parts.push("11 haneli");
  return parts.join(", ");
}

/** Questions that read better across the whole row. */
const wide = (q: FormQuestion) =>
  q.type === "Textarea" || q.type === "Checkbox" || q.type === "Radio" || q.type === "MultiSelect" || q.type === "Section";

/**
 * Custom questions from the panel, as one group (family questions, one child's questions, a registration form).
 * Keeps the answers in state so conditional questions appear and disappear; hidden questions are not submitted.
 * `name(q)` is the form field name of a question; `initial` / `errors` are keyed by that name.
 */
export function QuestionGroup({
  questions,
  name,
  initial = {},
  errors = {},
  context = {},
  onChange,
  wideClass = "sm:col-span-full",
}: {
  questions: FormQuestion[];
  name: (q: FormQuestion) => string;
  initial?: Record<string, string>;
  errors?: Record<string, string>;
  /** Answers outside this group conditions may refer to (a child's question on a family answer). */
  context?: AnswerValues;
  onChange?: (values: AnswerValues) => void;
  wideClass?: string;
}) {
  const [values, setValues] = useState<AnswerValues>(() =>
    Object.fromEntries(questions.map((q) => [q.id, initial[name(q)] ?? ""])),
  );
  const set = (id: string, value: string) => {
    const next = { ...values, [id]: value };
    setValues(next);
    onChange?.(conditionValues(questions, next, {}));
  };
  const known = conditionValues(questions, values, context);

  return (
    <>
      {questions.map((q) =>
        isShown(q, known) ? (
          <div key={q.id} className={wide(q) ? wideClass : undefined}>
            <QuestionField q={q} name={name(q)} value={values[q.id] ?? ""} onChange={(v) => set(q.id, v)} error={errors[name(q)]} />
          </div>
        ) : null,
      )}
    </>
  );
}

/** Values conditions compare with: `context` plus the answers of the questions that are shown. */
function conditionValues(questions: FormQuestion[], values: AnswerValues, context: AnswerValues): AnswerValues {
  const result: AnswerValues = { ...context };
  for (const q of questions) {
    if (!isShown(q, result)) continue;
    const v = values[q.id];
    if (v) result[q.id] = conditionValue(q, v);
  }
  return result;
}

/** One question. Choice answers are kept as the API expects them ("Diğer: …", one option per line). */
function QuestionField({
  q,
  name,
  value,
  onChange,
  error,
}: {
  q: FormQuestion;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = `f-${name}`;
  const hint = [q.hint, ruleHint(q)].filter(Boolean).join(" · ");
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const optional = !q.required && q.type !== "Section" && <span className="font-normal text-bark"> (isteğe bağlı)</span>;
  const below = (
    <>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-bark">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={ERROR}>
          {error}
        </p>
      )}
    </>
  );

  switch (q.type) {
    case "Section":
      return (
        <div className="border-t border-line/70 pt-5">
          <h3 className="font-serif text-xl text-forest">{q.label}</h3>
          {q.hint && <p className="mt-1 whitespace-pre-line text-sm text-bark">{q.hint}</p>}
        </div>
      );

    case "Checkbox":
      return (
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-ink">
            <input
              type="checkbox"
              id={id}
              name={name}
              value="true"
              checked={value === "true" || value === "on" || value === "Evet"}
              onChange={(e) => onChange(e.target.checked ? "true" : "")}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className="mt-1 h-4 w-4 accent-forest"
            />
            <span>
              {q.label}
              {optional}
            </span>
          </label>
          {below}
        </div>
      );

    case "Date": {
      const now = new Date().getFullYear();
      const from = q.minDate ? Number(q.minDate.slice(0, 4)) : now - 20;
      const to = q.maxDate ? Number(q.maxDate.slice(0, 4)) : now + 5;
      const years = Array.from({ length: Math.max(1, to - from + 1) }, (_, i) => to - i);
      return <DateField name={name} label={q.label} defaultValue={value} required={q.required} error={error} hint={hint || undefined} years={years} />;
    }

    case "YesNo":
    case "Radio":
      return (
        <fieldset aria-describedby={describedBy}>
          <legend className="mb-1.5 font-semibold text-ink">
            {q.label}
            {optional}
          </legend>
          <Choices q={q} name={name} value={value} onChange={onChange} options={q.type === "YesNo" ? ["Evet", "Hayır"] : q.options} />
          {below}
        </fieldset>
      );

    case "MultiSelect":
      return (
        <fieldset aria-describedby={describedBy}>
          <legend className="mb-1.5 font-semibold text-ink">
            {q.label}
            {optional}
          </legend>
          <MultiChoices q={q} name={name} value={value} onChange={onChange} />
          {below}
        </fieldset>
      );

    case "Select": {
      const other = value.startsWith(OTHER);
      return (
        <div>
          <label htmlFor={id} className="mb-1.5 block font-semibold text-ink">
            {q.label}
            {optional}
          </label>
          <select
            id={id}
            value={other ? OTHER : value}
            onChange={(e) => onChange(e.target.value === OTHER ? OTHER_PREFIX : e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="field"
          >
            <option value="">Seçin…</option>
            {q.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            {q.allowOther && <option value={OTHER}>{OTHER}…</option>}
          </select>
          <input type="hidden" name={name} value={value} />
          {other && <OtherText value={value} onChange={onChange} label={q.label} />}
          {below}
        </div>
      );
    }

    default: {
      const textarea = q.type === "Textarea";
      const number = q.type === "Number";
      const limit = q.maxLength ?? (q.format === "NationalId" ? 11 : textarea ? 2000 : 500);
      const inputMode = number
        ? q.integer && (q.min ?? 0) >= 0
          ? "numeric"
          : "decimal"
        : q.format === "Digits" || q.format === "NationalId"
          ? "numeric"
          : q.format === "Phone"
            ? "tel"
            : q.format === "Email"
              ? "email"
              : undefined;
      const common = {
        id,
        name,
        value,
        maxLength: number ? 20 : limit,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: "field",
      };
      return (
        <div>
          <label htmlFor={id} className="mb-1.5 block font-semibold text-ink">
            {q.label}
            {optional}
          </label>
          {textarea ? (
            <textarea rows={4} {...common} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <div className="relative">
              <input
                type={q.format === "Email" ? "email" : q.format === "Phone" ? "tel" : "text"}
                inputMode={inputMode}
                autoComplete="off"
                {...common}
                onChange={(e) => onChange(e.target.value)}
                className={number && q.unit ? "field pr-14" : "field"}
              />
              {number && q.unit && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-sm font-semibold text-bark">
                  {q.unit}
                </span>
              )}
            </div>
          )}
          {below}
        </div>
      );
    }
  }
}

/** Single choice as buttons, with "Diğer" + text when allowed. */
function Choices({
  q,
  name,
  value,
  onChange,
  options,
}: {
  q: FormQuestion;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const other = q.type !== "YesNo" && !!q.allowOther && value.startsWith(OTHER);
  return (
    <>
      <div className={`flex gap-2 ${q.type === "YesNo" ? "" : "flex-wrap"}`}>
        {options.map((o) => (
          <label key={o} className={PILL}>
            <input type="radio" name={`${name}__choice`} checked={value === o} onChange={() => onChange(o)} className="accent-forest" />
            <span className="text-[0.95rem] font-semibold text-ink">{o}</span>
          </label>
        ))}
        {q.type !== "YesNo" && q.allowOther && (
          <label className={PILL}>
            <input type="radio" name={`${name}__choice`} checked={other} onChange={() => onChange(OTHER_PREFIX)} className="accent-forest" />
            <span className="text-[0.95rem] font-semibold text-ink">{OTHER}</span>
          </label>
        )}
      </div>
      <input type="hidden" name={name} value={value} />
      {other && <OtherText value={value} onChange={onChange} label={q.label} />}
    </>
  );
}

/** Several choices; each ticked option is submitted as its own field value (joined by the server action). */
function MultiChoices({ q, name, value, onChange }: { q: FormQuestion; name: string; value: string; onChange: (value: string) => void }) {
  const picked = value ? value.split("\n") : [];
  const otherValue = picked.find((p) => p.startsWith(OTHER));
  const limitReached = !!q.maxChoices && picked.length >= q.maxChoices;
  const toggle = (option: string, on: boolean) => {
    const rest = picked.filter((p) => (option === OTHER ? !p.startsWith(OTHER) : p !== option));
    onChange((on ? [...rest, option === OTHER ? OTHER_PREFIX : option] : rest).join("\n"));
  };
  const box = (option: string, checked: boolean) => (
    <label key={option} className={`${PILL} ${!checked && limitReached ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={!checked && limitReached}
        onChange={(e) => toggle(option, e.target.checked)}
        className="h-4 w-4 accent-forest"
      />
      <span className="text-[0.95rem] font-semibold text-ink">{option}</span>
    </label>
  );
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {q.options.map((o) => box(o, picked.includes(o)))}
        {q.allowOther && box(OTHER, otherValue !== undefined)}
      </div>
      {picked.map((p) => (
        <input key={p} type="hidden" name={name} value={p} />
      ))}
      {otherValue !== undefined && (
        <OtherText
          value={otherValue}
          onChange={(v) => onChange(picked.map((p) => (p.startsWith(OTHER) ? v : p)).join("\n"))}
          label={q.label}
        />
      )}
    </>
  );
}

/** Free text of the "Diğer" choice; keeps the value as "Diğer: …". */
function OtherText({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const text = value.startsWith(OTHER_PREFIX) ? value.slice(OTHER_PREFIX.length) : value.slice(OTHER.length).replace(/^:\s*/, "");
  return (
    <input
      type="text"
      value={text}
      maxLength={200}
      autoFocus
      placeholder="Lütfen belirtin"
      aria-label={`${label}: diğer`}
      onChange={(e) => onChange(OTHER_PREFIX + e.target.value.replace(/\n/g, " "))}
      className="field mt-2"
    />
  );
}
