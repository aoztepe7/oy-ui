"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type DragEvent as ReactDragEvent } from "react";

/*
 * Visual editor bridge (docs/VISUAL_EDITOR.md §4). Runs inside the panel's iframe on /onizleme/{token}:
 * outlines and a toolbar for the selected block, inline text editing, palette/grip drag & drop with an
 * insertion line, and the postMessage protocol with the panel. Inert when the page is not embedded.
 */

const CHANNEL = "oy-visual-editor";

type Region = "header" | "footer";
type Target = { blockId: string } | { region: Region };
type BlockAction = "moveUp" | "moveDown" | "duplicate" | "toggleHidden" | "delete";

type Outgoing =
  | { type: "ready" | "rendered"; blockIds: string[] }
  | { type: "select"; blockId: string | null }
  | { type: "select"; region: Region }
  | { type: "hover"; blockId: string | null }
  | { type: "editStart"; blockId: string; path: string }
  | { type: "edit" | "editEnd"; blockId: string; path: string; value: string }
  | { type: "focusField"; blockId: string; path: string }
  | { type: "drop"; index: number }
  | { type: "move"; blockId: string; toIndex: number }
  | { type: "action"; blockId: string; action: BlockAction };

type Incoming =
  | { type: "refresh" }
  | { type: "select"; blockId?: string | null; region?: Region }
  | { type: "dragStart"; blockType: string }
  | { type: "dragEnd" };

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Selection {
  box: Box;
  label: string;
  /** Present for blocks (not header/footer). */
  block?: { id: string; index: number; count: number; hidden: boolean };
}

interface View {
  hover: Box | null;
  selected: Selection | null;
  line: Box | null;
}

const EMPTY_VIEW: View = { hover: null, selected: null, line: null };

const TYPE_LABELS: Record<string, string> = {
  hero: "Kapak",
  pageHeader: "Sayfa başlığı",
  text: "Metin",
  imageText: "Görsel + metin",
  features: "Özellikler",
  programs: "Eğitimler",
  themes: "Güncel temalar",
  team: "Ekip",
  cta: "Çağrı (CTA)",
  gallery: "Galeri",
  faq: "Sıkça sorulan sorular",
  testimonials: "Veli yorumları",
  contact: "İletişim",
  embed: "Video / harita",
};
const REGION_LABELS: Record<Region, string> = { header: "Üst menü", footer: "Alt bilgi" };

// ---- DOM helpers --------------------------------------------------------------------------------

const blockElements = () => Array.from(document.querySelectorAll<HTMLElement>("[data-block-id]"));
const blockIds = () => blockElements().map((el) => el.dataset.blockId!);

function targetOf(node: EventTarget | null): Target | null {
  if (!(node instanceof Element)) return null;
  const block = node.closest<HTMLElement>("[data-block-id]");
  if (block) return { blockId: block.dataset.blockId! };
  const region = node.closest<HTMLElement>("[data-region]")?.dataset.region;
  return region === "header" || region === "footer" ? { region } : null;
}

function elementOf(target: Target | null): HTMLElement | null {
  if (!target) return null;
  const selector = "blockId" in target ? `[data-block-id="${CSS.escape(target.blockId)}"]` : `[data-region="${target.region}"]`;
  return document.querySelector<HTMLElement>(selector);
}

const sameTarget = (a: Target | null, b: Target | null) =>
  a === b || (!!a && !!b && ("blockId" in a ? "blockId" in b && a.blockId === b.blockId : "region" in b && a.region === b.region));

/** Element box in document coordinates (the overlay is absolutely positioned at the document origin). */
function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
}

/** Insert position 0..n from the pointer: before the first block whose vertical midpoint is below it. */
function insertionIndex(clientY: number, blocks: HTMLElement[]): number {
  const i = blocks.findIndex((el) => {
    const r = el.getBoundingClientRect();
    return clientY < r.top + r.height / 2;
  });
  return i === -1 ? blocks.length : i;
}

function lineAt(index: number, blocks: HTMLElement[]): Box | null {
  const main = document.getElementById("icerik");
  if (!main) return null;
  const area = boxOf(main);
  let top: number;
  if (blocks.length === 0) {
    const empty = document.querySelector("[data-empty-page]");
    if (!empty) return null;
    const b = boxOf(empty);
    top = b.top + b.height / 2;
  } else if (index < blocks.length) {
    top = boxOf(blocks[index]).top;
  } else {
    const last = boxOf(blocks[blocks.length - 1]);
    top = last.top + last.height;
  }
  return { top, left: area.left + 12, width: Math.max(0, area.width - 24), height: 4 };
}

/**
 * Text of an element being edited, as the field value: raw text (unlike innerText it ignores CSS
 * text-transform, e.g. uppercase eyebrows), with <br> / inserted block elements as line breaks.
 */
