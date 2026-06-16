"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth'); // ✨ Hook chaqirildi
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullNameText = `${firstName} ${lastName}`.trim();

    // 1. Supabase Auth orqali ro'yxatdan o'tkazish
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Metadata ichiga username va full_name beriladi (Trigger funksiyasi to'g'ri o'qishi uchun)
        data: {
          username: username,
          full_name: fullNameText
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      if (data.user) {
        // Dublikat e'lon qilish xatoligi olib tashlandi va .upsert to'g'ri ulandi
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            [
              {
                id: data.user.id,
                username: username,
                full_name: fullNameText
              }
            ],
            { onConflict: 'id' } // Agar trigger profil yaratib ulgurgan bo'lsa, uni yangilaydi
          );

        if (profileError) {
          console.error("Ошибка при создании профиля:", profileError.message);
        }
      }

      toast.success("Успешно! Пожалуйста, подтвердите ваш Email.");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    // mt-12 md:mt-20 orqali tepadan chiroyli masofa qoldirildi
    <div className="w-full max-w-md mx-auto mt-12 md:mt-20 px-4 sm:px-0">

      {/* Oq rangli Auth Card bloki - Dark modeda to'q fonga va mos borderga o'tadi */}
      <div className="bg-white dark:bg-zinc-900/50 sm:border border-[var(--color-border-subtle)] p-6 sm:p-8 rounded-2xl sm:shadow-sm transition-all duration-200">

        {/* Sarlavha qismi - NOMIO va tagidagi chiziq Dark Mode uchun moslashtirildi */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tighter transition-colors duration-200">
           {t('registerTitle')}
          </h1>
          <div className="w-10 md:w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-2 md:mt-3 rounded-full transition-colors duration-200"></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Ism Input - Dark Mode moslashtirildi */}
          <input
            type="text"
            placeholder={t('firstNamePlaceholder')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            required
          />

          {/* Familiya Input - Dark Mode moslashtirildi */}
          <input
            type="text"
           placeholder={t('lastNamePlaceholder')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            required
          />

          {/* Username Input - Dark Mode moslashtirildi */}
          <input
            type="text"
           placeholder={t('usernamePlaceholder')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            required
          />

          {/* Email Input - Dark Mode moslashtirildi */}
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            required
          />

          {/* Parol Input - Dark Mode moslashtirildi */}
          <input
            type="password"
           placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-[var(--color-text-main)] focus:bg-transparent focus:border-[var(--color-text-main)] focus:ring-1 focus:ring-[var(--color-text-main)] transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs"
            required
          />

          {/* Ro'yxatdan o'tish tugmasi - Dark Mode moslashtirildi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 border border-transparent transition-all cursor-pointer shadow-xs mt-2 block"
          >
            {loading ? t('registerLoading') : t('registerButton')}
          </button>
        </form>

        {/* Pastki o'tish havolasi - Dark Mode moslashtirildi */}
        <div className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-6 pt-4 border-t border-[var(--color-border-subtle)] transition-colors duration-200">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-semibold text-zinc-900 dark:text-[var(--color-text-main)] dark:hover:text-zinc-400 hover:underline transition-colors">
           {t('loginButton')}
          </Link>
        </div>

      </div>
    </div>
  );
}