import type { Metadata } from "next";
import {
  Instagram,
  Send,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
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
  const mapQuery = encodeURIComponent(settings.address);

  const details = [
    { icon: Phone, label: "Телефон", value: settings.phone, href: phoneHref },
    { icon: MapPin, label: "Адрес", value: settings.address },
    { icon: Clock, label: "Часы работы", value: settings.working_hours },
  ];

  const messengers = [
    {
      icon: Send,
      label: "Telegram",
      hint: "Ответим быстрее всего",
      href: settings.telegram_url,
    },
    {
      icon: Instagram,
      label: "Instagram",
      hint: "@_kolibri_flowers_",
      href: settings.instagram_url,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      hint: "Написать в WhatsApp",
      href: settings.whatsapp_url,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Мягкий фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 15% 0%, rgba(224,138,160,0.12), transparent), radial-gradient(50% 70% at 90% 10%, rgba(31,110,94,0.10), transparent)",
        }}
      />

      <div className="container-px py-16 md:py-24">
        {/* Заголовок */}
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-4">Контакты</p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Давайте на связи
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Поможем выбрать букет, расскажем о наличии и оформим доставку
            по Мозырю. Пишите в удобный мессенджер или звоните.
          </p>
        </Reveal>

        <div className="grid items-stretch gap-6 lg:grid-cols-5">
          {/* Левая карточка — детали */}
          <Reveal className="lg:col-span-3">
            <div className="flex h-full flex-col rounded-3xl bg-surface p-7 shadow-soft sm:p-9">
              <h2 className="font-serif text-2xl">Цветочная мастерская</h2>
              <p className="mt-2 text-sm text-muted">
                kolibri_flowers · Мозырь, Беларусь
              </p>

              <div className="mt-8 space-y-6">
                {details.map((d) => {
                  const inner = (
                    <div className="group flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
                        <d.icon size={22} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {d.label}
                        </p>
                        <p className="mt-1 text-lg text-ink">{d.value}</p>
                      </div>
                    </div>
                  );
                  return d.href ? (
                    <a key={d.label} href={d.href} className="block">
                      {inner}
                    </a>
                  ) : (
                    <div key={d.label}>{inner}</div>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold/12 px-4 py-2 text-sm text-[#9a7b3f]">
                  🌸 Свежие цветы · Собираем в день заказа
                </span>
              </div>
            </div>
          </Reveal>

          {/* Правый блок — мессенджеры */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-accent-2 p-7 text-white shadow-card sm:p-8">
              <div
                aria-hidden
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "radial-gradient(50% 60% at 90% 10%, white, transparent), radial-gradient(45% 55% at 0% 100%, white, transparent)",
                }}
              />
              <div className="relative flex h-full flex-col">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Напишите нам
                </p>
                <h2 className="mt-2 font-serif text-2xl text-white">
                  Выберите мессенджер
                </h2>

                <StaggerGrid className="mt-6 flex flex-1 flex-col gap-3">
                  {messengers.map((m) => (
                    <StaggerItem key={m.label}>
                      <a
                        href={m.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur transition-colors hover:bg-white/20"
                      >
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <m.icon size={20} />
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium">{m.label}</span>
                          <span className="block text-sm text-white/70">
                            {m.hint}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="text-white/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </a>
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Карта */}
        <Reveal delay={0.15} className="mt-6">
          <div className="relative overflow-hidden rounded-3xl shadow-soft">
            <div className="pointer-events-none absolute left-5 top-5 z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-bg/90 px-4 py-2 text-sm font-medium text-ink shadow-soft backdrop-blur">
                <MapPin size={16} className="text-accent" />
                Мы на карте · Мозырь
              </span>
            </div>
            <iframe
              title="Карта — Мозырь"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
              className="h-[360px] w-full border-0 sm:h-[440px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
