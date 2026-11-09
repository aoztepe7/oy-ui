/**
 * Image framing chosen in the panel travels with the image URL:
 *   /media/x.jpg?focus=50,30           → crop around that point (object-position, percent)
 *   /media/x.jpg?focus=50,30&fit=contain → show the whole image, never cropped
 */
export interface ImageFrame {
  src: string;
  x: number;
  y: number;
  fit: "cover" | "contain";
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function readFrame(url: string): ImageFrame {
  const i = url.indexOf("?");
  if (i < 0) return { src: url, x: 50, y: 50, fit: "cover" };
  const params = new URLSearchParams(url.slice(i + 1));
  const [x, y] = (params.get("focus") ?? "50,50").split(",").map(Number);
  params.delete("focus");
  params.delete("fit");
  const rest = params.toString();
  return {
    src: rest ? `${url.slice(0, i)}?${rest}` : url.slice(0, i),
    x: Number.isFinite(x) ? clamp(x) : 50,
    y: Number.isFinite(y) ? clamp(y) : 50,
    fit: new URLSearchParams(url.slice(i + 1)).get("fit") === "contain" ? "contain" : "cover",
  };
}
