import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Reveal } from "@/components/motion/Reveal";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Каталог букетов",
  description:
    "Каталог авторских букетов, роз, пионов и композиций в коробках. Выбирайте и заказывайте доставку цветов по Мозырю.",
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="container-px py-16 md:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow mb-3">Наш ассортимент</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Каталог букетов</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Выберите букет по душе — а мы соберём его из свежих цветов и доставим
          по Мозырю.
        </p>
      </Reveal>

      <CatalogView products={products} categories={categories} />
    </div>
  );
}
