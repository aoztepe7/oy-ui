import { Children, type ReactNode } from "react";

/** Responsive grid of program cards (children). No hooks, so it renders on the server and inside client filters. */
export function ProgramGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Children.map(children, (child) => (
        <li className="flex">{child}</li>
      ))}
    </ul>
  );
}
