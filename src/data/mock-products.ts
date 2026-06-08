import type { Category, Product, ShopSettings } from "@/lib/types";

// Фолбэк-данные на время разработки (см. CLAUDE.md §2).
// Когда подключим Supabase — заменим эти массивы реальными запросами,
// сохранив ту же форму данных.

export const mockCategories: Category[] = [
  { id: "c1", name: "Авторские букеты", slug: "avtorskie-bukety", sort_order: 1 },
  { id: "c2", name: "Розы", slug: "rozy", sort_order: 2 },
  { id: "c3", name: "Композиции в коробке", slug: "kompozicii-v-korobke", sort_order: 3 },
  { id: "c4", name: "Пионы и сезонное", slug: "piony-sezonnoe", sort_order: 4 },
  { id: "c5", name: "Букеты невесты", slug: "bukety-nevesty", sort_order: 5 },
];

// Unsplash-фото на время разработки. На проде — фото из Supabase Storage.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Нежное облако",
    slug: "nezhnoe-oblako",
    description:
      "Воздушная композиция из пионовидных роз, эустомы и гипсофилы в пастельных тонах. Лёгкий, романтичный букет, который дарит ощущение нежности.",
    price: 145,
    category_id: "c1",
    images: [img("photo-1561181286-d3fee7d55364"), img("photo-1487070183336-b863922373d4")],
    is_available: true,
    is_featured: true,
    sort_order: 1,
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "p2",
    name: "Розовый рассвет",
    slug: "rozovyj-rassvet",
    description:
      "25 нежно-розовых роз сорта Pink Mondial с зеленью эвкалипта. Классика, которая всегда уместна.",
    price: 180,
    category_id: "c2",
    images: [img("photo-1518895949257-7621c3c786d7"), img("photo-1455659817273-f96807779a8a")],
    is_available: true,
    is_featured: true,
    sort_order: 2,
    created_at: "2026-05-02T10:00:00Z",
  },
  {
    id: "p3",
    name: "Лесная сказка",
    slug: "lesnaya-skazka",
    description:
      "Стильная композиция в шляпной коробке: кустовые розы, хлопок, сухоцветы и ягоды. Долго радует и красиво смотрится в интерьере.",
    price: 210,
    category_id: "c3",
    images: [img("photo-1502977249166-824b3a8a4d6d"), img("photo-1526047932273-341f2a7631f9")],
    is_available: true,
    is_featured: true,
    sort_order: 3,
    created_at: "2026-05-03T10:00:00Z",
  },
  {
    id: "p4",
    name: "Пионовый поцелуй",
    slug: "pionovyj-poceluj",
    description:
      "Монобукет из ароматных розовых пионов. Сезонное предложение — пока цветут пионы.",
    price: 230,
    category_id: "c4",
    images: [img("photo-1563241527-3004b7be0ffd"), img("photo-1490750967868-88aa4486c946")],
    is_available: true,
    is_featured: true,
    sort_order: 4,
    created_at: "2026-05-04T10:00:00Z",
  },
  {
    id: "p5",
    name: "Белоснежная элегия",
    slug: "belosnezhnaya-elegiya",
    description:
      "Свадебный букет из белых роз, фрезии и зелени. Изящный и сдержанный, для самого важного дня.",
    price: 195,
    category_id: "c5",
    images: [img("photo-1469371670807-013ccf25f16a"), img("photo-1606800052052-a08af7148866")],
    is_available: true,
    is_featured: false,
    sort_order: 5,
    created_at: "2026-05-05T10:00:00Z",
  },
  {
    id: "p6",
    name: "Солнечное настроение",
    slug: "solnechnoe-nastroenie",
    description:
      "Жизнерадостный букет из подсолнухов, кустовых роз и хризантем. Заряжает теплом и улыбкой.",
    price: 130,
    category_id: "c1",
    images: [img("photo-1597848212624-a19eb35e2651"), img("photo-1508610048659-a06b669e3321")],
    is_available: true,
    is_featured: true,
    sort_order: 6,
    created_at: "2026-05-06T10:00:00Z",
  },
  {
    id: "p7",
    name: "Красная страсть",
    slug: "krasnaya-strast",
    description:
      "51 красная роза Red Naomi — мощное признание в чувствах. Премиальные голландские розы.",
    price: 320,
    category_id: "c2",
    images: [img("photo-1494972308805-463bc619d34e"), img("photo-1520903920243-00d872a2d1c9")],
    is_available: false,
    is_featured: false,
    sort_order: 7,
    created_at: "2026-05-07T10:00:00Z",
  },
  {
    id: "p8",
    name: "Лавандовый сон",
    slug: "lavandovyj-son",
    description:
      "Композиция в коробке с лавандой, сиреневой эустомой и розами. Тонкий аромат и спокойствие.",
    price: 175,
    category_id: "c3",
    images: [img("photo-1469259943454-aa100abba749"), img("photo-1464982326199-86f32f81b211")],
    is_available: true,
    is_featured: false,
    sort_order: 8,
    created_at: "2026-05-08T10:00:00Z",
  },
  {
    id: "p9",
    name: "Весенний этюд",
    slug: "vesennij-etyud",
    description:
      "Тюльпаны, ранункулюсы и матиолла — букет, в котором живёт весна. Сезонное предложение.",
    price: 120,
    category_id: "c4",
    images: [img("photo-1520763185298-1b434c919102"), img("photo-1457089328109-e5d9bd499191")],
    is_available: true,
    is_featured: false,
    sort_order: 9,
    created_at: "2026-05-09T10:00:00Z",
  },
];

export const mockSettings: ShopSettings = {
  phone: "+375 (29) 000-00-00",
  instagram_url: "https://instagram.com/_kolibri_flowers_",
  telegram_url: "https://t.me/kolibri_flowers",
  whatsapp_url: "https://wa.me/375290000000",
  address: "г. Мозырь, ул. Пролетарская, 1",
  working_hours: "Ежедневно 9:00 – 21:00",
};
