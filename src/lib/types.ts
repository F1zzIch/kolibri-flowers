// Доменные типы. Соответствуют модели данных Supabase (см. CLAUDE.md §6),
// чтобы переключение с мок-данных на реальную БД было бесшовным.

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // цена в BYN
  category_id: string;
  images: string[]; // URL фотографий
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ShopSettings {
  phone: string;
  instagram_url: string;
  telegram_url: string;
  whatsapp_url: string;
  address: string;
  working_hours: string;
}

// Товар вместе с раскрытой категорией — удобно для карточек и страниц.
export interface ProductWithCategory extends Product {
  category?: Category;
}

// ---------- Заказы ----------

export type OrderStatus = "new" | "accepted" | "cancelled";

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  comment: string;
  items: OrderItem[];
  total: number;
  created_at: string;
}
