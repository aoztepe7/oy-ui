"use client";

import { useActionState } from "react";
import { submitContact } from "@/lib/actions";
import { Field, FormMessage, Honeypot, initialFormState } from "./FormParts";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialFormState);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      <Field name="name" defaultValue={v.name} label="Adınız soyadınız" required autoComplete="name" error={e.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" defaultValue={v.email} label="E-posta" type="email" required autoComplete="email" error={e.email} />
        <Field name="phone" defaultValue={v.phone} label="Telefon" type="tel" autoComplete="tel" error={e.phone} />
      </div>
      <Field name="message" defaultValue={v.message} label="Mesajınız" textarea required rows={6} maxLength={2000} error={e.message} />
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn btn-forest disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>
    </form>
  );
}
