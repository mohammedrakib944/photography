import { SiteNav, SiteFooter } from "@/features/site-chrome";
import { ImageViewerProvider, ImageViewerModal } from "@/features/gallery";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageViewerProvider>
      <SiteNav />
      {children}
      <SiteFooter />
      <ImageViewerModal />
    </ImageViewerProvider>
  );
}
