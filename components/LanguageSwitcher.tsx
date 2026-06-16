'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ru', label: 'RU' },
    { code: 'kg', label: 'KG' },
  ];

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  // Tashqariga bosganda menyuni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Asosiy ko'rinib turadigan tugma - Border va fon o'zgaruvchilarga moslandi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 border border-[var(--color-border-subtle)] dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 px-3 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
      >
        <Globe className="h-3.5 w-3.5 text-zinc-400" />
        <span>{currentLang.label}</span>
        <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ✨ Yangi va zamonaviy variantlar ro'yxati (Dropdown Menu) - Border moslandi */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-20 bg-white dark:bg-zinc-950 border border-[var(--color-border-subtle)] dark:border-zinc-800 rounded-xl shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentLocale === lang.code
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-[var(--color-text-main)] dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-[var(--color-text-main)] dark:hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}