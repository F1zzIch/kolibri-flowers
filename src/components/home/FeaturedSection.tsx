import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { ProductCard } from "@/components/catalog/ProductCard";
import { StaggerGrid, StaggerItem } from "@/components/motion/StaggerGrid";
import type { ProductWithCategory } from "@/lib/types";

export function FeaturedSection({
  products,
}: {
  products: ProductWithCategory[];
}) {
  return (
    <section className="container-px py-20">
      <SectionHeading
        eyebrow="Хиты продаж"
        title="Популярные букеты"
        subtitle="Самые любимые композиции наших клиентов. Каждый букет собирается вручную из свежих цветов."
      />

      <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="mt-12 text-center">
        <Link href="/catalog" className="btn-outline">
          Весь каталог
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
