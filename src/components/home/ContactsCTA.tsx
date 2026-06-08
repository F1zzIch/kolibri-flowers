import { Instagram, Send, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import type { ShopSettings } from "@/lib/types";

export function ContactsCTA({ settings }: { settings: ShopSettings }) {
  return (
    <section className="container-px py-20">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-accent-2 px-6 py-16 text-center text-white sm:px-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(40% 60% at 80% 20%, white, transparent), radial-gradient(40% 60% at 10% 90%, white, transparent)",
          }}
        />
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Готовы порадовать близких?
          </p>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl text-white sm:text-4xl">
            Напишите нам — соберём идеальный букет
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Ответим на любой вопрос, поможем выбрать и оформим доставку по Мозырю.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={settings.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-white text-accent-2 hover:bg-white/90"
            >
              <Send size={18} />
              Telegram
            </a>
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              <Instagram size={18} />
              Instagram
            </a>
            <a
              href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              <Phone size={18} />
              Позвонить
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
