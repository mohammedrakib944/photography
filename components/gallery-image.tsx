"use client";

import Image, { type ImageProps } from "next/image";
import { objectImageLoader } from "@/lib/image-loader";

export function GalleryImage(props: Omit<ImageProps, "loader" | "src"> & { src: string }) {
  return <Image loader={objectImageLoader} {...props} />;
}
