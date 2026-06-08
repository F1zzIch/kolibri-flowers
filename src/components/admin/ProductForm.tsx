"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { api } from "./api";
import { haptic, notify } from "./telegram";
import { cn } from "@/lib/utils";
import type { Category, ProductWithCategory } from "@/lib/types";

interface ProductFormProps {
  product?: ProductWithCategory | null;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  categories,
  onSaved,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [available, setAvailable] = useState(product?.is_available ?? true);
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await api.uploadPhoto(file);
        setImages((prev) => [...prev, url]);
      }
      haptic("success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка загрузки фото");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      notify("Укажите название букета");
      return;
    }
    if (images.length === 0) {
      notify("Добавьте хотя бы одно фото");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price: Number(price) || 0,
        category_id: categoryId || null,
        description: description.trim(),
        images,
        is_available: available,
        is_featured: featured,
      };
      if (product) await api.updateProduct(product.id, payload);
      else await api.createProduct(payload);
      haptic("success");
      onSaved();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl">
        {product ? "Редактирование букета" : "Новый букет"}
      </h2>

      {/* Фото */}
      <div>
        <Label>Фотографии</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl bg-ink/5"
            >
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-gold/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Главное
                </span>
              )}
              <button
                type="button"
                onClick={() => setImages((p) => p.filter((u) => u !== url))}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white"
                aria-label="Удалить фото"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/20 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {uploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                <Plus size={22} />
                <span className="text-xs">Фото</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <Field label="Название">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Нежное облако"
          className="input"
        />
      </Field>

      <Field label="Цена, BYN">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))}
          inputMode="decimal"
          placeholder="150"
          className="input"
        />
      </Field>

      <Field label="Категория">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input"
        >
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Описание">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Состав, повод, особенности…"
          className="input resize-none"
        />
      </Field>

      <div className="flex gap-3">
        <Toggle
          active={available}
          onClick={() => setAvailable((v) => !v)}
          label="В наличии"
        />
        <Toggle
          active={featured}
          onClick={() => setFeatured((v) => !v)}
          label="Хит"
          icon={<Star size={15} />}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="btn-primary flex-1 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          Отмена
        </button>
      </div>

      {product && (
        <DeleteButton
          onConfirmed={onSaved}
          productId={product.id}
        />
      )}
    </div>
  );
}

function DeleteButton({
  productId,
  onConfirmed,
}: {
  productId: string;
  onConfirmed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        const { confirmDialog } = await import("./telegram");
        if (!(await confirmDialog("Удалить этот букет безвозвратно?"))) return;
        setBusy(true);
        try {
          await api.deleteProduct(productId);
          haptic("success");
          onConfirmed();
        } catch (e) {
          notify(e instanceof Error ? e.message : "Не удалось удалить");
        } finally {
          setBusy(false);
        }
      }}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-red-300 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 size={16} />
      Удалить букет
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}

function Toggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-2xl border py-3 text-sm font-medium transition-colors",
        active
          ? "border-accent-2 bg-accent-2/10 text-accent-2"
          : "border-ink/15 text-muted",
      )}
    >
      {icon}
      {label}: {active ? "да" : "нет"}
    </button>
  );
}
