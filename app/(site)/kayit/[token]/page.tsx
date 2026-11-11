import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getRegistration } from "@/lib/api";

// A parent's personal registration form link (sent from the panel). Always rendered on request, never indexed;
// the token never leaves the page through the Referer header.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kayıt formu",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function RegistrationPage({ params }: PageProps<"/kayit/[token]">) {
  const { token } = await params;
  const registration = await getRegistration(token);
  if (!registration) notFound();
  const { status, childName, programTitle } = registration;
  const open = status === "Sent" || status === "Opened";

  return (
    <section className="py-14 md:py-20">
      <div className="container-page max-w-4xl">
        <div className="rounded-panel bg-paper p-6 shadow-(--shadow-lift) ring-1 ring-line/60 sm:p-10 lg:p-14">
          <div className="mb-10 border-b border-line/70 pb-8">
            <p className="eyebrow mb-3">{programTitle}</p>
            <h1 className="text-[clamp(2rem,4vw,3rem)] text-forest">{childName} · Kayıt formu</h1>
            {open && registration.intro && <p className="mt-4 whitespace-pre-line text-bark">{registration.intro}</p>}
            {open && (
              <p className="mt-3 text-sm text-bark">Bu link {dateFormat.format(new Date(registration.expiresAt))} tarihine kadar geçerlidir.</p>
            )}
          </div>

          {open ? (
            <RegistrationForm token={token} childName={childName} questions={registration.questions} values={registration.values} />
          ) : status === "Submitted" ? (
            <div role="status" className="rounded-2xl bg-sage-soft px-6 py-8">
              <p className="font-serif text-2xl text-forest">Bu form gönderildi</p>
              <p className="mt-2 text-bark">
                {registration.submittedAt ? `${dateFormat.format(new Date(registration.submittedAt))} tarihinde gönderdiğiniz bilgiler bize ulaştı. ` : ""}
                Bir bilgiyi değiştirmek isterseniz lütfen bizimle iletişime geçin.
              </p>
            </div>
          ) : (
            <div role="status" className="rounded-2xl bg-[#f6e2dc] px-6 py-8">
              <p className="font-serif text-2xl text-[#7a2c1c]">Bu linkin süresi doldu</p>
              <p className="mt-2 text-[#7a2c1c]">Size yeni bir link gönderebilmemiz için lütfen bizimle iletişime geçin.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
