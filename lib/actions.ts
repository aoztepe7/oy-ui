"use server";

import { createEnrollment, sendContactMessage, type PostResult } from "./api";
import type { FormState } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{8,}$/;

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Honeypot: bots fill the hidden "website" field. Pretend success. */
function isBot(form: FormData): boolean {
  return field(form, "website") !== "";
}

function invalid(errors: Record<string, string>, values: Record<string, string>): FormState {
  return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", errors, values };
}

function fromResult(result: PostResult, success: string, values: Record<string, string>): FormState {
  if (result.ok) return { status: "success", message: success };
  if (result.status === 400 && result.errors) {
    const errors = Object.fromEntries(
      Object.entries(result.errors).map(([key, messages]) => [
        key.charAt(0).toLowerCase() + key.slice(1),
        messages[0] ?? "Geçersiz değer.",
      ]),
    );
    return invalid(errors, values);
  }
  const messages: Record<number, string> = {
    429: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
    409: "Bu programın kontenjanı dolu. Bizimle iletişime geçebilirsiniz.",
  };
  return {
    status: "error",
    message:
      messages[result.status] ??
      "Form şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin ya da bizi telefonla arayın.",
    values,
  };
}

export async function submitEnrollment(_prev: FormState, form: FormData): Promise<FormState> {
  const success = "Ön kaydınız alındı. Ekibimiz en kısa sürede sizi arayacak.";
  if (isBot(form)) return { status: "success", message: success };

  const data = {
    programId: field(form, "programId"),
    childName: field(form, "childName"),
    childBirthDate: field(form, "childBirthDate"),
    parentName: field(form, "parentName"),
    parentPhone: field(form, "parentPhone"),
    parentEmail: field(form, "parentEmail"),
    note: field(form, "note"),
  };

  const errors: Record<string, string> = {};
  if (!data.programId) errors.programId = "Program seçilmedi.";
  if (data.childName.length < 2) errors.childName = "Çocuğun adını yazın.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.childBirthDate) || data.childBirthDate > new Date().toISOString().slice(0, 10)) {
    errors.childBirthDate = "Geçerli bir doğum tarihi seçin.";
  }
  if (data.parentName.length < 2) errors.parentName = "Adınızı yazın.";
  if (!PHONE_RE.test(data.parentPhone)) errors.parentPhone = "Geçerli bir telefon numarası yazın.";
  if (!EMAIL_RE.test(data.parentEmail)) errors.parentEmail = "Geçerli bir e-posta adresi yazın.";
  if (data.note.length > 1000) errors.note = "Not en fazla 1000 karakter olabilir.";
  if (Object.keys(errors).length) return invalid(errors, data);

  return fromResult(await createEnrollment(data), success, data);
}

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  const success = "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.";
  if (isBot(form)) return { status: "success", message: success };

  const data = {
    name: field(form, "name"),
    email: field(form, "email"),
    phone: field(form, "phone"),
    message: field(form, "message"),
  };

  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = "Adınızı yazın.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Geçerli bir e-posta adresi yazın.";
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = "Geçerli bir telefon numarası yazın.";
  if (data.message.length < 10) errors.message = "Mesajınız en az 10 karakter olmalı.";
  if (data.message.length > 2000) errors.message = "Mesajınız en fazla 2000 karakter olabilir.";
  if (Object.keys(errors).length) return invalid(errors, data);

  return fromResult(await sendContactMessage(data), success, data);
}
