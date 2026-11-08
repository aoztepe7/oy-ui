/** Embeddable content resolved from a CMS URL. Only known, privacy-friendly providers are allowed. */
export type Embed = { kind: "video" | "map"; src: string };

function parse(url: string): URL | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed : null;
  } catch {
    return null;
  }
}

const YOUTUBE_ID = /^[\w-]{11}$/;

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, first, second] = url.pathname.split("/");
    id = first === "watch" ? url.searchParams.get("v") : ["embed", "shorts", "live"].includes(first) ? second : null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  return url.pathname.match(/\/(\d+)(?:\/|$)/)?.[1] ?? null;
}

/** Google Maps "Embed a map" src (https://www.google.com/maps/embed?pb=…). */
export function mapEmbedSrc(raw: string): string | null {
  const url = parse(raw);
  if (!url) return null;
  const host = url.hostname.replace(/^www\./, "");
  const isGoogle = (host === "google.com" || host === "maps.google.com") && url.pathname.startsWith("/maps/embed");
  return isGoogle ? `https://${url.host}${url.pathname}${url.search}` : null;
}

/** YouTube (via youtube-nocookie), Vimeo (do-not-track) or Google Maps embed; null for anything else. */
export function resolveEmbed(raw: string): Embed | null {
  const url = parse(raw);
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) return { kind: "video", src: `https://www.youtube-nocookie.com/embed/${yt}` };
  const vimeo = vimeoId(url);
  if (vimeo) return { kind: "video", src: `https://player.vimeo.com/video/${vimeo}?dnt=1` };
  const map = mapEmbedSrc(raw);
  return map ? { kind: "map", src: map } : null;
}
