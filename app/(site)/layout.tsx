import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ImageViewerProvider } from "@/components/gallery/image-viewer-context";
import { ImageViewerModal } from "@/components/gallery/image-viewer-modal";

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
