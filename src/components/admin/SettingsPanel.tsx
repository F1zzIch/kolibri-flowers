"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "./api";
import { haptic, notify } from "./telegram";
import type { ShopSettings } from "@/lib/types";

const FIELDS: { key: keyof ShopSettings; label: string; placeholder: string }[] = [
  { key: "phone", label: "Телефон", placeholder: "+375 (29) ..." },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "telegram_url", label: "Telegram", placeholder: "https://t.me/..." },
  { key: "whatsapp_url", label: "WhatsApp", placeholder: "https://wa.me/..." },
  { key: "address", label: "Адрес", placeholder: "г. Мозырь, ..." },
  { key: "working_hours", label: "Часы работы", placeholder: "Ежедневно 9:00–21:00" },
];

export function SettingsPanel({
  settings,
  onChanged,
}: {
  settings: ShopSettings;
  onChanged: () => Promise<void>;
}) {
  const [form, setForm] = useState<ShopSettings>(settings);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.saveSettings(form);
      haptic("success");
      await onChanged();
      notify("Настройки сохранены ✅");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl">Настройки магазина</h2>

      <div className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {f.label}
            </span>
            <input
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="input mt-1.5"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-primary w-full disabled:opacity-60"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : null}
        Сохранить настройки
      </button>
    </div>
  );
}
