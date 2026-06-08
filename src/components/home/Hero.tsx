"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const titleLines = ["Букеты,", "которые", "говорят за вас"];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      {/* Мягкий анимированный градиентный фон */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 animate-gradient-pan bg-[length:200%_200%]"
        style={{
          backgroundImage:
            "radial-gradient(60% 60% at 20% 20%, rgba(224,138,160,0.16), transparent), radial-gradient(50% 50% at 85% 30%, rgba(31,110,94,0.12), transparent), radial-gradient(50% 60% at 60% 90%, rgba(201,168,106,0.12), transparent)",
        }}
      />

      {/* Парящие лепестки */}
      {!reduce && <Petals />}

      <div className="container-px grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:py-32">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-5"
          >
            Цветочная мастерская · Мозырь
          </motion.p>

          <h1 className="font-serif text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            {titleLines.map((line, li) => (
              <span key={li} className="block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + li * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {li === 2 ? (
                    <>
                      говорят <span className="text-accent">за вас</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg"
          >
            Авторские букеты, розы, пионы и нежные композиции в коробках.
            Соберём и доставим красоту по Мозырю в тот же день.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог
              <ArrowRight size={18} />
            </Link>
            <Link href="/contacts" className="btn-outline">
              Связаться с нами
            </Link>
          </motion.div>
        </div>

        {/* Hero-изображение */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[4/5] w-full max-w-md"
        >
          <div className="absolute inset-0 rotate-3 rounded-[2.5rem] bg-accent/15" />
          <div
            className="absolute inset-0 overflow-hidden rounded-[2.5rem] bg-cover bg-center shadow-card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Petals() {
  const petals = [
    { left: "8%", delay: 0, dur: 11, size: 16 },
    { left: "26%", delay: 2.5, dur: 13, size: 11 },
    { left: "48%", delay: 1.2, dur: 10, size: 14 },
    { left: "68%", delay: 3.5, dur: 14, size: 12 },
    { left: "85%", delay: 0.8, dur: 12, size: 18 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-8 rounded-full bg-accent/30"
          style={{ left: p.left, width: p.size, height: p.size }}
          animate={{ y: ["-2rem", "110vh"], x: [0, 24, -16, 0], rotate: [0, 180, 360] }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
