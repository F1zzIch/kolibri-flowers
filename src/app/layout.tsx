import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { getSiteUrl } from "@/lib/site";

const serif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "kolibri_flowers — доставка цветов и букетов в Мозыре",
    template: "%s — kolibri_flowers",
  },
  description:
    "Авторские букеты, розы, пионы и композиции в коробках. Доставка цветов по Мозырю. Закажите красивый букет через Instagram или Telegram.",
  keywords: [
    "цветы Мозырь",
    "букеты Мозырь",
    "доставка цветов Мозырь",
    "заказать букет Мозырь",
    "kolibri flowers",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "kolibri_flowers — доставка цветов и букетов в Мозыре",
    description:
      "Авторские букеты, розы, пионы и композиции в коробках. Доставка цветов по Мозырю.",
    siteName: "kolibri_flowers",
  },
  twitter: {
    card: "summary_large_image",
    title: "kolibri_flowers — доставка цветов и букетов в Мозыре",
    description: "Авторские букеты и композиции. Доставка цветов по Мозырю.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
