"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Category, ProductWithCategory } from "@/lib/types";

interface CatalogViewProps {
  products: ProductWithCategory[];
  categories: Category[];
}

const ALL = "all";

export function CatalogView({ products, categories }: CatalogViewProps) {
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const byCat = activeCat === ALL || p.category_id === activeCat;
      const byQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return byCat && byQuery;
    });
  }, [products, activeCat, query]);

  return (
    <div>
      {/* Поиск */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск букета…"
            aria-label="Поиск по каталогу"
            className="w-full rounded-full border border-ink/10 bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Фильтр категорий */}
      <div className="mb-10 flex flex-wrap justify-center gap-2.5">
        <FilterChip
          active={activeCat === ALL}
          onClick={() => setActiveCat(ALL)}
          label="Все"
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            active={activeCat === cat.id}
            onClick={() => setActiveCat(cat.id)}
            label={cat.name}
          />
        ))}
      </div>

      {/* Сетка */}
      {filtered.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <p className="py-20 text-center text-muted">
          По вашему запросу букетов не нашлось. Попробуйте изменить фильтр.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "border-accent bg-accent text-white shadow-soft"
          : "border-ink/10 bg-surface text-ink/70 hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </button>
  );
}
