"use client";

import { useActionState, useEffect } from "react";
import { registrationOpened, submitRegistration } from "@/lib/actions";
import type { FormQuestion } from "@/lib/types";
import { QuestionGroup } from "./FormQuestions";
import { FormMessage, Honeypot, initialFormState } from "./FormParts";

/**
 * Registration form ("esas kayıt formu") of one child, from the parent's personal link.
 * Questions and rules come from the panel; the API checks every answer again.
 */
export function RegistrationForm({
  token,
  childName,
  questions,
  values,
}: {
  token: string;
  childName: string;
  questions: FormQuestion[];
  /** Earlier answers by question id (a link renewed for corrections). */
  values: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(submitRegistration, initialFormState);

  // Opening the page in a browser marks the link "opened" in the panel.
  useEffect(() => {
    registrationOpened(token).catch(() => undefined);
  }, [token]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-sage-soft px-6 py-8 text-center">
        <p className="font-serif text-3xl text-forest">Teşekkürler!</p>
        <p className="mt-2 text-bark">{childName} için kayıt formunuz bize ulaştı. Ekibimiz bilgileri inceleyip gerekirse sizinle iletişime geçecek.</p>
      </div>
    );
  }

  const initial = state.values ?? Object.fromEntries(Object.entries(values).map(([id, v]) => [`q.${id}`, v]));

  return (
    <form action={action} className="relative" noValidate>
      <input type="hidden" name="token" value={token} />
      <Honeypot />
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
        <QuestionGroup questions={questions} name={(q) => `q.${q.id}`} initial={initial} errors={state.errors ?? {}} />
      </div>
      <div className="mt-10 space-y-4 border-t border-line/70 pt-8">
        <FormMessage state={state} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-bark">Bilgileriniz yalnızca kayıt ve çocuğunuzun güvenliği için kullanılır.</p>
          <button type="submit" disabled={pending} className="btn btn-forest w-full shrink-0 disabled:opacity-60 sm:w-auto sm:px-10">
            {pending ? "Gönderiliyor…" : "Formu gönder"}
          </button>
        </div>
      </div>
    </form>
  );
}
