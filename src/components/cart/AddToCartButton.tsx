"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types";

interface AddToCartButtonProps {
  product: ProductWithCategory;
  className?: string;
  /** Компактный вид для карточек каталога. */
  compact?: boolean;
}

export function AddToCartButton({
  product,
  className,
  compact,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (!product.is_available) {
    return (
      <div
        className={cn(
          "rounded-2xl bg-ink/5 px-5 py-3 text-center text-sm text-muted",
          className,
        )}
      >
        Нет в наличии
      </div>
    );
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleAdd}
      className={cn(
        compact ? "btn-primary w-full justify-center" : "btn-primary w-full",
        className,
      )}
    >
      {added ? (
        <>
          <Check size={18} />
          Добавлено
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          {compact ? "В корзину" : "Добавить в корзину"}
        </>
      )}
    </motion.button>
  );
}
