'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SearchInput() {
    const router = useRouter();
    const t = useTranslations('Sidebar'); // ✨ Hook chaqirildi
    return (
        <input
            type="text"
            placeholder={t('searchPlaceholder')}
            // ✨ Klasslar yangilandi: rounded-xl, h-9 va dark mode ranglar balansi qo'shildi
            className="w-full h-9 px-4 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
            onChange={(e) => {
                if (e.target.value === '') {
                    router.push('/search'); // Bo'sh bo'lsa, qidiruvni o'chiradi
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    router.push(val ? `/search?q=${val}` : '/search');
                }
            }}
        />
    );
}