"use client";

import { useActionState, useState } from "react";
import { submitEnrollment } from "@/lib/actions";
import type { EnrollmentFormConfig, FieldMode, FormQuestion } from "@/lib/types";
import { birthYears, DateField, eventYears } from "./DateField";
import { Field, FormMessage, Honeypot, initialFormState } from "./FormParts";

export interface EnrollmentPackage {
  /** Package label as in the price table ("2 Yetişkin + 2 Çocuk"). */
  label: string;
  /** Formatted price ("₺27.000"). */
  price: string;
}

/** The original fixed form; used when the API does not send a definition. */
export const DEFAULT_FORM: EnrollmentFormConfig = {
  intro: "",
  childBirthDate: "Required",
  parentPhone: "Required",
  parentEmail: "Required",
  note: "Optional",
  allowSiblings: true,
  questions: [],
};

const MAX_CHILDREN = 6;
const ERROR = "mt-1 text-sm font-semibold text-[#9b3a26]";

/** "2 Yetişkin + 2 Çocuk" → 2; null when the label does not say. */
function childrenIn(label: string): number | null {
  const m = /(\d+)\s*(?:çocuk|cocuk)/i.exec(label.toLocaleLowerCase("tr"));
  return m ? Math.min(MAX_CHILDREN, Math.max(1, Number(m[1]))) : null;
}

const shown = (mode: FieldMode) => mode !== "Hidden";

/** One custom question from the panel. `name` is q.{id} (family) or q.{id}.{child}. */
function Question({ q, name, value, error }: { q: FormQuestion; name: string; value?: string; error?: string }) {
  const id = `f-${name}`;
  const describedBy = error ? `${id}-error` : q.hint ? `${id}-hint` : undefined;
  const optional = !q.required && <span className="font-normal text-bark"> (isteğe bağlı)</span>;
  const hint = q.hint && !error && (
    <p id={`${id}-hint`} className="mt-1 text-sm text-bark">
      {q.hint}
    </p>
  );
  const err = error && (
    <p id={`${id}-error`} className={ERROR}>
      {error}
    </p>
  );

  if (q.type === "Checkbox") {
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-ink">
          <input
            type="checkbox"
            id={id}
            name={name}
            value="true"
            defaultChecked={value === "true" || value === "on"}
            required={q.required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="mt-1 h-4 w-4 accent-forest"
          />
          <span>
            {q.label}
            {optional}
          </span>
        </label>
        {hint}
        {err}
      </div>
    );
  }

  if (q.type === "Radio" || q.type === "YesNo") {
    const options = q.type === "YesNo" ? ["Evet", "Hayır"] : q.options;
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="mb-1.5 font-semibold text-ink">
          {q.label}
          {optional}
        </legend>
        <div className={`flex gap-2 ${q.type === "YesNo" ? "" : "flex-wrap"}`}>
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 ring-1 ring-line transition has-checked:bg-sage-soft has-checked:ring-2 has-checked:ring-moss"
            >
              <input type="radio" name={name} value={o} defaultChecked={value === o} required={q.required} className="accent-forest" />
              <span className="text-[0.95rem] font-semibold text-ink">{o}</span>
            </label>
          ))}
        </div>
        {hint}
        {err}
      </fieldset>
    );
  }

  if (q.type === "Select") {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block font-semibold text-ink">
          {q.label}
          {optional}
        </label>
        <select
          id={id}
          name={name}
          defaultValue={value ?? ""}
          required={q.required}
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
        </select>
        {hint}
        {err}
      </div>
    );
  }

  if (q.type === "Date") {
    return <DateField name={name} label={q.label} defaultValue={value} required={q.required} error={error} hint={q.hint || undefined} years={eventYears()} />;
  }

  const type = q.type === "Number" ? "number" : "text";
  return (
    <Field
      name={name}
      label={q.label}
      defaultValue={value}
      required={q.required}
      textarea={q.type === "Textarea"}
      type={q.type === "Textarea" ? undefined : type}
      inputMode={q.type === "Number" ? "decimal" : undefined}
      maxLength={q.type === "Textarea" ? 2000 : 500}
      hint={q.hint || undefined}
      error={error}
    />
  );
}

