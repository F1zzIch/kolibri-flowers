"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/utils";

type Step = "cart" | "checkout" | "done";

export function CartDrawer() {
  const { items, total, count, isOpen, close, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({ name: "", phone: "", address: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    close();
    // Сброс с задержкой, чтобы не моргало при закрытии.
    setTimeout(() => {
      setStep("cart");
      setError("");
    }, 300);
  }

  async function submit() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Укажите имя и телефон");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_address: form.address.trim(),
          comment: form.comment.trim(),
          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Не удалось отправить заказ");
      }
      clear();
      setForm({ name: "", phone: "", address: "", comment: "" });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-bg shadow-card"
            role="dialog"
            aria-label="Корзина"
          >
            <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl">
                <ShoppingBag size={20} className="text-accent-2" />
                {step === "checkout" ? "Оформление" : "Корзина"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Закрыть"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
              >
                <X size={20} />
              </button>
            </header>

            {step === "done" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <CheckCircle2 size={56} className="text-accent-2" />
                <h3 className="font-serif text-2xl">Заказ принят!</h3>
                <p className="text-muted">
                  Спасибо! Мы свяжемся с вами в ближайшее время для подтверждения.
                </p>
                <button onClick={handleClose} className="btn-primary mt-4">
                  Отлично
                </button>
              </div>
            ) : count === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <ShoppingBag size={48} className="text-muted/50" />
                <p className="text-muted">Корзина пуста</p>
                <button onClick={handleClose} className="btn-outline mt-2">
                  Выбрать букеты
                </button>
              </div>
            ) : step === "cart" ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {items.map((i) => (
                    <div
                      key={i.product_id}
                      className="flex gap-3 rounded-2xl bg-surface p-3 shadow-soft"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                        {i.image && (
                          <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="truncate font-medium">{i.name}</p>
                        <p className="text-sm text-muted">{formatPrice(i.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QtyBtn onClick={() => setQty(i.product_id, i.qty - 1)}>
                              <Minus size={14} />
                            </QtyBtn>
                            <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                            <QtyBtn onClick={() => setQty(i.product_id, i.qty + 1)}>
                              <Plus size={14} />
                            </QtyBtn>
                          </div>
                          <button
                            onClick={() => remove(i.product_id)}
                            aria-label="Удалить"
                            className="text-muted hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <footer className="border-t border-ink/10 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted">Итого</span>
                    <span className="text-xl font-semibold">{formatPrice(total)}</span>
                  </div>
                  <button onClick={() => setStep("checkout")} className="btn-primary w-full">
                    Оформить заказ
                  </button>
                </footer>
              </>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <Input
                    label="Ваше имя *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Как к вам обращаться"
                  />
                  <Input
                    label="Телефон *"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="+375 (29) ..."
                    type="tel"
                  />
                  <Input
                    label="Адрес доставки"
                    value={form.address}
                    onChange={(v) => setForm({ ...form, address: v })}
                    placeholder="Улица, дом, квартира (или самовывоз)"
                  />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Комментарий
                    </span>
                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      rows={2}
                      placeholder="Пожелания, дата и время доставки…"
                      className="input mt-1.5 resize-none"
                    />
                  </div>

                  <div className="rounded-2xl bg-surface p-4 text-sm shadow-soft">
                    {items.map((i) => (
                      <div key={i.product_id} className="flex justify-between py-0.5">
                        <span className="text-muted">
                          {i.name} × {i.qty}
                        </span>
                        <span>{formatPrice(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold">
                      <span>Итого</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <footer className="space-y-2 border-t border-ink/10 px-5 py-4">
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    Отправить заказ
                  </button>
                  <button onClick={() => setStep("cart")} className="btn-outline w-full">
                    Назад в корзину
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 text-ink hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input mt-1.5"
      />
    </div>
  );
}
