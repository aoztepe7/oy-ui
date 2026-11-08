import { getThemes } from "@/lib/api";
import { todayIso } from "@/lib/format";
import { ThemeList } from "../ThemeList";
import { BlockHeading, Section, type BlockComponentProps } from "./Section";

/** Current themes (this week/month); when none is running, the next upcoming ones. */
export async function ThemesBlock({ props: p, style, primary, edit }: BlockComponentProps<"themes">) {
  const themes = await getThemes();
  const today = todayIso();
  const current = themes.filter((t) => t.startDate <= today && today <= t.endDate);
  const limit = Number(p.limit) || 0;
  const shown = (current.length ? current : themes).slice(0, limit > 0 ? limit : undefined);
  if (shown.length === 0) return null;
  return (
    <Section style={style} anchor={p.anchor}>
      <BlockHeading title={p.title} intro={p.intro} as={primary ? "h1" : "h2"} edit={edit} />
      <ThemeList themes={shown} />
    </Section>
  );
}
