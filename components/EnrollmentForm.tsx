"use client";

import { useActionState } from "react";
import { submitEnrollment } from "@/lib/actions";
import { Field, FormMessage, Honeypot, initialFormState } from "./FormParts";

export function EnrollmentForm({ programId, programTitle, full }: { programId: string; programTitle: string; full: boolean }) {
  const [state, action, pending] = useActionState(submitEnrollment, initialFormState);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <input type="hidden" name="programId" value={programId} />
      <Honeypot />
      {full && (
        <p className="rounded-xl bg-sand px-4 py-3 text-[0.95rem] text-bark">
          Bu programın kontenjanı dolu. Formu doldurursanız yer açıldığında sizi arayalım.
        </p>
      )}
      <fieldset className="space-y-4">
        <legend className="mb-2 font-serif text-xl text-forest">Çocuğunuz</legend>
        <Field name="childName" defaultValue={v.childName} label="Adı soyadı" required autoComplete="off" error={e.childName} />
        <Field name="childBirthDate" defaultValue={v.childBirthDate} label="Doğum tarihi" type="date" required error={e.childBirthDate} />
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-2 font-serif text-xl text-forest">Veli bilgileri</legend>
        <Field name="parentName" defaultValue={v.parentName} label="Adınız soyadınız" required autoComplete="name" error={e.parentName} />
        <Field name="parentPhone" defaultValue={v.parentPhone} label="Telefon" type="tel" required autoComplete="tel" placeholder="05xx xxx xx xx" error={e.parentPhone} />
        <Field name="parentEmail" defaultValue={v.parentEmail} label="E-posta" type="email" required autoComplete="email" error={e.parentEmail} />
        <Field name="note" defaultValue={v.note} label="Not" textarea maxLength={1000} hint="Alerji, özel ihtiyaç ya da sormak istedikleriniz." error={e.note} />
      </fieldset>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn btn-forest w-full disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Ön kaydı gönder"}
      </button>
      <p className="text-sm text-bark">
        {programTitle} için ön kayıt ücretsizdir; kesin kayıt ekibimizle görüştükten sonra yapılır.
      </p>
    </form>
  );
}
