export function SeatsNote({ remaining }: { remaining: number }) {
  if (remaining === 0) return <p className="text-sm font-bold text-[#9b3a26]">Kontenjan doldu</p>;
  if (remaining <= 3) return <p className="text-sm font-bold text-ochre-deep">Son {remaining} yer</p>;
  return <p className="text-sm text-bark">{remaining} kişilik yer var</p>;
}
