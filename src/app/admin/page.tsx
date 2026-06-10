"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Flower2, Loader2, Settings, Tags } from "lucide-react";
import { waitForWebApp } from "@/components/admin/telegram";
import { api } from "@/components/admin/api";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { cn } from "@/lib/utils";
import type { Category, ProductWithCategory, ShopSettings } from "@/lib/types";

type Tab = "orders" | "products" | "categories" | "settings";

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState<Tab>("orders");

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  const reload = useCallback(async () => {
    const [p, c, s] = await Promise.all([
      api.listProducts(),
      api.listCategories(),
      api.getSettings(),
    ]);
    setProducts(p);
    setCategories(c);
    setSettings(s);
  }, []);

  useEffect(() => {
    (async () => {
      const wa = await waitForWebApp();
      wa?.ready();
      wa?.expand();
      try {
        await reload();
        setReady(true);
      } catch {
        setDenied(true);
      }
    })();
  }, [reload]);

  if (denied) {
    return (
      <Centered>
        <Flower2 className="mb-4 text-accent" size={40} />
        <h1 className="font-serif text-2xl">Нет доступа</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Откройте это приложение из Telegram-бота{" "}
          <b>@kolibri_flowers_bot</b> — кнопкой «🖥 Открыть приложение».
          Управление доступно только администратору магазина.
        </p>
      </Centered>
    );
  }

  if (!ready) {
    return (
      <Centered>
        <Loader2 className="animate-spin text-accent" size={32} />
        <p className="mt-3 text-sm text-muted">Загрузка…</p>
      </Centered>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg px-4 pb-28 pt-5">
      <header className="mb-5">
        <p className="eyebrow">Панель управления</p>
        <h1 className="font-serif text-2xl">kolibri_flowers</h1>
      </header>

      {tab === "orders" && <OrdersPanel />}
      {tab === "products" && (
        <ProductsPanel
          products={products}
          categories={categories}
          onChanged={reload}
        />
      )}
      {tab === "categories" && (
        <CategoriesPanel categories={categories} onChanged={reload} />
      )}
      {tab === "settings" && settings && (
        <SettingsPanel settings={settings} onChanged={reload} />
      )}

      {/* Нижняя навигация */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg">
          <TabButton
            active={tab === "orders"}
            onClick={() => setTab("orders")}
            icon={<ClipboardList size={20} />}
            label="Заказы"
          />
          <TabButton
            active={tab === "products"}
            onClick={() => setTab("products")}
            icon={<Flower2 size={20} />}
            label="Букеты"
          />
          <TabButton
            active={tab === "categories"}
            onClick={() => setTab("categories")}
            icon={<Tags size={20} />}
            label="Категории"
          />
          <TabButton
            active={tab === "settings"}
            onClick={() => setTab("settings")}
            icon={<Settings size={20} />}
            label="Настройки"
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
        active ? "text-accent" : "text-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}
