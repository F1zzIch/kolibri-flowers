"use client";

import { useState } from "react";
import { Loader2, Plus, Tags } from "lucide-react";
import { api } from "./api";
import { haptic, notify } from "./telegram";
import type { Category } from "@/lib/types";

export function CategoriesPanel({
  categories,
  onChanged,
}: {
  categories: Category[];
  onChanged: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.createCategory(name.trim());
      setName("");
      haptic("success");
      await onChanged();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl">Категории</h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Новая категория"
          className="input"
        />
        <button
          type="button"
          onClick={add}
          disabled={busy || !name.trim()}
          className="btn-primary shrink-0 px-4 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Категорий пока нет.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-soft"
            >
              <Tags size={18} className="text-accent-2" />
              <span className="text-ink">{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
