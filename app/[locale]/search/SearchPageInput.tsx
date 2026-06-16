'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl'; // ✨ Import qilindi
export default function SearchPageInput({ defaultValue }: { defaultValue: string }) {
  const t = useTranslations('Search'); // ✨ Tarjima hooki ulandi
  const locale = useLocale(); // ✨ Joriy til segmentini oldik ('ru' yoki 'kg')
  const router = useRouter();

  // Enter bosilganda qidirish mantiqi
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value) {
        // ✨ Til segmenti saqlangan holda qidiradi: /ru/search?q=... yoki /kg/search?q=...
        router.push(`/${locale}/search?q=${encodeURIComponent(value)}`);
      } else {
       router.push(`/${locale}/search`);
      }
    }
  };

  // MANA SHU YANGI FUNKSIYA QO'SHILDI:
  // Foydalanuvchi backspace bilan matnni butunlay o'chirsa, darhol odatiy holga qaytaradi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
     router.push(`/${locale}/search`); // ✨ Til segmenti saqlab qolindi
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400">
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={t('inputPlaceholder')}
        defaultValue={defaultValue}
        onChange={handleChange} // Ulandi
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400 text-zinc-800 shadow-xs"
      />
    </div>
  );
}