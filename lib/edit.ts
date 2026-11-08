/**
 * Visual editor hooks (docs/VISUAL_EDITOR.md §3). In the preview, blocks spread these attributes on
 * the elements that show a field so the PreviewBridge can edit them inline (plain text) or ask the
 * panel to focus the field (markdown). On the live site every helper returns `{}` — no extra markup.
 */

export type EditAttrs = { [attr: `data-${string}`]: string };

export interface BlockEdit {
  /** Single-line plain text field (`text`); path e.g. `title` or `items.2.title`. */
  text(path: string): EditAttrs;
  /** Multi-line plain text field (`textarea`); Shift+Enter inserts a line break. */
  textarea(path: string): EditAttrs;
  /** Markdown field: double-click focuses it in the panel. */
  markdown(path: string): EditAttrs;
}

const NONE: EditAttrs = {};

export const NO_EDIT: BlockEdit = { text: () => NONE, textarea: () => NONE, markdown: () => NONE };

export function blockEdit(blockId: string): BlockEdit {
  return {
    text: (path) => ({ "data-edit-block": blockId, "data-edit-path": path }),
    textarea: (path) => ({ "data-edit-block": blockId, "data-edit-path": path, "data-edit-multiline": "" }),
    markdown: (path) => ({ "data-focus-block": blockId, "data-focus-path": path }),
  };
}
