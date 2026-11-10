// Built-in placeholder content, used whenever the API is unreachable
// (e.g. during `next build` in Docker). Same shapes as the API contract.
import type {
  Block,
  BlockPropsMap,
  BlockStyle,
  LayoutStyle,
  BlockType,
  NavItem,
  Page,
  PageListItem,
  ProgramDetail,
  SiteSettings,
  Theme,
  TeamMember,
} from "./types";

const lorem =
  "Lorem ipsum dolor sit amet, orman yolunda yürüyen çocuklar doğanın sesini dinler. Consectetur adipiscing elit, toprağa dokunmak, ağaçları tanımak ve birlikte öğrenmek için açık havada buluşuyoruz.";

/** YYYY-MM-DD relative to today, so fallback items always look current. */
function day(offset: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function monthBounds(): [string, string] {
  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return [first.toISOString().slice(0, 10), last.toISOString().slice(0, 10)];
}

function weekBounds(): [string, string] {
  const now = new Date();
  const isoDay = now.getUTCDay() || 7;
  return [day(1 - isoDay), day(7 - isoDay)];
}

const nav: NavItem[] = [
  { label: "Programlar", href: "/programlar" },
  { label: "Kamp ve etkinlikler", href: "/etkinlikler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Ekibimiz", href: "/ekibimiz" },
  { label: "İletişim", href: "/iletisim" },
];

export const fallbackSite: SiteSettings = {
  siteName: "Okulum Yeryüzü",
  tagline: "Çocuklar için doğa okulu",
  footerText: "Okulum Yeryüzü, çocukların doğayla bağ kurduğu, açık havada keşfederek öğrendiği bir doğa okuludur.",
  phone: "+90 555 000 00 00",
  email: "merhaba@okulumyeryuzu.com",
  address: "Belgrad Ormanı girişi, Sarıyer / İstanbul",
  instagramUrl: "https://instagram.com/okulumyeryuzu",
  youtubeUrl: "",
  headerCtaText: "Ön kayıt",
  headerCtaHref: "/programlar",
  headerNav: nav,
  footerNav: nav,
  headerStyle: emptyLayoutStyle(),
  footerStyle: emptyLayoutStyle(),
};

function emptyLayoutStyle(): LayoutStyle {
  return { background: "", textColor: "", accentColor: "", paddingTop: "", paddingBottom: "", width: "" };
}

/** Builds a block with default style; ids only need to be unique within the page. */
function block<T extends BlockType>(
  type: T,
  props: BlockPropsMap[T],
  style: Partial<BlockStyle> = {},
  id: string = type,
): Block {
  const fullStyle: BlockStyle = {
    ...emptyLayoutStyle(),
    headingFont: "",
    bodyFont: "",
    headingSize: "",
    textSize: "",
    align: "",
    radius: "",
    hideOnMobile: false,
    hideOnDesktop: false,
    ...style,
  };
  return { id, type, hidden: false, props: { anchor: "", ...props }, style: fullStyle } as Block;
}

const header = (title: string, intro: string) => block("pageHeader", { eyebrow: "", title, intro, align: "left" });

const programsBlock = (programType: "all" | "events", showFilters: boolean, emptyText: string) =>
  block("programs", {
    title: "",
    intro: "",
    programType,
    limit: 0,
    featuredFirst: false,
    showFilters,
    linkText: "",
    linkHref: "",
    emptyText,
    layout: "grid",
  });

const fallbackPages: Record<string, Omit<Page, "slug" | "path" | "publishedAt">> = {
  home: {
    title: "Ana Sayfa",
    seoTitle: "Okulum Yeryüzü — Çocuklar için orman buluşması",
    seoDescription: "3-10 yaş çocuklar için haftalık orman buluşması grupları, doğa kampları ve aile buluşmaları.",
    blocks: [
      block("hero", {
        eyebrow: "",
        title: "Sınıfımız orman, öğretmenimiz yeryüzü",
        subtitle:
          "3-10 yaş arası çocuklar için haftalık orman buluşması grupları, kamplar ve aile buluşmaları. Her mevsim, her havada dışarıdayız.",
        image: "",
        primaryText: "Programları incele",
        primaryHref: "/programlar",
        secondaryText: "Bizi tanıyın",
        secondaryHref: "/hakkimizda",
        layout: "split",
      }),
      block("imageText", {
        eyebrow: "",
        title: "Doğada büyüyen çocuklar",
        body: `${lorem}\n\nKüçük gruplar, deneyimli eğitmenler ve her hafta yeni bir tema ile çocuklar kendi hızlarında keşfeder.`,
        image: "",
        buttonText: "Hikâyemizi okuyun",
        buttonHref: "/hakkimizda",
        imagePosition: "right",
      }),
      block("features", {
        title: "",
        intro: "",
        columns: "3",
        items: [
          { icon: "leaf", title: "Keşfederek öğrenme", text: "Çocuklar soruyu kendileri sorar, cevabı birlikte doğada ararız." },
          { icon: "tree", title: "Güvenli ve küçük gruplar", text: "En fazla 12 çocuk, her grupta en az iki eğitmen ve ilk yardım eğitimi." },
          { icon: "mountain", title: "Her mevsim dışarıda", text: "Yağmurda, karda, güneşte; uygun kıyafetle her hava öğrenmek için iyi bir havadır." },
        ],
      }, { background: "paper" }),
      block("programs", {
        title: "Yaklaşan programlar",
        intro: "",
        programType: "all",
        limit: 12,
        featuredFirst: true,
        showFilters: false,
        linkText: "Tüm programlar",
        linkHref: "/programlar",
        emptyText: "Yeni programlarımız çok yakında burada olacak.",
        layout: "slider",
      }, { background: "sage" }),
      block("team", {
        title: "Ormanda yanlarında kim var?",
        intro: "Doğa eğitimi, pedagoji ve ilk yardım konusunda deneyimli eğitmenlerimiz her grupta birlikte.",
        limit: 4,
        linkText: "Ekibimizle tanışın",
        linkHref: "/ekibimiz",
        layout: "compact",
      }),
      block("themes", { title: "Ormanda bu dönem", intro: "Her hafta ve her ay bir temanın peşine düşüyoruz.", limit: 2 }),
      block("cta", {
        title: "Çocuğunuz için yer ayırtın",
        text: "Gruplarımız küçük ve kontenjanlar sınırlı. Ön kayıt formunu doldurun, sizi arayalım.",
        buttonText: "Ön kayıt yap",
        buttonHref: "/programlar",
      }, { background: "forest" }),
    ],
  },
  hakkimizda: {
    title: "Hakkımızda",
    seoTitle: "Hakkımızda",
    seoDescription: "Okulum Yeryüzü'nün hikâyesi, misyonu ve vizyonu.",
    blocks: [
      header("Hakkımızda", "Okulum Yeryüzü, çocukların doğayla yeniden bağ kurması için kurulmuş bir açık hava eğitim girişimidir."),
      block("imageText", {
        eyebrow: "",
        title: "Hikâyemiz",
        body: lorem,
        image: "",
        buttonText: "",
        buttonHref: "",
        imagePosition: "right",
      }),
    ],
  },
  ekibimiz: {
    title: "Ekibimiz",
    seoTitle: "Ekibimiz",
    seoDescription: "Okulum Yeryüzü eğitmenleri ve ekibi.",
    blocks: [
      header("Ekibimiz", "Doğa eğitimi, pedagoji ve ilk yardım alanlarında deneyimli eğitmenlerimizle tanışın."),
      block("team", { title: "", intro: "", limit: 0, linkText: "", linkHref: "", layout: "grid" }),
    ],
  },
  programlar: {
    title: "Programlar",
    seoTitle: "Programlar",
    seoDescription: "Orman buluşması grupları, kamplar, etkinlikler ve atölyeler.",
    blocks: [
      header("Programlar", "Haftalık orman buluşması gruplarımız, kamplarımız ve atölyelerimiz. Yaşa ve türe göre filtreleyin."),
      programsBlock("all", true, "Yeni programlarımız çok yakında burada olacak."),
    ],
  },
  etkinlikler: {
    title: "Kamp ve Etkinlikler",
    seoTitle: "Kamp ve Etkinlikler",
    seoDescription: "Doğa kampları, aile buluşmaları ve atölyeler.",
    blocks: [
      header("Kamp ve etkinlikler", "Doğa kampları, aile buluşmaları ve atölyeler: haftalık grupların dışında, herkese açık programlarımız."),
      programsBlock("events", false, "Şu anda planlanmış bir kamp ya da etkinlik yok."),
    ],
  },
  iletisim: {
    title: "İletişim",
    seoTitle: "İletişim",
    seoDescription: "Okulum Yeryüzü ile iletişime geçin.",
    blocks: [
      block("contact", {
        title: "İletişim",
        intro: "Sorularınız için bize yazın ya da arayın. En kısa sürede dönüş yapıyoruz.",
        workingHours: "Hafta içi 09:00 – 18:00",
        mapEmbedUrl: "",
        image: "",
        showForm: true,
      }),
    ],
  },
};

/** Built-in page content, or null for pages only the CMS knows about. */
export function fallbackPage(slug: string): Page | null {
  const page = Object.hasOwn(fallbackPages, slug) ? fallbackPages[slug] : undefined;
  if (!page) return null;
  return { ...page, slug, path: slug === "home" ? "/" : `/${slug}`, publishedAt: null };
}

export function fallbackPageList(): PageListItem[] {
  const updatedAt = new Date().toISOString();
  return Object.keys(fallbackPages).map((slug) => {
    const page = fallbackPage(slug)!;
    return { slug, path: page.path, title: page.title, updatedAt };
  });
}

const description = `${lorem}\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco. Gün, açılış çemberiyle başlar; ardından serbest oyun, temaya bağlı bir keşif etkinliği ve birlikte hazırlanan atıştırmalıkla devam eder.\n\nDuis aute irure dolor in reprehenderit. Çocukların hava durumuna uygun kıyafet, yedek çorap ve su matarası getirmesi yeterlidir.`;

export function fallbackPrograms(): ProgramDetail[] {
  return [
    {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "3-4-yas-orman-bulusmasi",
      title: "3-4 Yaş Orman Buluşması",
      type: "WeeklyClass",
      ageMin: 3,
      ageMax: 4,
      startDate: day(-60),
      endDate: day(240),
      daysOfWeek: [1, 3],
      startTime: "10:00",
      endTime: "13:00",
      capacity: 12,
      enrolledCount: 7,
      price: 6500,
      pricePeriod: "Monthly",
      summary: "Küçükler için oyun temelli, duyularla keşfedilen haftada iki gün orman sabahları.",
      coverImageUrl: "",
      location: "Belgrad Ormanı",
      featuredOrder: null,
      description,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      slug: "5-6-yas-orman-bulusmasi",
      title: "5-6 Yaş Orman Buluşması",
      type: "WeeklyClass",
      ageMin: 5,
      ageMax: 6,
      startDate: day(-60),
      endDate: day(240),
      daysOfWeek: [2, 4],
      startTime: "09:30",
      endTime: "13:30",
      capacity: 12,
      enrolledCount: 10,
      price: 7200,
      pricePeriod: "Monthly",
      summary: "Barınak kurma, iz sürme ve bitki tanıma ile dolu, macera dolu orman günleri.",
      coverImageUrl: "",
      location: "Belgrad Ormanı",
      featuredOrder: null,
      description,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      slug: "aile-bulusmasi",
      title: "Aile Buluşması",
      type: "Event",
      ageMin: 3,
      ageMax: 10,
      startDate: day(14),
      endDate: day(14),
      daysOfWeek: [6],
      startTime: "11:00",
      endTime: "15:00",
      capacity: 30,
      enrolledCount: 12,
      price: 900,
      pricePeriod: "OneTime",
      summary: "Ailecek ormanda bir gün: ateş başında hikâyeler, doğa yürüyüşü ve ortak sofra.",
      coverImageUrl: "",
      location: "Polonezköy",
      featuredOrder: null,
      description,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      slug: "yaz-kampi",
      title: "Yaz Kampı",
      type: "Camp",
      ageMin: 7,
      ageMax: 10,
      startDate: day(45),
      endDate: day(49),
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: "09:00",
      endTime: "16:00",
      capacity: 20,
      enrolledCount: 18,
      price: 9800,
      pricePeriod: "OneTime",
      summary: "Beş gün boyunca hayatta kalma becerileri, pusula ile yön bulma ve dere keşifleri.",
      coverImageUrl: "",
      location: "Kazdağları",
      featuredOrder: null,
      description,
    },
  ];
}

export function fallbackThemes(): Theme[] {
  const [mStart, mEnd] = monthBounds();
  const [wStart, wEnd] = weekBounds();
  return [
    {
      id: "00000000-0000-0000-0000-000000000011",
      kind: "Monthly",
      title: "Ayın teması: Yapraklar ve mevsim döngüsü",
      description:
        "Bu ay yaprakların rengini, şeklini ve toprağa dönüşünü inceliyoruz. Lorem ipsum dolor sit amet.",
      imageUrl: "",
      startDate: mStart,
      endDate: mEnd,
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      kind: "Weekly",
      title: "Haftanın teması: Hayvan izleri",
      description:
        "Çamurdaki ayak izlerini bulup çiziyor, hangi hayvana ait olduklarını tahmin ediyoruz.",
      imageUrl: "",
      startDate: wStart,
      endDate: wEnd,
    },
  ];
}

export function fallbackTeam(): TeamMember[] {
  return [
    {
      id: "00000000-0000-0000-0000-000000000021",
      fullName: "Ayşe Yılmaz",
      title: "Kurucu, Doğa Eğitmeni",
      bio: "On yılı aşkın süredir çocuklarla açık havada çalışıyor. Lorem ipsum dolor sit amet.",
      photoUrl: "",
    },
    {
      id: "00000000-0000-0000-0000-000000000022",
      fullName: "Mehmet Demir",
      title: "Orman Buluşması Öğretmeni",
      bio: "Hayatta kalma becerileri ve iz sürme konusunda uzman. Consectetur adipiscing elit.",
      photoUrl: "",
    },
    {
      id: "00000000-0000-0000-0000-000000000023",
      fullName: "Zeynep Kaya",
      title: "Okul Öncesi Eğitmeni",
      bio: "Oyun temelli öğrenme ve çocuk gelişimi üzerine çalışıyor. Sed do eiusmod tempor.",
      photoUrl: "",
    },
  ];
}
