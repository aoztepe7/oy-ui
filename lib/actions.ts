"use server";

import { createEnrollment, markRegistrationOpened, sendContactMessage, submitRegistrationAnswers, type PostResult } from "./api";
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

/**
 * Form fields as strings. A name sent several times (ticked options of a multiple-choice question) becomes one value,
 * one option per line. The visual radio groups of choice questions (`…__choice`) are not answers.
 */
function formValues(form: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  for (const key of new Set(form.keys())) {
    if (key === "website" || key.endsWith("__choice") || key.startsWith("$ACTION")) continue;
    const values = form.getAll(key).filter((v): v is string => typeof v === "string").map((v) => v.trim());
    data[key] = values.filter((v, i) => v !== "" || i === 0).join("\n");
  }
  return data;
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
    409: "Ön kaydınız şu anda alınamadı. Lütfen bizimle iletişime geçin.",
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
  const data: Record<string, string> = { ...formValues(form), childCount: String(childCount) };

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

/** Registration form ("esas kayıt") from a parent's personal link. Field names: `token`, `q.{questionId}`. */
export async function submitRegistration(_prev: FormState, form: FormData): Promise<FormState> {
  const success = "Kayıt formunuz bize ulaştı. Teşekkür ederiz!";
  if (isBot(form)) return { status: "success", message: success };

  const data = formValues(form);
  const token = data.token ?? "";
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const m = /^q\.([A-Za-z0-9_-]+)$/.exec(key);
    if (m) answers[m[1]] = value;
  }
  const result = await submitRegistrationAnswers(token, answers);
  if (!result.ok && result.status === 409) {
    return { status: "error", message: "Bu form artık doldurulamıyor (daha önce gönderilmiş ya da süresi dolmuş). Lütfen bizimle iletişime geçin.", values: data };
  }
  if (!result.ok && result.status === 404) {
    return { status: "error", message: "Bu link geçersiz. Lütfen size gönderilen linki kontrol edin.", values: data };
  }
  const state = fromResult(result, success, data);
  // API error keys (answers.{id}) → form field names (q.{id}).
  if (state.errors) {
    state.errors = Object.fromEntries(Object.entries(state.errors).map(([key, message]) => [key.replace(/^answers\.(.+)$/, "q.$1"), message]));
  }
  return state;
}

/** Records that the parent opened the form (a link preview never runs this). */
export async function registrationOpened(token: string): Promise<void> {
  if (/^[A-Za-z0-9_-]{32}$/.test(token)) await markRegistrationOpened(token);
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

/**
 * Account deletion request (/hesap-silme, linked from the app stores). Sent as a contact message with a clear subject,
 * so it lands in the panel's Messages and notifies the staff.
 */
export async function submitDeletionRequest(_prev: FormState, form: FormData): Promise<FormState> {
  const success =
    "Talebiniz bize ulaştı. Hesabınızın size ait olduğunu doğruladıktan sonra en geç 30 gün içinde silip size bilgi vereceğiz.";
  if (isBot(form)) return { status: "success", message: success };

  const data = {
    name: field(form, "name"),
    email: field(form, "email"),
    phone: field(form, "phone"),
    scope: field(form, "scope"),
    note: field(form, "note"),
  };

  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = "Adınızı yazın.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Uygulamaya giriş yaptığınız e-posta adresini yazın.";
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = "Geçerli bir telefon numarası yazın.";
  if (data.note.length > 1500) errors.note = "Notunuz en fazla 1500 karakter olabilir.";
  if (Object.keys(errors).length) return invalid(errors, data);

  const scope =
    data.scope === "all"
      ? "Hesabım ve bana / çocuğuma ait tüm kişisel veriler silinsin (yasal saklama zorunluluğu olanlar hariç)."
      : "Yalnızca uygulama hesabım silinsin.";
  const message = [
    "[HESAP SİLME TALEBİ]",
    `Hesap e-postası: ${data.email}`,
    `Kapsam: ${scope}`,
    data.note && `Not: ${data.note}`,
  ]
    .filter(Boolean)
    .join("\n");

  return fromResult(
    await sendContactMessage({ name: data.name, email: data.email, phone: data.phone, message }),
    success,
    data,
  );
}
