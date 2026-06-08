"use client";

import { motion } from "framer-motion";
import { Instagram, Send } from "lucide-react";
import type { ShopSettings } from "@/lib/types";
import { telegramOrderUrl } from "@/lib/utils";

interface OrderButtonsProps {
  productName: string;
  settings: ShopSettings;
  available: boolean;
}

/**
 * Кнопки заказа. Telegram получает предзаполненный текст заказа,
 * Instagram открывает Direct (префилл текста в Instagram невозможен).
 */
export function OrderButtons({ productName, settings, available }: OrderButtonsProps) {
  if (!available) {
    return (
      <div className="rounded-2xl bg-ink/5 px-5 py-4 text-center text-sm text-muted">
        Этого букета сейчас нет в наличии. Напишите нам — подберём похожий 🌷
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={telegramOrderUrl(settings.telegram_url, productName)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex-1"
      >
        <Send size={18} />
        Заказать в Telegram
      </motion.a>
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={settings.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline flex-1"
      >
        <Instagram size={18} />
        Написать в Instagram
      </motion.a>
    </div>
  );
}
