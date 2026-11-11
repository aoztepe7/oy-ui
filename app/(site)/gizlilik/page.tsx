import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/api";
import { LegalSection as Section, LegalShell } from "@/components/Legal";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  description: "Okulum Yeryüzü web sitesi ve mobil uygulamasında kişisel verilerin nasıl işlendiği ve haklarınız.",
  alternates: { canonical: "/gizlilik" },
};

/** Privacy policy + KVKK disclosure (aydınlatma metni) for the website and the iOS / Android app. Linked from the stores. */
export default async function PrivacyPage() {
  const site = await getSite();
  const contact = [site.email && `e-posta: ${site.email}`, site.phone && `telefon: ${site.phone}`, site.address && `adres: ${site.address}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <LegalShell eyebrow={`Son güncelleme: ${LEGAL.updatedOn}`} title="Gizlilik Politikası ve KVKK Aydınlatma Metni">
      <p>
        Bu metin, {LEGAL.controller} (&quot;biz&quot;) olarak okulumyeryuzu.com web sitesinde ve Okulum Yeryüzü mobil uygulamasında (iOS ve
        Android) işlediğimiz kişisel verileri, bunları neden ve nasıl işlediğimizi ve 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&quot;KVKK&quot;) kapsamındaki haklarınızı açıklar.
      </p>

      <Section title="1. Veri sorumlusu">
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla {LEGAL.controller} tarafından işlenir.
          {contact && <> İletişim bilgilerimiz: {contact}.</>}
        </p>
        <p>
          Okulum Yeryüzü mobil uygulaması, {LEGAL.controller} adına {LEGAL.publisher} tarafından App Store ve Google Play&apos;de
          yayınlanır ve teknik olarak işletilir. {LEGAL.publisher}, kişisel verileri yalnızca veri sorumlusunun talimatları doğrultusunda
          ve bu metinde belirtilen amaçlarla, veri işleyen sıfatıyla işler.
        </p>
      </Section>

      <Section title="2. Kimlerin verilerini işliyoruz?">
        <ul>
          <li>
            <strong>Veliler:</strong> çocuğunu programlarımıza kaydettiren anne, baba ya da yasal temsilciler.
          </li>
          <li>
            <strong>Çocuklar:</strong> programlarımıza katılan çocuklar. Mobil uygulama çocuklar tarafından kullanılmaz; çocuklara ait
            bilgileri yalnızca velileri ve görevli personelimiz görür.
          </li>
          <li>
            <strong>Personel:</strong> uygulamayı kullanan öğretmen ve çalışanlarımız.
          </li>
          <li>
            <strong>Ziyaretçiler:</strong> web sitesindeki iletişim ve ön kayıt formlarını dolduran kişiler.
          </li>
        </ul>
      </Section>

      <Section title="3. Hangi verileri işliyoruz?">
        <ul>
          <li>
            <strong>Kimlik ve iletişim bilgileri:</strong> ad soyad, telefon, e-posta, çocukla yakınlık derecesi.
          </li>
          <li>
            <strong>Çocuğa ait bilgiler:</strong> ad soyad, doğum tarihi, kayıt formunda verdiğiniz cevaplar, katılım (yoklama) bilgisi ve
            öğretmen gözlem notları.
          </li>
          <li>
            <strong>Sağlık bilgileri (özel nitelikli kişisel veri):</strong> kayıt formunda paylaşmayı seçtiğiniz alerji, ilaç ve sağlık
            durumu bilgileri. Bu bilgiler yalnızca çocuğunuzun güvenliği için ve açık rızanızla işlenir.
          </li>
          <li>
            <strong>Fotoğraflar:</strong> etkinliklerde çekilen fotoğraflar. Bir çocuğun fotoğrafını yalnızca o çocuğun velileri görür;
            fotoğraflar herkese açık bir adreste yayınlanmaz.
          </li>
          <li>
            <strong>Ödeme ve fatura bilgileri:</strong> ödeme tutarları ve tarihleri, fatura için T.C. kimlik numarası ya da vergi numarası,
            fatura adresi. Kart bilgilerinizi saklamayız.
          </li>
          <li>
            <strong>Uygulama ve cihaz bilgileri:</strong> giriş oturumları, cihaz modeli, uygulama sürümü ve bildirim gönderebilmek için
            cihazınızın bildirim anahtarı.
          </li>
          <li>
            <strong>Yazışmalar:</strong> iletişim formu ve uygulama üzerinden bize ilettiğiniz mesajlar.
          </li>
          <li>
            <strong>Personel için ayrıca:</strong> görev, çalışma bilgileri ve uygulamada yaptığı işlemler (yoklama, not, paylaşım).
          </li>
        </ul>
      </Section>

      <Section title="4. Verileri hangi amaçlarla ve hangi hukuki sebeplerle işliyoruz?">
        <ul>
          <li>
            Ön kayıt ve kayıt işlemlerini yürütmek, programlarımızı sunmak, sizinle iletişim kurmak: <em>sözleşmenin kurulması ve ifası</em>{" "}
            (KVKK m.5/2-c).
          </li>
          <li>
            Fatura düzenlemek, muhasebe ve vergi kayıtlarını tutmak: <em>kanuni yükümlülük</em> (KVKK m.5/2-ç).
          </li>
          <li>
            Çocuğunuzun etkinliklerinden fotoğraf ve duyuruları sizinle paylaşmak, ödeme hatırlatmaları ve bildirimler göndermek, hizmet
            kalitesini ve güvenliğini sağlamak: <em>meşru menfaat</em> (KVKK m.5/2-f) ve gerektiğinde <em>açık rızanız</em>.
          </li>
          <li>
            Sağlık bilgilerini çocuğunuzun güvenliği için işlemek: <em>açık rızanız</em> (KVKK m.6).
          </li>
          <li>
            Uygulamaya güvenli giriş sağlamak ve yetkisiz erişimi önlemek: <em>meşru menfaat</em> ve <em>veri güvenliği yükümlülüğü</em>.
          </li>
        </ul>
        <p>Reklam yapmayız, verilerinizi satmayız ve reklam ya da izleme amaçlı çerez veya takip aracı kullanmayız.</p>
      </Section>

      <Section title="5. Verileri kimlerle paylaşıyoruz?">
        <p>Verilerinizi yalnızca aşağıdaki durumlarda ve gerektiği kadar paylaşırız:</p>
        <ul>
          <li>
            <strong>Hizmet sağlayıcılarımız:</strong> sunucu ve dosya barındırma hizmeti, e-Arşiv / e-Fatura entegratörü, uygulama
            bildirimlerinin iletilmesi için Google Firebase Cloud Messaging ve Apple Push Notification hizmeti. Bu sağlayıcılar verileri
            yalnızca bizim adımıza ve talimatlarımızla işler. Bazı sağlayıcıların sunucuları yurt dışında bulunabilir; bu durumda aktarım
            KVKK m.9&apos;daki güvencelere uygun olarak yapılır.
          </li>
          <li>
            <strong>Kamu kurumları:</strong> Gelir İdaresi Başkanlığı gibi kurumlar ve yetkili mercilere, kanunen zorunlu olduğu ölçüde.
          </li>
        </ul>
      </Section>

      <Section title="6. Ne kadar süre saklıyoruz?">
        <ul>
          <li>Kayıt ve çocuk bilgileri: kayıt devam ettiği sürece ve sona ermesinden sonra olası uyuşmazlıklar için makul bir süre.</li>
          <li>Fatura ve muhasebe kayıtları: Vergi Usul Kanunu ve Türk Ticaret Kanunu&apos;nun öngördüğü süreler boyunca (10 yıla kadar).</li>
          <li>Fotoğraflar: eğitim dönemi boyunca; talep etmeniz hâlinde daha önce silinir.</li>
          <li>Uygulama oturumları: son kullanımdan itibaren en fazla 90 gün; çıkış yaptığınızda hemen sona erer.</li>
        </ul>
        <p>Süresi dolan veriler silinir, yok edilir ya da anonim hâle getirilir.</p>
      </Section>

      <Section title="7. Verilerinizi nasıl koruyoruz?">
        <p>
          Bağlantılar şifrelidir (HTTPS). Şifreler geri çevrilemez biçimde saklanır. Çocuk fotoğraflarına yalnızca yetkili kişilere verilen,
          kısa süre geçerli bağlantılarla erişilebilir. Personelimiz yalnızca görevinin gerektirdiği bilgileri görebilir.
        </p>
      </Section>

      <Section title="8. Haklarınız">
        <p>KVKK m.11 uyarınca bize başvurarak:</p>
        <ul>
          <li>kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
          <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK m.7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>düzeltme ve silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
          <li>otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz etme,</li>
          <li>kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>haklarına sahipsiniz. Verdiğiniz açık rızayı dilediğiniz zaman geri alabilirsiniz.</p>
      </Section>

      <Section title="9. Başvuru ve hesap silme">
        <p>
          Haklarınızı kullanmak için bize {site.email ? <a className="link" href={`mailto:${site.email}`}>{site.email}</a> : "iletişim bilgilerimiz"}{" "}
          üzerinden ya da web sitemizdeki iletişim formuyla yazabilirsiniz. Uygulama hesabınızın ve ilgili verilerinizin silinmesini{" "}
          <Link className="link" href="/hesap-silme">
            hesap silme sayfasından
          </Link>{" "}
          talep edebilirsiniz. Başvurunuzu en geç {LEGAL.answerDays} gün içinde ücretsiz olarak sonuçlandırırız.
        </p>
      </Section>

      <Section title="10. Uygulama izinleri">
        <ul>
          <li>
            <strong>Bildirimler:</strong> duyuru, fotoğraf, ödeme hatırlatması gibi bildirimleri göndermek için. İzni telefonunuzun
            ayarlarından istediğiniz zaman kapatabilir, uygulamadaki Bildirimler → Ayarlar bölümünden bildirim türlerini seçebilirsiniz.
          </li>
          <li>
            <strong>Fotoğraflar ve kamera:</strong> yalnızca personelin etkinlik fotoğrafı yüklemesi için ve yalnızca seçtiği fotoğraflara
            erişilir.
          </li>
        </ul>
      </Section>

      <Section title="11. Değişiklikler">
        <p>
          Bu metni gerektiğinde güncelleyebiliriz. Güncel metin her zaman bu sayfada yayınlanır; önemli değişiklikleri uygulama üzerinden de
          duyururuz.
        </p>
      </Section>
    </LegalShell>
  );
}
