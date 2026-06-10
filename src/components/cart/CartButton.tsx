"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export function CartButton() {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Корзина${count ? `, товаров: ${count}` : ""}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent/10 hover:text-accent"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
