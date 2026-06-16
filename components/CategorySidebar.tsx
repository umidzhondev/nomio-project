"use client";
import Link from 'next/link';

export default function CategorySidebar({ locale, categories }: { locale: string; categories: { id: string | number, name: string }[] }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Sarlavha: Dark modeda text-zinc-400 orqali o'qilishi yaxshilandi */}
      <h3 className="text-zinc-600 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest px-4 hidden lg:block select-none">
        Категории
      </h3>

      {/* Navigatsiya: Mobilda gorizontal slayder, Desktopda vertikal ro'yxat */}
      <nav className="flex flex-row lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none snap-x -mx-4 px-4 lg:mx-0 lg:px-0">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/${locale}/category/${cat.id}`}
            // ✨ Klasslar silliqlandi: dark mode uchun fon, border va matn ranglari ideal kontrastga keltirildi
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-full lg:rounded-lg border border-zinc-100 dark:border-zinc-800 lg:border-0 bg-zinc-50 lg:bg-transparent dark:bg-zinc-900 lg:dark:bg-transparent transition-all text-xs lg:text-sm font-semibold whitespace-nowrap snap-start active:scale-95 lg:active:scale-100"
          >
            {cat.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}