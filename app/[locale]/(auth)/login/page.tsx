"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth'); // ✨ Hook chaqirildi

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Добро пожаловать!");
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    // pt-12 md:pt-20 orqali tepadan joy tashlandi, flex orqali markazlashtirildi
    <div className="w-full max-w-md mx-auto pt-12 md:pt-20 px-4 sm:px-0">

      {/* Oq rangli Auth Card bloki - Dark modeda to'q fonga va mos borderga o'tadi */}
      <div className="bg-white dark:bg-zinc-900/50 sm:border border-[var(--color-border-subtle)] p-6 sm:p-8 rounded-2xl sm:shadow-sm transition-all duration-200">

        {/* Sarlavha qismi - Dark Mode moslashtirildi */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
            {t('loginTitle')}
          </h1>
          <div className="w-10 md:w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-2 md:mt-3 rounded-full transition-colors duration-200"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input - Dark Mode moslashtirildi */}
          <input
            type="email"
           placeholder={t('emailPlaceholder')}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Parol Input - Dark Mode moslashtirildi */}
          <input
            type="password"
           placeholder={t('passwordPlaceholder')}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Kirish Tugmasi - Dark Mode moslashtirildi */}
          <button
            disabled={loading}
            className="w-full bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 border border-transparent transition-all cursor-pointer shadow-xs mt-2 block"
          >
            {loading ? t('loginLoading') : t('loginButton')}
          </button>
        </form>

        {/* Pastki o'tish havolasi - Dark Mode moslashtirildi */}
        <p className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-6 pt-4 border-t border-[var(--color-border-subtle)] transition-colors duration-200">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-[var(--color-text-main)] dark:hover:text-zinc-400 font-semibold hover:underline transition-colors">
            {t('registerButton')}
          </Link>
        </p>

      </div>
    </div>
  );
}