/**
 * layerHoverBridge.ts
 *
 * Bidirectional hover bridge between the custom Layer panel and Puck's canvas.
 *
 * Direction 1 — Layer → Canvas:
 *   When the user hovers a layer item, we find the matching
 *   [data-puck-component] element in the preview iframe and dispatch
 *   synthetic mouseover/mouseout events. This triggers Puck's native
 *   overlay system (blue outline on the canvas).
 *
 * Direction 2 — Canvas → Layer:
 *   We attach event-delegation listeners on the preview iframe's document.
 *   On mouseover of a [data-puck-component] element, we store the ID and
 *   notify subscribers. Layer nodes subscribe via `useSyncExternalStore`
 *   so only the matching node re-renders.
 *
 * All APIs are standard DOM — no internal Puck imports, works everywhere.
 */

import { useSyncExternalStore } from "react";

// ─── Direction 1: Layer → Canvas ──────────────────────────────────────

let lastHoveredEl: Element | null = null;

/** Locate the preview iframe's document. */
const getPreviewDoc = (): Document | null => {
  const iframe = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement | null;
  if (iframe?.tagName === "IFRAME") {
    return iframe.contentDocument;
  }
  // Non-iframe fallback
  const div = document.querySelector("[data-puck-entry]") as HTMLElement | null;
  return div?.ownerDocument ?? null;
};

/**
 * Highlight a component on the canvas by dispatching native mouse events.
 * Pass `null` to clear.
 */
export const setLayerHover = (componentId: string | null): void => {
  if (!componentId) {
    if (lastHoveredEl) {
      lastHoveredEl.dispatchEvent(
        new MouseEvent("mouseout", { bubbles: true, cancelable: true })
      );
      lastHoveredEl = null;
    }
    return;
  }

  const doc = getPreviewDoc();
  if (!doc) return;

  const el = doc.querySelector(
    `[data-puck-component="${componentId}"]`
  );
  if (!el) return;

  // Clear previous if different
  if (lastHoveredEl && lastHoveredEl !== el) {
    lastHoveredEl.dispatchEvent(
      new MouseEvent("mouseout", { bubbles: true, cancelable: true })
    );
  }

  el.dispatchEvent(
    new MouseEvent("mouseover", { bubbles: true, cancelable: true })
  );
  lastHoveredEl = el;
};

// ─── Direction 2: Canvas → Layer (external store) ─────────────────────

/** Current component ID hovered on the canvas. */
let canvasHoveredId: string | null = null;

/** Subscriber callbacks — called when canvasHoveredId changes. */
const listeners = new Set<() => void>();

/** Notify all subscribers. */
const emitChange = (): void => {
  for (const fn of listeners) fn();
};

/** Subscribe to canvas-hover changes (used by useSyncExternalStore). */
const subscribe = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Snapshot accessor (used by useSyncExternalStore). */
const getSnapshot = (): string | null => canvasHoveredId;

/**
 * React hook — returns `true` when the given component ID is
 * hovered on the canvas. Only re-renders when the match changes.
 */
export const useCanvasHover = (componentId: string): boolean => {
  const hoveredId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return hoveredId === componentId;
};

// ─── Iframe listener setup ────────────────────────────────────────────

/**
 * Walk up from `target` to find the nearest [data-puck-component].
 *
 * NOTE: We avoid `instanceof HTMLElement` because elements from an iframe
 * are instances of the IFRAME's HTMLElement class, not the parent frame's.
 * Using `nodeType === 1` (ELEMENT_NODE) is cross-frame safe.
 */
const closestComponent = (target: EventTarget | null): string | null => {
  if (!target || (target as Node).nodeType !== 1) return null;
  const el = target as Element;
  const found = el.closest("[data-puck-component]");
  return found?.getAttribute("data-puck-component") ?? null;
};

let attachedDoc: Document | null = null;

/** Detach listeners from the current iframe doc. */
const detachIframeListeners = (): void => {
  if (!attachedDoc) return;
  attachedDoc.removeEventListener("mouseover", handleIframeMouseOver, true);
  attachedDoc.removeEventListener("mouseout", handleIframeMouseOut, true);
  attachedDoc = null;
};

function handleIframeMouseOver(e: Event): void {
  const id = closestComponent(e.target);
  if (id && id !== canvasHoveredId) {
    canvasHoveredId = id;
    emitChange();
  }
}

function handleIframeMouseOut(e: Event): void {
  const me = e as MouseEvent;
  const relatedTarget = me.relatedTarget;

  // Mouse left the iframe entirely (relatedTarget is null) → clear
  if (!relatedTarget) {
    if (canvasHoveredId !== null) {
      canvasHoveredId = null;
      emitChange();
    }
    return;
  }

  // Mouse moved to another element — check if it's still inside the same component
  const relatedId = closestComponent(relatedTarget);
  if (relatedId !== canvasHoveredId) {
    canvasHoveredId = relatedId;
    emitChange();
  }
}

/** Attach mouseover/out listeners on the preview iframe document. */
const attachIframeListeners = (doc: Document): void => {
  if (doc === attachedDoc) return;
  detachIframeListeners();

  // Use capture phase so we see events before any stopPropagation calls
  doc.addEventListener("mouseover", handleIframeMouseOver, true);
  doc.addEventListener("mouseout", handleIframeMouseOut, true);
  attachedDoc = doc;
};

/**
 * Call once from the LayerPanel mount to start watching the iframe.
 * Listens for iframe load events and polls briefly on startup.
 * Returns a cleanup function.
 */
export const startCanvasHoverTracking = (): (() => void) => {
  const tryAttach = (): void => {
    const doc = getPreviewDoc();
    if (doc) attachIframeListeners(doc);
  };

  // Initial attach
  tryAttach();

  // Re-attach whenever the iframe reloads (its contentDocument changes)
  const iframe = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement | null;

  let loadHandler: (() => void) | null = null;

  if (iframe?.tagName === "IFRAME") {
    loadHandler = () => {
      // Small delay to let the iframe document settle
      requestAnimationFrame(tryAttach);
    };
    iframe.addEventListener("load", loadHandler);
  }

  // Poll briefly in case the iframe loads before our mount
  const pollId = setInterval(tryAttach, 500);
  const pollTimeout = setTimeout(() => clearInterval(pollId), 5000);

  return () => {
    detachIframeListeners();
    clearInterval(pollId);
    clearTimeout(pollTimeout);
    if (iframe && loadHandler) {
      iframe.removeEventListener("load", loadHandler);
    }
    // Clear hover state on cleanup
    if (canvasHoveredId !== null) {
      canvasHoveredId = null;
      emitChange();
    }
  };
};
