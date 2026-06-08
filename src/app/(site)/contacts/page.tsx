import type { Metadata } from "next";
import { Instagram, Send, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты цветочной мастерской kolibri_flowers в Мозыре: телефон, Instagram, Telegram, адрес и часы работы. Доставка цветов по Мозырю.",
};

export default async function ContactsPage() {
  const settings = await getSettings();
  const phoneHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  const contactItems = [
    {
      icon: Phone,
      label: "Телефон",
      value: settings.phone,
      href: phoneHref,
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@_kolibri_flowers_",
      href: settings.instagram_url,
      external: true,
    },
    {
      icon: Send,
      label: "Telegram",
      value: "Написать в Telegram",
      href: settings.telegram_url,
      external: true,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Написать в WhatsApp",
      href: settings.whatsapp_url,
      external: true,
    },
    {
      icon: MapPin,
      label: "Адрес",
      value: settings.address,
    },
    {
      icon: Clock,
      label: "Часы работы",
      value: settings.working_hours,
    },
  ];

  const mapQuery = encodeURIComponent(settings.address);

  return (
    <div className="container-px py-16 md:py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Свяжитесь с нами</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Контакты</h1>
        <p className="mt-4 text-muted">
          Напишите или позвоните — поможем выбрать букет, расскажем о наличии
          и оформим доставку по Мозырю.
        </p>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-2">
        <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contactItems.map((item) => {
            const content = (
              <div className="flex h-full items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft transition-shadow hover:shadow-card">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent-2">
                  <item.icon size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-ink">{item.value}</p>
                </div>
              </div>
            );

            return (
              <StaggerItem key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="block h-full"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <Reveal delay={0.1}>
          <div className="h-full min-h-[320px] overflow-hidden rounded-3xl shadow-soft">
            <iframe
              title="Карта — Мозырь"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
