"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { ProductWithCategory } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group h-full"
    >
      <Link
        href={`/catalog/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-soft transition-shadow duration-300 hover:shadow-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />

          {/* Бейджи */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.is_featured && product.is_available && (
              <span className="badge bg-gold/90 text-white backdrop-blur">Хит</span>
            )}
            {!product.is_available && (
              <span className="badge bg-ink/70 text-white backdrop-blur">
                Нет в наличии
              </span>
            )}
          </div>

          {/* Проявление кнопки при hover */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="btn-primary w-full justify-center shadow-soft">
              Подробнее
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-5">
          {product.category && (
            <span className="text-xs font-medium uppercase tracking-wider text-accent-2">
              {product.category.name}
            </span>
          )}
          <h3 className="font-serif text-lg leading-snug text-ink">
            {product.name}
          </h3>
          <p className="pt-2 text-lg font-semibold text-ink">
            {formatPrice(product.price)}
          </p>
          <div className="mt-auto pt-3">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
