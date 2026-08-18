"use client";

import { useRef, useState } from "react";
import { GalleryImage } from "@/components/gallery-image";

export function ZoomableImage({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  function toggleZoom() {
    setZoomed((z) => {
      if (z) setPan({ x: 0, y: 0 });
      return !z;
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!zoomed) return;
    dragging.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      className="flex max-h-[75dvh] w-full items-center justify-center overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <GalleryImage
        src={src}
        width={width}
        height={height}
        alt={alt}
        preload
        onClick={() => !dragging.current && toggleZoom()}
        className="select-none"
        style={{
          height: "auto",
          maxHeight: zoomed ? "none" : "75dvh",
          maxWidth: zoomed ? "none" : "100%",
          cursor: zoomed ? "grab" : "zoom-in",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 1.8 : 1})`,
          transition: dragging.current ? "none" : "transform 0.3s ease",
          touchAction: "none",
        }}
      />
    </div>
  );
}
