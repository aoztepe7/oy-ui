import type { ReactNode } from "react";

/** Layout of the legal pages (/gizlilik, /hesap-silme). */
export function LegalShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="py-14 md:py-20">
      <div className="container-page max-w-3xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight text-forest">{title}</h1>
        <div className="mt-10 space-y-5 text-lg leading-relaxed text-bark [&_li]:mt-2 [&_strong]:text-forest [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          {children}
        </div>
      </div>
    </section>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 pt-6">
      <h2 className="font-serif text-2xl text-forest">{title}</h2>
      {children}
    </section>
  );
}
