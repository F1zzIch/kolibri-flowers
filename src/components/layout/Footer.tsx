import Link from "next/link";
import { Instagram, Send, Phone, MapPin, Clock } from "lucide-react";
import { Logo } from "./Logo";
import type { ShopSettings } from "@/lib/types";

export function Footer({ settings }: { settings: ShopSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink/5 bg-surface/60">
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Авторские букеты и композиции с любовью. Доставка цветов по Мозырю
            и окрестностям.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg">Навигация</h3>
          <ul className="space-y-2.5 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-accent">
                Главная
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="transition-colors hover:text-accent">
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="transition-colors hover:text-accent">
                Контакты
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg">Контакты</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-accent-2" />
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-accent">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-accent-2" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0 text-accent-2" />
              <span>{settings.working_hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-lg">Мы в соцсетях</h3>
          <div className="flex gap-3">
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <Instagram size={18} />
            </a>
            <a
              href={settings.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-accent-2 hover:bg-accent-2 hover:text-white"
            >
              <Send size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/5">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>© {year} kolibri_flowers. Мозырь, Беларусь.</p>
          <p>Сделано с любовью к цветам 🌸</p>
        </div>
      </div>
    </footer>
  );
}
