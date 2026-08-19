"use client";

import { useEffect, useRef, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Click-to-zoom + drag-to-pan for a single image. While dragging, the pan is
 * written straight to the DOM (bypassing React state) so the image tracks
 * the cursor with zero render latency — routing every pointermove through
 * setState is what makes a drag feel laggy. The final position is committed
 * to state once, on release, purely so the resting `transform` in the JSX
 * stays in sync for the next render.
 *
 * Resets zoom/pan whenever `resetKey` changes (e.g. the modal switching to a
 * different image).
 */
export function useImageZoomPan(zoomScale: number, resetKey: unknown) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const dragBounds = useRef({ maxX: 0, maxY: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  // Adjusting state directly during render (rather than in an effect) is the
  // React-documented way to reset state when a dependency changes. `panRef`
  // just mirrors `pan` (a ref can't be written during render, only in event
  // handlers or effects) so it always reflects the latest committed value —
  // including this reset — for the imperative drag handlers below.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  function toggleZoom() {
    setZoomed((z) => {
      const next = !z;
      const nextPan = next ? panRef.current : { x: 0, y: 0 };
      panRef.current = nextPan;
      setPan(nextPan);
      return next;
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!zoomed || !boxRef.current) return;
    dragging.current = true;
    moved.current = false;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    const el = boxRef.current;
    // Measured once up front — reading offsetWidth/Height on every pointermove
    // forces a synchronous layout reflow each frame, which is what made the
    // drag feel like it was lagging behind the cursor.
    dragBounds.current = {
      maxX: Math.max(0, (el.offsetWidth * (zoomScale - 1)) / 2),
      maxY: Math.max(0, (el.offsetHeight * (zoomScale - 1)) / 2),
    };
    el.style.transition = "none";
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !boxRef.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };

    const { maxX, maxY } = dragBounds.current;
    const nextX = clamp(panRef.current.x + dx, -maxX, maxX);
    const nextY = clamp(panRef.current.y + dy, -maxY, maxY);
    panRef.current = { x: nextX, y: nextY };
    boxRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (boxRef.current) boxRef.current.style.transition = "";
    setPan(panRef.current);
  }

  return {
    zoomed,
    pan,
    boxRef,
    dragging,
    moved,
    toggleZoom,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
