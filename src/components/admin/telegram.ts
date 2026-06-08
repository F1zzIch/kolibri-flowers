"use client";

// Минимальные типы и доступ к Telegram Mini App SDK на клиенте.

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name?: string; username?: string };
  };
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, cb: (ok: boolean) => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** Ждёт загрузки Telegram SDK (он подключается отдельным скриптом). */
export function waitForWebApp(timeoutMs = 3000): Promise<TelegramWebApp | null> {
  return new Promise((resolve) => {
    const existing = getWebApp();
    if (existing) return resolve(existing);
    const start = Date.now();
    const timer = setInterval(() => {
      const wa = getWebApp();
      if (wa || Date.now() - start > timeoutMs) {
        clearInterval(timer);
        resolve(wa);
      }
    }, 80);
  });
}

/** Подтверждение через нативный диалог Telegram (или window.confirm как фолбэк). */
export function confirmDialog(message: string): Promise<boolean> {
  const wa = getWebApp();
  if (wa?.showConfirm) {
    return new Promise((resolve) => wa.showConfirm(message, resolve));
  }
  return Promise.resolve(window.confirm(message));
}

export function notify(message: string) {
  const wa = getWebApp();
  if (wa?.showAlert) wa.showAlert(message);
  else alert(message);
}

export function haptic(type: "success" | "error" | "warning" = "success") {
  getWebApp()?.HapticFeedback?.notificationOccurred(type);
}
