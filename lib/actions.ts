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
  const successOne = "Ön kaydınız alındı. Ekibimiz en kısa sürede sizi arayacak.";
  if (isBot(form)) return { status: "success", message: successOne };

  // The form is built from the program's definition (panel). Field names:
  //   childName_0 / childBirthDate_0 …  (count in childCount, 1–6)
  //   q.{questionId}                    family-level question
  //   q.{questionId}.{childIndex}       per-child question
  // Which fields are required is decided by the API from the same definition.
  const childCount = Math.min(6, Math.max(1, Number(field(form, "childCount")) || 1));
  const data: Record<string, string> = { childCount: String(childCount) };
  for (const [key, value] of form.entries()) if (typeof value === "string" && key !== "website") data[key] = value.trim();

  const familyAnswers: Record<string, string> = {};
  const childAnswers: Record<string, string>[] = Array.from({ length: childCount }, () => ({}));
  for (const [key, value] of Object.entries(data)) {
    const m = /^q\.([A-Za-z0-9_-]+)(?:\.(\d))?$/.exec(key);
    if (!m) continue;
    if (m[2] === undefined) familyAnswers[m[1]] = value;
    else if (Number(m[2]) < childCount) childAnswers[Number(m[2])][m[1]] = value;
  }
  const children = childAnswers.map((answers, i) => ({
    name: data[`childName_${i}`] ?? "",
    birthDate: data[`childBirthDate_${i}`] || null,
    answers,
  }));

  // Quick checks that hold for every form; the rest comes back from the API.
  const errors: Record<string, string> = {};
  if (!data.programId) errors.programId = "Program seçilmedi.";
  if (data.hasPackages && !data.priceOption) errors.priceOption = "Katılım seçeneğini seçin.";
  children.forEach((c, i) => {
    if (c.name.length < 2) errors[`childName_${i}`] = "Çocuğun adını yazın.";
  });
  if ((data.parentName ?? "").length < 2) errors.parentName = "Adınızı yazın.";
  if (data.parentPhone && !PHONE_RE.test(data.parentPhone)) errors.parentPhone = "Geçerli bir telefon numarası yazın.";
  if (data.parentEmail && !EMAIL_RE.test(data.parentEmail)) errors.parentEmail = "Geçerli bir e-posta adresi yazın.";
  if ((data.note ?? "").length > 1000) errors.note = "Not en fazla 1000 karakter olabilir.";
  if (Object.keys(errors).length) return invalid(errors, data);

  const request = {
    programId: data.programId,
    children,
    parentName: data.parentName ?? "",
    parentPhone: data.parentPhone ?? "",
    parentEmail: data.parentEmail ?? "",
    note: data.note ?? "",
    priceOption: data.priceOption || null,
    answers: familyAnswers,
  };
  const success = childCount > 1 ? `${childCount} çocuk için ön kaydınız alındı. Ekibimiz en kısa sürede sizi arayacak.` : successOne;
  const result = fromResult(await createEnrollment(request), success, data);
  // API error keys → form field names.
  if (result.errors) {
    result.errors = Object.fromEntries(
      Object.entries(result.errors).map(([key, message]) => [
        key
          .replace(/^children\[(\d+)\]\.name$/, "childName_$1")
          .replace(/^children\[(\d+)\]\.birthDate$/, "childBirthDate_$1")
          .replace(/^children\[(\d+)\]\.answers\.(.+)$/, "q.$2.$1")
          .replace(/^answers\.(.+)$/, "q.$1"),
        message,
      ]),
    );
  }
  return result;
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