function plainText(el: Node): string {
  let out = "";
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) out += child.nodeValue ?? "";
    else if (child.nodeName === "BR") out += "\n";
    else {
      if ((child.nodeName === "DIV" || child.nodeName === "P") && out && !out.endsWith("\n")) out += "\n";
      out += plainText(child);
    }
  }
  return out;
}

function placeCaret(x: number, y: number) {
  const selection = window.getSelection();
  if (!selection) return;
  let range: Range | null = null;
  if ("caretPositionFromPoint" in document) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
    }
  } else if ("caretRangeFromPoint" in document) {
    range = (document as Document).caretRangeFromPoint(x, y);
  }
  if (range) {
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// ---- Component ----------------------------------------------------------------------------------

interface EditSession {
  el: HTMLElement;
  blockId: string;
  path: string;
  original: string;
  multiline: boolean;
}

export function PreviewBridge({ origins }: { origins: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<View>(EMPTY_VIEW);
  const send = useRef<(message: Outgoing) => void>(() => {});
  /** Set while a grip drag is in progress (block id). */
  const moving = useRef<string | null>(null);
  const awaitingRender = useRef(false);
  const originList = origins.join(",");

  useEffect(() => {
    if (window.parent === window) return; // opened directly: just show the page

    const allowed = originList.split(",").filter(Boolean);
    let panelOrigin: string | null = null;
    let hovered: Target | null = null;
    let selected: Target | null = null;
    let palette: string | null = null; // block type dragged from the panel's palette
    let dropIndex: number | null = null;
    let editing: EditSession | null = null;
    let refreshAfterEdit = false;
    let frame = 0;

    send.current = (message) => {
      // Until the panel has written to us, post to every allowed origin; the browser delivers only the match.
      for (const origin of panelOrigin ? [panelOrigin] : allowed) {
        window.parent.postMessage({ channel: CHANNEL, ...message }, origin);
      }
    };

    // Overlay state is derived from the DOM on the next frame (layout may still be settling).
    const render = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const blocks = blockElements();
        const hoverEl = !editing && dropIndex === null && !sameTarget(hovered, selected) ? elementOf(hovered) : null;
        const selectedEl = elementOf(selected);
        let selection: Selection | null = null;
        if (selectedEl && selected) {
          if ("blockId" in selected) {
            const index = blocks.indexOf(selectedEl);
            selection = {
              box: boxOf(selectedEl),
              label: TYPE_LABELS[selectedEl.dataset.blockType ?? ""] ?? "Blok",
              block: { id: selected.blockId, index, count: blocks.length, hidden: selectedEl.hasAttribute("data-hidden") },
            };
          } else {
            selection = { box: boxOf(selectedEl), label: REGION_LABELS[selected.region] };
          }
        }
        document.querySelector("[data-empty-page]")?.toggleAttribute("data-drop-active", dropIndex !== null);
        setView({
          hover: hoverEl ? boxOf(hoverEl) : null,
          selected: selection,
          line: dropIndex === null ? null : lineAt(dropIndex, blocks),
        });
      });
    };

    const select = (target: Target | null, notify: boolean, scroll = false) => {
      selected = target;
      render();
      if (notify) send.current(target && "region" in target ? { type: "select", region: target.region } : { type: "select", blockId: target?.blockId ?? null });
      const el = elementOf(target);
      if (scroll && el) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: r.height > window.innerHeight * 0.8 ? "start" : "center" });
        }
      }
    };

    // ---- Inline editing ----

    const currentValue = (session: EditSession) => {
      const text = plainText(session.el).replace(/\r/g, "");
      return session.multiline ? text.replace(/\n$/, "") : text.replace(/\s*\n\s*/g, " ");
    };

    const onEditInput = () => {
      if (editing) send.current({ type: "edit", blockId: editing.blockId, path: editing.path, value: currentValue(editing) });
    };

    const onEditKey = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === "Escape") {
        e.preventDefault();
        finishEdit(true);
      } else if (e.key === "Enter" && !(editing.multiline && e.shiftKey)) {
        e.preventDefault();
        editing.el.blur(); // → finishEdit
      } else if (e.key === " " && editing.el.closest("summary")) {
        // A space would toggle the surrounding <details>.
        e.preventDefault();
        document.execCommand("insertText", false, " ");
      }
    };

    const onEditBlur = () => finishEdit(false);

    function finishEdit(cancel: boolean) {
      const session = editing;
      if (!session) return;
      editing = null;
      const { el } = session;
      el.removeEventListener("input", onEditInput);
      el.removeEventListener("keydown", onEditKey);
      el.removeEventListener("blur", onEditBlur);
      if (cancel) el.textContent = session.original;
      const value = cancel ? session.original : currentValue(session);
      el.removeAttribute("contenteditable");
      if (document.activeElement === el) el.blur();
      send.current({ type: "editEnd", blockId: session.blockId, path: session.path, value });
      render();
      if (refreshAfterEdit) {
        refreshAfterEdit = false;
        refresh();
      }
    }

    function startEdit(el: HTMLElement, x: number, y: number) {
      const blockId = el.dataset.editBlock;
      const path = el.dataset.editPath;
      if (!blockId || !path) return;
      editing = { el, blockId, path, original: el.textContent ?? "", multiline: el.hasAttribute("data-edit-multiline") };
      el.setAttribute("contenteditable", "plaintext-only");
      if (el.contentEditable !== "plaintext-only") el.setAttribute("contenteditable", "true"); // older Firefox
      el.addEventListener("input", onEditInput);
      el.addEventListener("keydown", onEditKey);
      el.addEventListener("blur", onEditBlur);
      el.focus({ preventScroll: true });
      placeCaret(x, y);
      send.current({ type: "editStart", blockId, path });
      render();
    }

    // ---- Refresh ----

    function refresh() {
      if (editing) {
        refreshAfterEdit = true;
        return;
      }
      awaitingRender.current = true;
      startTransition(() => router.refresh());
    }

    // ---- Pointer / keyboard / form events (window capture: runs before React and Next's Link) ----

    const inOverlay = (node: EventTarget | null) => node instanceof Element && !!node.closest("[data-oy-overlay]");

    const onClick = (e: MouseEvent) => {
      if (inOverlay(e.target) || !(e.target instanceof Element)) return;
      const node = e.target;
      if (editing?.el.contains(node)) {
        e.preventDefault(); // caret placement only: no link navigation, no <details> toggle
        return;
      }
      if (node.closest("a")) {
        e.preventDefault();
        e.stopPropagation();
      }
      const target = targetOf(node);
      if (target && !sameTarget(target, selected)) select(target, true);
      const editable = node.closest<HTMLElement>("[data-edit-path]");
      if (editable) {
        e.preventDefault();
        e.stopPropagation();
        startEdit(editable, e.clientX, e.clientY);
      }
    };

    const onAuxClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a") && !inOverlay(e.target)) e.preventDefault();
    };

    const onDoubleClick = (e: MouseEvent) => {
      const field = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-focus-path]") : null;
      if (!field?.dataset.focusBlock || !field.dataset.focusPath) return;
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      send.current({ type: "focusField", blockId: field.dataset.focusBlock, path: field.dataset.focusPath });
    };

    const onSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseOver = (e: MouseEvent) => {
      if (inOverlay(e.target)) return;
      const target = targetOf(e.target);
      if (sameTarget(target, hovered)) return;
      const blockChanged = (hovered && "blockId" in hovered ? hovered.blockId : null) !== (target && "blockId" in target ? target.blockId : null);
      hovered = target;
      render();
      if (blockChanged) send.current({ type: "hover", blockId: target && "blockId" in target ? target.blockId : null });
    };

    const onMouseLeave = () => {
      if (!hovered) return;
      hovered = null;
      render();
      send.current({ type: "hover", blockId: null });
    };

    // ---- Drag & drop (palette from the panel, or the toolbar grip) ----

    const isDragging = () => palette !== null || moving.current !== null;

    const onDragOver = (e: DragEvent) => {
      if (!isDragging()) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = moving.current ? "move" : "copy";
      const index = insertionIndex(e.clientY, blockElements());
      // Scroll when dragging near the top/bottom edge.
      if (e.clientY < 48) window.scrollBy(0, -16);
      else if (e.clientY > window.innerHeight - 48) window.scrollBy(0, 16);
      if (index !== dropIndex) {
        dropIndex = index;
        render();
      }
    };

    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null && dropIndex !== null) {
        dropIndex = null; // pointer left the iframe; the drag may come back
        render();
      }
    };

    const endDrag = () => {
      palette = null;
      moving.current = null;
      dropIndex = null;
      render();
    };

    const onDrop = (e: DragEvent) => {
      if (!isDragging()) return;
      e.preventDefault();
      const blocks = blockElements();
      const index = insertionIndex(e.clientY, blocks);
      const blockId = moving.current;
      if (blockId) {
        const from = blocks.findIndex((el) => el.dataset.blockId === blockId);
        const toIndex = index > from ? index - 1 : index;
        if (from !== -1 && toIndex !== from) send.current({ type: "move", blockId, toIndex });
      } else {
        send.current({ type: "drop", index });
      }
      endDrag();
    };

    // ---- Messages from the panel ----

    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent || !allowed.includes(e.origin)) return;
      const data = e.data as (Incoming & { channel?: string }) | null;
      if (!data || typeof data !== "object" || data.channel !== CHANNEL) return;
      panelOrigin = e.origin;
      switch (data.type) {
        case "refresh":
          refresh();
          break;
        case "select":
          select(data.region ? { region: data.region } : data.blockId ? { blockId: data.blockId } : null, false, true);
          break;
        case "dragStart":
          palette = data.blockType || "block";
          break;
        case "dragEnd":
          endDrag();
          break;
      }
    };

    const listeners: [EventTarget, string, EventListener, boolean][] = [
      [window, "message", onMessage as EventListener, false],
      [window, "click", onClick as EventListener, true],
      [window, "auxclick", onAuxClick as EventListener, true],
      [window, "dblclick", onDoubleClick as EventListener, true],
      [window, "submit", onSubmit, true],
      [document, "mouseover", onMouseOver as EventListener, true],
      [document.documentElement, "mouseleave", onMouseLeave, false],
      [document, "dragenter", onDragOver as EventListener, false],
      [document, "dragover", onDragOver as EventListener, false],
      [document, "dragleave", onDragLeave as EventListener, false],
      [document, "drop", onDrop as EventListener, false],
      [document, "dragend", endDrag, false], // grip drag finished or cancelled
      [window, "resize", render, false],
    ];
    for (const [target, type, fn, capture] of listeners) target.addEventListener(type, fn, capture);
    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(document.body);
    document.documentElement.classList.add("oy-editor");
    send.current({ type: "ready", blockIds: blockIds() });

    return () => {
      finishEdit(true);
      cancelAnimationFrame(frame);
      for (const [target, type, fn, capture] of listeners) target.removeEventListener(type, fn, capture);
      resizeObserver.disconnect();
      document.documentElement.classList.remove("oy-editor");
      send.current = () => {};
    };
  }, [originList, router]);

  // After `refresh`: once the new RSC payload is rendered, tell the panel.
  useEffect(() => {
    if (isPending || !awaitingRender.current) return;
    awaitingRender.current = false;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize")); // re-measure the overlay
      send.current({ type: "rendered", blockIds: blockIds() });
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending]);

  const { hover, selected, line } = view;
  const block = selected?.block;
  const action = (name: BlockAction) => block && send.current({ type: "action", blockId: block.id, action: name });

  const onGripStart = (e: ReactDragEvent) => {
    if (!block) return;
    moving.current = block.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", block.id);
  };

  return (
    <div className="oy-overlay" data-oy-overlay="" aria-live="polite">
      {hover && <div className="oy-box" data-kind="hover" style={boxStyle(hover)} />}
      {selected && (
        <>
          <div className="oy-box" data-kind="selected" style={boxStyle(selected.box)} />
          <div
            role="toolbar"
            aria-label={`${selected.label} bloğu`}
            className="oy-toolbar"
            style={{
              top: selected.box.top < 36 ? selected.box.top + 6 : selected.box.top - 34,
              left: Math.max(4, selected.box.left + 6),
            }}
          >
            {block && (
              <button
                type="button"
                draggable
                className="oy-grip"
                aria-label="Sürükleyerek taşı"
                title="Sürükleyerek taşı"
                onDragStart={onGripStart}
              >
                <Icon d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" bold />
              </button>
            )}
            <span className="oy-toolbar-label">
              {selected.label}
              {block?.hidden && <small>gizli</small>}
            </span>
            {block && (
              <>
                <span className="oy-toolbar-sep" aria-hidden="true" />
                <ToolButton label="Yukarı taşı" disabled={block.index <= 0} onClick={() => action("moveUp")} d="M12 19V5M5 12l7-7 7 7" />
                <ToolButton label="Aşağı taşı" disabled={block.index >= block.count - 1} onClick={() => action("moveDown")} d="M12 5v14M19 12l-7 7-7-7" />
                <ToolButton label="Çoğalt" onClick={() => action("duplicate")} d="M8 8h11v11H8zM5 16V5h11" />
                <ToolButton
                  label={block.hidden ? "Göster" : "Gizle"}
                  onClick={() => action("toggleHidden")}
                  d={
                    block.hidden
                      ? "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z"
                      : "M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.9 9.9 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2"
                  }
                />
                <ToolButton label="Sil" danger onClick={() => action("delete")} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </>
            )}
          </div>
        </>
      )}
      {line && (
        <div className="oy-line" style={{ top: line.top, left: line.left, width: line.width }}>
          <span>Buraya bırak</span>
        </div>
      )}
    </div>
  );
}

function boxStyle(box: Box) {
  return { top: box.top, left: box.left, width: box.width, height: Math.max(box.height, 8) };
}

function Icon({ d, bold = false }: { d: string; bold?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={bold ? 3 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function ToolButton({
  label,
  d,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  d: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} data-danger={danger ? "" : undefined} onClick={onClick}>
      <Icon d={d} />
    </button>
  );
}
