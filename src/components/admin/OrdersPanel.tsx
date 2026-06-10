"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Phone, Trash2, X, Clock } from "lucide-react";
import { api } from "./api";
import { confirmDialog, haptic, notify } from "./telegram";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: "Новый", cls: "bg-accent/15 text-accent" },
  accepted: { label: "Принят", cls: "bg-accent-2/10 text-accent-2" },
  cancelled: { label: "Отменён", cls: "bg-ink/10 text-muted" },
};

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setOrders(await api.listOrders());
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Заказы</h2>
      {orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Заказов пока нет.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderCard order={o} onChanged={load} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order, onChanged }: { order: Order; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const meta = STATUS_META[order.status];

  async function setStatus(status: OrderStatus) {
    setBusy(true);
    try {
      await api.setOrderStatus(order.id, status);
      haptic("success");
      await onChanged();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!(await confirmDialog("Удалить этот заказ?"))) return;
    setBusy(true);
    try {
      await api.deleteOrder(order.id);
      haptic("success");
      await onChanged();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  const date = new Date(order.created_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <span className={cn("badge", meta.cls)}>{meta.label}</span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} />
          {date}
        </span>
      </div>

      <p className="font-medium">{order.customer_name}</p>
      <a
        href={`tel:${order.customer_phone.replace(/[^\d+]/g, "")}`}
        className="inline-flex items-center gap-1 text-sm text-accent-2"
      >
        <Phone size={13} />
        {order.customer_phone}
      </a>
      {order.customer_address && (
        <p className="mt-1 text-sm text-muted">📍 {order.customer_address}</p>
      )}
      {order.comment && <p className="mt-1 text-sm text-muted">💬 {order.comment}</p>}

      <div className="mt-3 space-y-0.5 border-t border-ink/10 pt-3 text-sm">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-muted">
              {i.name} × {i.qty}
            </span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1 font-semibold">
          <span>Итого</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {order.status !== "accepted" && (
          <button
            onClick={() => setStatus("accepted")}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-accent-2 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Check size={15} /> Принять
          </button>
        )}
        {order.status !== "cancelled" && (
          <button
            onClick={() => setStatus("cancelled")}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-ink/15 px-3 py-2 text-sm font-medium text-ink disabled:opacity-60"
          >
            <X size={15} /> Отменить
          </button>
        )}
        <button
          onClick={del}
          disabled={busy}
          aria-label="Удалить"
          className="inline-flex items-center justify-center gap-1 rounded-full border border-red-300 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
