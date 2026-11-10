/** Liveness probe for the container platform / Caddy: GET /health -> 200 { "status": "UP" }. */
export function GET() {
  return Response.json({ status: "UP" }, { headers: { "Cache-Control": "no-store" } });
}