/**
 * Pre-registration of one family, built from the program's form definition (panel → "Ön kayıt formu").
 * Camps with a price table first ask for the package; choosing it opens as many child fields as it includes.
 */
export function EnrollmentForm({
  programId,
  programTitle,
  packages = [],
  config = DEFAULT_FORM,
}: {
  programId: string;
  programTitle: string;
  packages?: EnrollmentPackage[];
  config?: EnrollmentFormConfig;
}) {
  const [state, action, pending] = useActionState(submitEnrollment, initialFormState);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const maxChildren = config.allowSiblings ? MAX_CHILDREN : 1;
  const [count, setCount] = useState(() => Math.min(maxChildren, Math.max(1, Number(v.childCount) || 1)));
  const [selected, setSelected] = useState(v.priceOption ?? "");

  if (state.status === "success") return <FormMessage state={state} />;

  const included = childrenIn(selected);
  const pick = (label: string) => {
    setSelected(label);
    const n = childrenIn(label);
    if (n) setCount(Math.min(maxChildren, n));
  };
  const familyQuestions = config.questions.filter((q) => !q.perChild);
  const childQuestions = config.questions.filter((q) => q.perChild);
  const steps = packages.length > 0 ? 3 : 2;
  const step = (n: number) => (packages.length > 0 ? n : n - 1);

  return (
    <form action={action} className="relative" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <input type="hidden" name="childCount" value={count} />
      <Honeypot />

      {config.intro && (
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {config.intro && (
            <p className="whitespace-pre-line rounded-2xl bg-sage-soft/60 px-5 py-4 text-[0.95rem] text-forest md:col-span-full">{config.intro}</p>
          )}
        </div>
      )}

      <div className="divide-y divide-line/70">
        {packages.length > 0 && (
          <FormRow n={1} of={steps} id="f-row-package" title="Katılım seçeneği" text="Size uygun paketi seçin; çocuk sayısı pakete göre açılır.">
            <input type="hidden" name="hasPackages" value="1" />
            <div
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              role="radiogroup"
              aria-labelledby="f-row-package"
              aria-describedby={e.priceOption ? "f-priceOption-error" : undefined}
            >
              {packages.map((p) => (
                <label
                  key={p.label}
                  className="group relative flex cursor-pointer flex-col gap-1 rounded-2xl bg-paper px-5 py-4 ring-1 ring-line transition hover:ring-moss has-checked:bg-sage-soft has-checked:ring-2 has-checked:ring-moss"
                >
                  <input
                    type="radio"
                    name="priceOption"
                    value={p.label}
                    checked={selected === p.label}
                    onChange={() => pick(p.label)}
                    required
                    className="absolute right-4 top-4 h-4 w-4 accent-forest"
                  />
                  <span className="pr-6 text-[0.95rem] font-semibold text-ink">{p.label}</span>
                  <span className="font-serif text-2xl text-forest">{p.price}</span>
                </label>
              ))}
            </div>
            {e.priceOption && (
              <p id="f-priceOption-error" className={ERROR}>
                {e.priceOption}
              </p>
            )}
          </FormRow>
        )}

        <FormRow
          n={step(2)}
          of={steps}
          id="f-row-children"
          title={count > 1 ? `Çocuklarınız (${count})` : "Çocuğunuz"}
          text={config.allowSiblings ? "Kardeşleri tek formda kaydedebilirsiniz." : "Programa katılacak çocuğun bilgileri."}
        >
          <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className={count > 1 ? "rounded-2xl bg-sand/50 p-5 ring-1 ring-line/60" : ""}>
                {count > 1 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-moss">
                      <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-moss text-xs text-paper">
                        {i + 1}
                      </span>
                      {i + 1}. çocuk
                    </p>
                    {i === count - 1 && (
                      <button type="button" onClick={() => setCount(count - 1)} className="text-sm font-bold text-bark underline underline-offset-4 hover:text-forest">
                        Kaldır
                      </button>
                    )}
                  </div>
                )}
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Field name={`childName_${i}`} defaultValue={v[`childName_${i}`]} label="Adı soyadı" required autoComplete="off" error={e[`childName_${i}`]} />
                  {shown(config.childBirthDate) && (
                    <DateField
                      name={`childBirthDate_${i}`}
                      defaultValue={v[`childBirthDate_${i}`]}
                      label="Doğum tarihi"
                      required={config.childBirthDate === "Required"}
                      error={e[`childBirthDate_${i}`]}
                      years={birthYears()}
                    />
                  )}
                  {childQuestions.map((q) => (
                    <div key={q.id} className={wide(q) ? "sm:col-span-full" : undefined}>
                      <Question q={q} name={`q.${q.id}.${i}`} value={v[`q.${q.id}.${i}`]} error={e[`q.${q.id}.${i}`]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {e.children && <p className={ERROR}>{e.children}</p>}
            {count < maxChildren && (
              <button
                type="button"
                onClick={() => setCount(count + 1)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line px-4 py-3 text-[0.95rem] font-bold text-forest transition hover:border-moss hover:bg-sage-soft/50 sm:w-auto sm:px-6"
              >
                <span aria-hidden="true">+</span> Kardeş ekle
              </button>
            )}
            {included !== null && count > included && (
              <p className="rounded-2xl bg-ochre/15 px-5 py-3 text-sm text-ochre-deep">
                Seçtiğiniz paket {included} çocuk içeriyor; fazladan eklenen çocuklar için ilave çocuk ücreti uygulanır.
              </p>
            )}
          </div>
        </FormRow>

        <FormRow n={step(3)} of={steps} id="f-row-parent" title="Veli bilgileri" text="Ekibimiz bu bilgilerle size ulaşacak.">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field name="parentName" defaultValue={v.parentName} label="Adınız soyadınız" required autoComplete="name" error={e.parentName} />
            {shown(config.parentPhone) && (
              <Field
                name="parentPhone"
                defaultValue={v.parentPhone}
                label="Telefon"
                type="tel"
                required={config.parentPhone === "Required"}
                autoComplete="tel"
                placeholder="05xx xxx xx xx"
                error={e.parentPhone}
              />
            )}
            {shown(config.parentEmail) && (
              <Field
                name="parentEmail"
                defaultValue={v.parentEmail}
                label="E-posta"
                type="email"
                required={config.parentEmail === "Required"}
                autoComplete="email"
                error={e.parentEmail}
              />
            )}
            {familyQuestions.map((q) => (
              <div key={q.id} className={wide(q) ? "sm:col-span-full" : undefined}>
                <Question q={q} name={`q.${q.id}`} value={v[`q.${q.id}`]} error={e[`q.${q.id}`]} />
              </div>
            ))}
            {shown(config.note) && (
              <Field
                name="note"
                defaultValue={v.note}
                label="Not"
                textarea
                rows={3}
                required={config.note === "Required"}
                maxLength={1000}
                hint={packages.length > 0 ? "İlave yetişkin, özel ihtiyaç ya da sormak istedikleriniz." : "Özel ihtiyaç ya da sormak istedikleriniz."}
                error={e.note}
                className="sm:col-span-full"
              />
            )}
          </div>
        </FormRow>
      </div>

      <div className="mt-2 space-y-4 border-t border-line/70 pt-8">
        <FormMessage state={state} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-xl items-start gap-3 text-sm text-bark">
            <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-soft text-xs font-bold text-forest">
              ✓
            </span>
            {programTitle} için ön kayıt ücretsizdir; kesin kayıt ekibimizle görüştükten sonra yapılır.
          </p>
          <button type="submit" disabled={pending} className="btn btn-forest w-full shrink-0 disabled:opacity-60 sm:w-auto sm:px-10">
            {pending ? "Gönderiliyor…" : "Ön kaydı gönder"}
          </button>
        </div>
      </div>
    </form>
  );
}

/** Questions that read better across the whole row. */
const wide = (q: FormQuestion) => q.type === "Textarea" || q.type === "Checkbox" || q.type === "Radio";

/** One horizontal form row: numbered title on the left, fields on the right (stacked on small screens). */
function FormRow({ n, of, id, title, text, children }: { n: number; of: number; id: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="grid gap-5 py-8 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-10 lg:grid-cols-[16rem_1fr]">
      <div className="flex items-start gap-4 md:block">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest font-serif text-lg text-paper md:mb-4"
        >
          {n}
        </span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-moss">
            Adım {n}/{of}
          </p>
          <h3 id={id} className="mt-1 font-serif text-2xl text-forest">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-bark">{text}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
