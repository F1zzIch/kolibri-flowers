import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  // Структурированные данные локального бизнеса (JSON-LD) для SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: "kolibri_flowers",
    description:
      "Цветочная мастерская: авторские букеты и доставка цветов по Мозырю.",
    url: siteUrl,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Мозырь",
      addressCountry: "BY",
    },
    openingHours: settings.working_hours,
    sameAs: [settings.instagram_url, settings.telegram_url],
    areaServed: "Мозырь",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
