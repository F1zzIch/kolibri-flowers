import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { OrderButtons } from "@/components/catalog/OrderButtons";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  getSettings,
} from "@/lib/data";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 120;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Букет не найден" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    getRelatedProducts(product, 3),
  ]);

  return (
    <div className="container-px py-10 md:py-14">
      <Link
        href="/catalog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
      >
        <ChevronLeft size={16} />
        Назад в каталог
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <ProductGallery images={product.images} name={product.name} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="lg:py-4">
            {product.category && (
              <p className="eyebrow mb-3">{product.category.name}</p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl">{product.name}</h1>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-semibold text-ink">
                {formatPrice(product.price)}
              </span>
              {product.is_available ? (
                <span className="badge bg-accent-2/10 text-accent-2">
                  В наличии
                </span>
              ) : (
                <span className="badge bg-ink/10 text-muted">Нет в наличии</span>
              )}
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted">
              {product.description}
            </p>

            <div className="mt-8">
              <OrderButtons
                productName={product.name}
                settings={settings}
                available={product.is_available}
              />
            </div>

            <p className="mt-5 text-xs text-muted">
              Доставка по Мозырю · Свежие цветы · Собираем в день заказа
            </p>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif text-2xl sm:text-3xl">
            Похожие букеты
          </h2>
          <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}
    </div>
  );
}
