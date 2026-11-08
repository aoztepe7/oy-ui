import Link from "next/link";
import { Contours } from "@/components/Contours";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <Contours className="pointer-events-none absolute inset-0 h-full w-full text-sage" seed={3} />
      <div className="container-page relative flex min-h-[60vh] flex-col items-start justify-center py-24">
        <p className="font-serif text-7xl text-moss">404</p>
        <h1 className="mt-4 text-4xl text-forest md:text-5xl">Bu patika bir yere çıkmıyor</h1>
        <p className="mt-4 max-w-lg text-lg text-bark">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-forest">
            Ana sayfaya dön
          </Link>
          <Link href="/programlar" className="btn btn-ghost text-forest">
            Programlara bak
          </Link>
        </div>
      </div>
    </section>
  );
}
