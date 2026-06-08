import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-4">Ошибка 404</p>
      <h1 className="font-serif text-4xl sm:text-5xl">Страница не найдена</h1>
      <p className="mt-4 max-w-md text-muted">
        Возможно, этот букет уже разобрали. Загляните в каталог — там много
        красоты 🌸
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-outline">
          На главную
        </Link>
        <Link href="/catalog" className="btn-primary">
          В каталог
        </Link>
      </div>
    </div>
  );
}
