"use client";

import { getWebApp } from "./telegram";
import type {
  Category,
  Order,
  OrderStatus,
  ProductWithCategory,
  ShopSettings,
} from "@/lib/types";

// Клиент API Mini App. В каждый запрос подкладываем подписанный initData,
// сервер проверяет подпись и права администратора.

function initDataHeader(): Record<string, string> {
  const initData = getWebApp()?.initData ?? "";
  return { "X-Init-Data": initData };
}

async function jsonFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...initDataHeader(),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Ошибка ${res.status}`);
  return data as T;
}

export const api = {
  listProducts: () =>
    jsonFetch<{ products: ProductWithCategory[] }>("/api/admin/products").then(
      (d) => d.products,
    ),

  createProduct: (body: Record<string, unknown>) =>
    jsonFetch<{ id: string }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProduct: (id: string, patch: Record<string, unknown>) =>
    jsonFetch<{ ok: true }>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteProduct: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/admin/products/${id}`, { method: "DELETE" }),

  listCategories: () =>
    jsonFetch<{ categories: Category[] }>("/api/admin/categories").then(
      (d) => d.categories,
    ),

  createCategory: (name: string) =>
    jsonFetch<{ category: Category }>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then((d) => d.category),

  getSettings: () =>
    jsonFetch<{ settings: ShopSettings }>("/api/admin/settings").then(
      (d) => d.settings,
    ),

  saveSettings: (patch: Partial<ShopSettings>) =>
    jsonFetch<{ ok: true }>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  listOrders: () =>
    jsonFetch<{ orders: Order[] }>("/api/admin/orders").then((d) => d.orders),

  setOrderStatus: (id: string, status: OrderStatus) =>
    jsonFetch<{ ok: true }>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteOrder: (id: string) =>
    jsonFetch<{ ok: true }>(`/api/admin/orders/${id}`, { method: "DELETE" }),

  uploadPhoto: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: initDataHeader(),
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Ошибка загрузки фото");
    return data.url as string;
  },
};
