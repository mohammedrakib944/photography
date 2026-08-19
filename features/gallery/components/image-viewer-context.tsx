"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ViewerImage = {
  _id: string;
  slug: string;
  objectKey: string;
  width: number;
  height: number;
  title?: string;
  description?: string;
  sizeBytes?: number;
  location?: string;
  cameraInfo?: string;
  category?: { name: string; slug: string } | null;
};

export type ViewerState = { images: ViewerImage[]; index: number } | null;

type ViewerContextValue = {
  state: ViewerState;
  open: (images: ViewerImage[], index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
};

const ImageViewerContext = createContext<ViewerContextValue | null>(null);

export function ImageViewerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ViewerState>(null);

  const open = useCallback((images: ViewerImage[], index: number) => {
    setState({ images, index });
  }, []);

  const close = useCallback(() => setState(null), []);

  const next = useCallback(() => {
    setState((s) => (s ? { ...s, index: (s.index + 1) % s.images.length } : s));
  }, []);

  const prev = useCallback(() => {
    setState((s) => (s ? { ...s, index: (s.index - 1 + s.images.length) % s.images.length } : s));
  }, []);

  const value = useMemo(() => ({ state, open, close, next, prev }), [state, open, close, next, prev]);

  return <ImageViewerContext.Provider value={value}>{children}</ImageViewerContext.Provider>;
}

export function useImageViewer() {
  const ctx = useContext(ImageViewerContext);
  if (!ctx) throw new Error("useImageViewer must be used within an ImageViewerProvider");
  return ctx;
}
