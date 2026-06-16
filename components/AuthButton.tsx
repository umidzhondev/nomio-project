"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthButton({ initialUser }: { initialUser: any }) {
  const router = useRouter();
  const t = useTranslations('Sidebar')
  const params = useParams();
  const locale = params?.locale || 'ru'; // joriy tilni aniqlaymiz
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); 
  };

  if (user) {
    return (
      <button 
        onClick={handleLogout} 
        className="inline-flex items-center justify-center cursor-pointer bg-zinc-100 text-zinc-900 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:bg-zinc-200 transition-all duration-200 active:scale-95 flex-shrink-0 whitespace-nowrap"
      >
        {/* Mobilda eshikdan chiqish SVG ikonkasi, kattaroq ekranda "Выход" yozuvi */}
        <span className="sm:hidden flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span className="hidden sm:inline">{t('logout')}</span>
      </button>
    );
  }

  return (
    <Link 
      href={`/${locale}/login`} 
      className="inline-flex items-center justify-center cursor-pointer bg-zinc-900 text-white px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:bg-black transition-all duration-200 active:scale-95 flex-shrink-0 whitespace-nowrap"
    >
      {t("login") || "Вход"}
    </Link>
  );
}