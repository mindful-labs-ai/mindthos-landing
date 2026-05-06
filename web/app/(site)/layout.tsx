import { PromoBanner } from '@/components/layout/PromoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PromoBanner />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
