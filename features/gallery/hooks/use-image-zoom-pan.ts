"use client";

import { useEffect, useRef, useState } from "react";

const FRICTION_PER_16MS = 0.94; // velocity decay per ~frame during inertia glide
const MIN_INERTIA_SPEED = 0.02; // px/ms — below this, just stop

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Click-to-zoom (toward the clicked point, not just the center) + drag-to-pan
 * with momentum, for a single image. While dragging, the pan is written
 * straight to the DOM (bypassing React state) so the image tracks the cursor
 * with zero render latency — routing every pointermove through setState is
 * what makes a drag feel laggy. Releasing with speed still on the pointer
 * glides the pan a little further with friction, like a native photo viewer,
 * instead of stopping dead the instant the cursor lifts.
 *
 * Resets zoom/pan whenever `resetKey` changes (e.g. the modal switching to a
 * different image).
 */
export function useImageZoomPan(zoomScale: number, resetKey: unknown) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0, t: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const dragBounds = useRef({ maxX: 0, maxY: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const inertiaFrame = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (inertiaFrame.current) cancelAnimationFrame(inertiaFrame.current);
    };
  }, []);

  function stopInertia() {
    if (inertiaFrame.current) {
      cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
  }

  function toggleZoom(clientX?: number, clientY?: number) {
    setZoomed((z) => {
      const next = !z;
      let nextPan = { x: 0, y: 0 };

      if (next && boxRef.current && clientX !== undefined && clientY !== undefined) {
        // Zoom in centered on the clicked point instead of the image center:
        // solving translate + scale*(p - center) + center == p for translate
        // gives translate = (1 - scale) * (p - center).
        const rect = boxRef.current.getBoundingClientRect();
        const maxX = Math.max(0, (rect.width * (zoomScale - 1)) / 2);
        const maxY = Math.max(0, (rect.height * (zoomScale - 1)) / 2);
        const localX = clientX - rect.left - rect.width / 2;
        const localY = clientY - rect.top - rect.height / 2;
        nextPan = {
          x: clamp((1 - zoomScale) * localX, -maxX, maxX),
          y: clamp((1 - zoomScale) * localY, -maxY, maxY),
        };
      }

      panRef.current = nextPan;
      setPan(nextPan);
      return next;
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!zoomed || !boxRef.current) return;
    stopInertia();
    dragging.current = true;
    moved.current = false;
    lastPoint.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    velocity.current = { x: 0, y: 0 };
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

    const now = performance.now();
    const dt = now - lastPoint.current.t;
    if (dt > 0) velocity.current = { x: dx / dt, y: dy / dt };
    lastPoint.current = { x: e.clientX, y: e.clientY, t: now };

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

    const { maxX, maxY } = dragBounds.current;
    let { x: vx, y: vy } = velocity.current;

    if (Math.hypot(vx, vy) <= MIN_INERTIA_SPEED || !boxRef.current) {
      setPan(panRef.current);
      return;
    }

    // Glide the pan a little further with friction, like a native photo
    // viewer — snappier than an abrupt stop the instant the pointer lifts.
    let lastTs: number | null = null;
    const step = (ts: number) => {
      const dt = lastTs === null ? 16.67 : ts - lastTs;
      lastTs = ts;

      const nextX = clamp(panRef.current.x + vx * dt, -maxX, maxX);
      const nextY = clamp(panRef.current.y + vy * dt, -maxY, maxY);
      panRef.current = { x: nextX, y: nextY };
      if (boxRef.current) boxRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;

      const decay = Math.pow(FRICTION_PER_16MS, dt / 16.67);
      vx *= decay;
      vy *= decay;
      if (nextX <= -maxX || nextX >= maxX) vx = 0;
      if (nextY <= -maxY || nextY >= maxY) vy = 0;

      if (Math.hypot(vx, vy) > MIN_INERTIA_SPEED) {
        inertiaFrame.current = requestAnimationFrame(step);
      } else {
        inertiaFrame.current = null;
        setPan(panRef.current);
      }
    };
    inertiaFrame.current = requestAnimationFrame(step);
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
