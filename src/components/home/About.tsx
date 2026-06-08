import { Flower2, Truck, Heart } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";

const features = [
  {
    icon: Flower2,
    title: "Свежие цветы",
    text: "Работаем только со свежими поставками. Каждый букет собираем в день заказа.",
  },
  {
    icon: Truck,
    title: "Доставка в день заказа",
    text: "Доставим букет по Мозырю в удобное время — быстро и бережно.",
  },
  {
    icon: Heart,
    title: "Авторский подход",
    text: "Подберём композицию под повод, настроение и бюджет. С любовью к деталям.",
  },
];

export function About() {
  return (
    <section className="bg-surface/60 py-20">
      <div className="container-px grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div
            className="aspect-[5/4] rounded-3xl bg-cover bg-center shadow-card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=900&q=80)",
            }}
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow mb-3">О мастерской</p>
            <h2 className="font-serif text-3xl sm:text-4xl">
              Колибри — лёгкость, изящество и забота в каждом букете
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Мы — небольшая цветочная мастерская из Мозыря. Начинали в Instagram,
              а теперь собираем здесь весь наш ассортимент. Любим нежные оттенки,
              природную естественность и аккуратные детали.
            </p>
          </Reveal>

          <StaggerGrid className="mt-9 space-y-6">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="flex gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent-2">
                    <f.icon size={22} />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {f.text}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
