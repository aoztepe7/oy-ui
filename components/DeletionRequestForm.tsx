"use client";

import { useActionState } from "react";
import { submitDeletionRequest } from "@/lib/actions";
import { Field, FormMessage, Honeypot, initialFormState } from "./FormParts";

export function DeletionRequestForm() {
  const [state, action, pending] = useActionState(submitDeletionRequest, initialFormState);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <Honeypot />
      <Field name="name" defaultValue={v.name} label="Adınız soyadınız" required autoComplete="name" error={e.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="email"
          defaultValue={v.email}
          label="Uygulamaya giriş yaptığınız e-posta"
          type="email"
          required
          autoComplete="email"
          error={e.email}
        />
        <Field name="phone" defaultValue={v.phone} label="Telefon" type="tel" autoComplete="tel" error={e.phone} />
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-1.5 font-semibold text-ink">Neyin silinmesini istiyorsunuz?</legend>
        <label className="flex items-start gap-3">
          <input type="radio" name="scope" value="account" defaultChecked={v.scope !== "all"} className="mt-1.5" />
          <span>Yalnızca uygulama hesabım (giriş bilgilerim, cihazlarım, bildirimlerim)</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="radio" name="scope" value="all" defaultChecked={v.scope === "all"} className="mt-1.5" />
          <span>Hesabım ve bana ya da çocuğuma ait tüm kişisel veriler</span>
        </label>
      </fieldset>
      <Field name="note" defaultValue={v.note} label="Eklemek istedikleriniz" textarea rows={4} maxLength={1500} error={e.note} />
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn btn-forest disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Silme talebini gönder"}
      </button>
    </form>
  );
}
