import { fallbackPage, fallbackPageList, fallbackPrograms, fallbackSite, fallbackTeam, fallbackThemes } from "./fallback";
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
/** Pages rendered with fallback content retry this soon (e.g. right after a Docker build). */
const FALLBACK_REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 8000;

/** Thrown for a definitive 404 so callers can tell "missing" from "API down". */
class NotFoundError extends Error {}

async function get<T>(path: string, tags: string[]): Promise<T> {
  const url = `${API_URL}/api/public${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { tags, revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      // Next takes the page's revalidate time from the shortest fetch it saw, so this
      // quick probe makes a fallback-rendered page regenerate within a minute instead of an hour.
      await fetch(url, {
        next: { tags, revalidate: FALLBACK_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(1500),
      }).catch(() => undefined);
    }
    throw error;
  }
}

function warn(path: string, error: unknown) {
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(`[api] ${path} unavailable, using fallback (${reason})`);
}

/** Published CMS page, or null when it does not exist. Built-in pages fall back to placeholder blocks when the API is down. */
export async function getPage(slug: string): Promise<Page | null> {
  const path = `/pages/${encodeURIComponent(slug)}`;
  try {
    const page = await get<Page>(path, [`page:${slug}`]);
    return { ...page, blocks: page.blocks.filter((b) => !b.hidden) };
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    warn(path, error);
    return fallbackPage(slug);
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
  return { ...preview, site: { ...fallbackSite, ...preview.site } };
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
  try {
    return await get<PageListItem[]>("/pages", ["pages"]);
  } catch (error) {
    warn("/pages", error);
    return fallbackPageList();
  }
}

/** Site settings: menus, contact details, social links. */
export async function getSite(): Promise<SiteSettings> {
  try {
    return { ...fallbackSite, ...(await get<Partial<SiteSettings>>("/site", ["site"])) };
  } catch (error) {
    warn("/site", error);
    return fallbackSite;
  }
}

export async function getPrograms(
  filter: { type?: ProgramType; age?: number } = {},
): Promise<ProgramSummary[]> {
  const params = new URLSearchParams();
  if (filter.type) params.set("type", filter.type);
  if (filter.age !== undefined) params.set("age", String(filter.age));
  const query = params.size ? `?${params}` : "";
  try {
    return await get<ProgramSummary[]>(`/programs${query}`, ["programs"]);
  } catch (error) {
    warn(`/programs${query}`, error);
    return fallbackPrograms().filter(
      (p) =>
        (!filter.type || p.type === filter.type) &&
        (filter.age === undefined || (p.ageMin <= filter.age && filter.age <= p.ageMax)),
    );
  }
}

/** Returns null when the program does not exist. */
export async function getProgram(slug: string): Promise<ProgramDetail | null> {
  const path = `/programs/${encodeURIComponent(slug)}`;
  try {
    return await get<ProgramDetail>(path, ["programs"]);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    warn(path, error);
    return fallbackPrograms().find((p) => p.slug === slug) ?? null;
  }
}

export async function getThemes(): Promise<Theme[]> {
  try {
    return await get<Theme[]>("/themes", ["themes"]);
  } catch (error) {
    warn("/themes", error);
    return fallbackThemes();
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    return await get<TeamMember[]>("/team", ["team"]);
  } catch (error) {
    warn("/team", error);
    return fallbackTeam();
  }
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
    warn(path, error);
    return { ok: false, status: 0 };
  }
}

export const createEnrollment = (data: EnrollmentRequest) => post("/enrollments", data);
export const sendContactMessage = (data: ContactRequest) => post("/contact", data);
export const submitRegistrationAnswers = (token: string, answers: Record<string, string>) =>
  post(`/registrations/${encodeURIComponent(token)}`, { answers });
/** Marks the link opened (called from the browser page, so link previews do not count). */
export const markRegistrationOpened = (token: string) => post(`/registrations/${encodeURIComponent(token)}/opened`, {});
