const VARIANT_WIDTHS = [400, 800, 1600];

/**
 * `src` is the original objectKey. Picks the smallest precomputed variant
 * that's >= the requested width (generated alongside the original in
 * app/api/admin/images/route.ts), falling back to the largest if none fit.
 */
export function objectImageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const variantWidth = VARIANT_WIDTHS.find((w) => w >= width) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
  const key = `${src}__w${variantWidth}.webp`;
  return `/api/images/${encodeURIComponent(key)}`;
}
