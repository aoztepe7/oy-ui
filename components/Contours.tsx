/**
 * Topographic contour lines — the site's signature texture (a map of the forest).
 * Deterministic, rendered on the server as inline SVG; colour comes from `currentColor`.
 */
function ring(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const steps = 96;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wobble = 1 + 0.07 * Math.sin(3 * t + seed) + 0.045 * Math.sin(5 * t + seed * 1.7) + 0.02 * Math.sin(9 * t + seed * 0.6);
    const x = cx + Math.cos(t) * rx * wobble;
    const y = cy + Math.sin(t) * ry * wobble;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

export function Contours({
  className,
  rings = 9,
  cx = 600,
  cy = 300,
  seed = 1,
}: {
  className?: string;
  rings?: number;
  cx?: number;
  cy?: number;
  seed?: number;
}) {
  const paths = Array.from({ length: rings }, (_, i) => {
    const scale = (i + 1) / rings;
    return ring(cx, cy, 80 + 560 * scale, 50 + 300 * scale, seed + i * 0.35);
  });
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} strokeOpacity={i % 4 === 3 ? 1 : 0.55} />
      ))}
    </svg>
  );
}
