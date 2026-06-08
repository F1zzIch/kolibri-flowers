import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { About } from "@/components/home/About";
import { ContactsCTA } from "@/components/home/ContactsCTA";
import { getFeaturedProducts, getSettings } from "@/lib/data";

// Всегда свежие данные из Supabase (каталог редактируется через бота/Mini App).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, settings] = await Promise.all([
    getFeaturedProducts(6),
    getSettings(),
  ]);

  return (
    <>
      <Hero />
      <FeaturedSection products={featured} />
      <About />
      <ContactsCTA settings={settings} />
    </>
  );
}
