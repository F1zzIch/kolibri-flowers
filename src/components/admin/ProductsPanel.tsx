"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { api } from "./api";
import { haptic, notify } from "./telegram";
import { formatPrice } from "@/lib/utils";
import type { Category, ProductWithCategory } from "@/lib/types";

interface ProductsPanelProps {
  products: ProductWithCategory[];
  categories: Category[];
  onChanged: () => Promise<void>;
}

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; product: ProductWithCategory };

export function ProductsPanel({
  products,
  categories,
  onChanged,
}: ProductsPanelProps) {
  const [view, setView] = useState<View>({ mode: "list" });

  async function afterSave() {
    await onChanged();
    setView({ mode: "list" });
  }

  if (view.mode !== "list") {
    return (
      <ProductForm
        product={view.mode === "edit" ? view.product : null}
        categories={categories}
        onSaved={afterSave}
        onCancel={() => setView({ mode: "list" })}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setView({ mode: "new" })}
        className="btn-primary w-full"
      >
        <Plus size={18} />
        Добавить букет
      </button>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Пока нет ни одного букета. Добавьте первый 🌸
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductRow
                product={p}
                onEdit={() => setView({ mode: "edit", product: p })}
                onToggle={onChanged}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onEdit,
  onToggle,
}: {
  product: ProductWithCategory;
  onEdit: () => void;
  onToggle: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function patch(p: Record<string, unknown>) {
    setBusy(true);
    try {
      await api.updateProduct(product.id, p);
      haptic("success");
      await onToggle();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3 rounded-2xl bg-surface p-3 shadow-soft">
      <button
        type="button"
        onClick={onEdit}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink/5"
      >
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <button type="button" onClick={onEdit} className="text-left">
          <p className="truncate font-medium text-ink">{product.name}</p>
          <p className="text-sm text-muted">{formatPrice(product.price)}</p>
          <p className="truncate text-xs text-muted">
            {product.category?.name ?? "Без категории"}
          </p>
        </button>

        <div className="mt-auto flex gap-2 pt-2">
          <Chip
            active={product.is_available}
            disabled={busy}
            onClick={() => patch({ is_available: !product.is_available })}
            label={product.is_available ? "В наличии" : "Нет"}
          />
          <Chip
            active={product.is_featured}
            disabled={busy}
            onClick={() => patch({ is_featured: !product.is_featured })}
            label="Хит"
            icon={<Star size={12} />}
          />
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  icon,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "border-accent-2 bg-accent-2/10 text-accent-2"
          : "border-ink/15 text-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
