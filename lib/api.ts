import type {
  ContactRequest,
  EnrollmentRequest,
  Page,
  PageListItem,
  Preview,
  ProgramDetail,
  PublicRegistration,
  ProgramSummary,
  ProgramType,
  SiteSettings,
  TeamMember,
  Theme,
} from "./types";

const API_URL = (process.env.API_URL || "http://localhost:8080").replace(/\/$/, "");
const REVALIDATE_SECONDS = 3600;
const TIMEOUT_MS = 8000;

/** Thrown for a definitive 404 so callers can tell "missing" from "API down". */
class NotFoundError extends Error {}

/**
 * Published content, cached (ISR) for an hour and refreshed at once when the panel publishes (tags).
 *
 * There is deliberately no placeholder content. When the API is slow or down this throws, and Next keeps serving the
 * last successfully rendered page (a failed regeneration never replaces it) and retries on the next request. Only a
 * page that has never been rendered successfully shows the error page.
 */
async function get<T>(path: string, tags: string[]): Promise<T> {
  const res = await fetch(`${API_URL}/api/public${path}`, {
    headers: { Accept: "application/json" },
    next: { tags, revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

/** Empty values for site settings fields an older API does not send yet (never shown as content). */
const emptyLayoutStyle = { background: "", textColor: "", accentColor: "", paddingTop: "", paddingBottom: "", width: "" };
const siteDefaults: SiteSettings = {
  siteName: "Okulum Yeryüzü",
  tagline: "",
  footerText: "",
  phone: "",
  email: "",
  address: "",
  instagramUrl: "",
  youtubeUrl: "",
  headerCtaText: "",
  headerCtaHref: "",
  headerNav: [],
  footerNav: [],
  headerStyle: emptyLayoutStyle,
  footerStyle: emptyLayoutStyle,
};

/** Published CMS page, or null when it does not exist. Throws when the API is unreachable (see `get`). */
export async function getPage(slug: string): Promise<Page | null> {
  try {
    const page = await get<Page>(`/pages/${encodeURIComponent(slug)}`, [`page:${slug}`]);
    return { ...page, blocks: page.blocks.filter((b) => !b.hidden) };
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

/**
 * Visual editor preview session (never cached). Null when the token is unknown or expired;
 * throws when the API is unreachable so the editor sees an error instead of a stale page.
 */
export async function getPreview(token: string): Promise<Preview | null> {
  const res = await fetch(`${API_URL}/api/public/previews/${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`GET /previews → ${res.status}`);
  const preview = (await res.json()) as Preview;
  return { ...preview, site: { ...siteDefaults, ...preview.site } };
}

/**
 * Registration form behind a parent's personal link (never cached). Null when the link is unknown;
 * throws when the API is unreachable.
 */
export async function getRegistration(token: string): Promise<PublicRegistration | null> {
  const res = await fetch(`${API_URL}/api/public/registrations/${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /registrations → ${res.status}`);
  return (await res.json()) as PublicRegistration;
}

/** Published pages (sitemap, static params). */
export async function getPages(): Promise<PageListItem[]> {
  return get<PageListItem[]>("/pages", ["pages"]);
}

/** Site settings: menus, contact details, social links. */
export async function getSite(): Promise<SiteSettings> {
  return { ...siteDefaults, ...(await get<Partial<SiteSettings>>("/site", ["site"])) };
}

export async function getPrograms(
  filter: { type?: ProgramType; age?: number } = {},
): Promise<ProgramSummary[]> {
  const params = new URLSearchParams();
  if (filter.type) params.set("type", filter.type);
  if (filter.age !== undefined) params.set("age", String(filter.age));
  const query = params.size ? `?${params}` : "";
  return get<ProgramSummary[]>(`/programs${query}`, ["programs"]);
}

/** Returns null when the program does not exist. */
export async function getProgram(slug: string): Promise<ProgramDetail | null> {
  try {
    return await get<ProgramDetail>(`/programs/${encodeURIComponent(slug)}`, ["programs"]);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export async function getThemes(): Promise<Theme[]> {
  return get<Theme[]>("/themes", ["themes"]);
}

export async function getTeam(): Promise<TeamMember[]> {
  return get<TeamMember[]>("/team", ["team"]);
}

export type PostResult =
  | { ok: true }
  | { ok: false; status: number; errors?: Record<string, string[]> };

async function post(path: string, body: unknown): Promise<PostResult> {
  try {
    const res = await fetch(`${API_URL}/api/public${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true };
    let errors: Record<string, string[]> | undefined;
    if (res.status === 400) {
      const problem = (await res.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
      errors = problem?.errors;
    }
    return { ok: false, status: res.status, errors };
  } catch (error) {
    console.warn(`[api] POST ${path} failed: ${error instanceof Error ? error.message : String(error)}`);
    return { ok: false, status: 0 };
  }
}

export const createEnrollment = (data: EnrollmentRequest) => post("/enrollments", data);
export const sendContactMessage = (data: ContactRequest) => post("/contact", data);
export const submitRegistrationAnswers = (token: string, answers: Record<string, string>) =>
  post(`/registrations/${encodeURIComponent(token)}`, { answers });
/** Marks the link opened (called from the browser page, so link previews do not count). */
export const markRegistrationOpened = (token: string) => post(`/registrations/${encodeURIComponent(token)}/opened`, {});
