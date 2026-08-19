"use client";

import { useRef, useState } from "react";

/**
 * Click-to-zoom + drag-to-pan for a single, always-visible image (no
 * surrounding chrome to measure, unlike the modal's variant). Pan is written
 * straight to the DOM during the drag for 1:1 cursor tracking, and only
 * `onPointerUp`/`onPointerCancel` end the drag — never a plain pointer-leave,
 * which would end the drag the instant the cursor left the (smaller than the
 * zoomed image) box despite the mouse button still being held.
 */
export function useSimpleZoomPan(zoomScale: number) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

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
    boxRef.current.style.transition = "none";
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !boxRef.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
    boxRef.current.style.transform = `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${zoomScale})`;
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
