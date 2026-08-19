"use client";

import Image, { type ImageProps } from "next/image";
import { objectImageLoader } from "@/lib/image-loader";

/**
 * `draggable` defaults to false — browsers make `<img>` draggable-to-desktop
 * by default, which fights any custom pointer-based pan/zoom (the ghost
 * image and native drag cursor kick in mid-gesture) on every photo in the
 * app that implements its own drag interaction.
 */
export function GalleryImage({
  draggable = false,
  ...props
}: Omit<ImageProps, "loader" | "src"> & { src: string }) {
  return <Image loader={objectImageLoader} draggable={draggable} {...props} />;
}
