import { Fraunces, Inter } from "next/font/google";

// Display font: light weight, wide tracking, used for headings/nav/hero type.
// Spec target is PP Editorial New (Pangram Pangram, paid/no CDN distribution).
// To switch once licensed: drop the woff2 files under /fonts and replace this
// with next/font/local, e.g.
//   import localFont from "next/font/local";
//   export const displayFont = localFont({
//     src: [{ path: "../fonts/PPEditorialNew-Light.woff2", weight: "300" }],
//     variable: "--font-display",
//   });
// Fraunces is the free fallback in the meantime — same light/editorial feel.
export const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});
