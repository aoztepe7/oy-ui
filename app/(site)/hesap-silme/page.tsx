import type { Metadata } from "next";
import Link from "next/link";
import { DeletionRequestForm } from "@/components/DeletionRequestForm";
import { LegalSection as Section, LegalShell } from "@/components/Legal";
import { getSite } from "@/lib/api";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Hesap ve veri silme talebi",
  description: "Okulum Yeryüzü uygulama hesabınızın ve kişisel verilerinizin silinmesini talep edin.",
  alternates: { canonical: "/hesap-silme" },
};

/** Account / data deletion request: the URL given to Google Play ("Delete account URL") and Apple. */
export default async function DeletionPage() {
  const site = await getSite();
  return (
    <LegalShell eyebrow="Okulum Yeryüzü uygulaması" title="Hesap ve veri silme talebi">
      <p>
        Okulum Yeryüzü uygulamasındaki hesabınızın ve size ya da çocuğunuza ait kişisel verilerin silinmesini bu sayfadan
        isteyebilirsiniz. Uygulamayı telefonunuzdan kaldırmak hesabınızı silmez.
      </p>

      <Section title="Nasıl işler?">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Aşağıdaki formu, uygulamaya giriş yaptığınız e-posta adresiyle doldurun.</li>
          <li>Talebin size ait olduğunu doğrulamak için kayıtlı telefonunuzdan ya da e-postanızdan size ulaşırız.</li>
          <li>
            Doğrulamadan sonra en geç {LEGAL.answerDays} gün içinde silme işlemini yapar ve size bilgi veririz. Hesabınız silindiğinde tüm
            cihazlarınızda oturumunuz kapanır.
          </li>
        </ol>
      </Section>

      <Section title="Neler silinir?">
        <ul>
          <li>Uygulama hesabınız: giriş bilgileriniz, oturum açtığınız cihazlar, bildirimleriniz ve bildirim ayarlarınız.</li>
          <li>
            &quot;Tüm verilerim&quot; seçeneğinde ayrıca: sizin ve çocuğunuzun iletişim bilgileri, kayıt formu cevapları (sağlık bilgileri
            dâhil), çocuğunuzun fotoğrafları ve gözlem notları.
          </li>
        </ul>
      </Section>

      <Section title="Neler saklanmaya devam eder?">
        <p>
          Kanunen saklamak zorunda olduğumuz kayıtlar (düzenlenen faturalar ve muhasebe kayıtları gibi) yasal süre boyunca saklanır ve bu
          sürenin sonunda silinir. Bu kayıtlar başka hiçbir amaçla kullanılmaz. Ayrıntılar için{" "}
          <Link className="link" href="/gizlilik">
            Gizlilik Politikası
          </Link>
          &apos;nı inceleyebilirsiniz.
        </p>
      </Section>

      <Section title="Silme talebi formu">
        <div className="rounded-panel bg-paper p-6 shadow-(--shadow-lift) ring-1 ring-line/60 sm:p-8">
          <DeletionRequestForm />
        </div>
        {site.email && (
          <p className="text-base">
            Formu kullanamıyorsanız talebinizi{" "}
            <a className="link" href={`mailto:${site.email}?subject=Hesap%20silme%20talebi`}>
              {site.email}
            </a>{" "}
            adresine de gönderebilirsiniz.
          </p>
        )}
      </Section>
    </LegalShell>
  );
}
