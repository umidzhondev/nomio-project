'use client'; // Eng tepaga majburiy qo'shiladi

import { useState } from 'react';
import Link from 'next/link';

export default function UserCard({ user, locale, isOwnProfile }: { user: any, locale: string, isOwnProfile: boolean }) {
  // Agar isOwnProfile true bo'lsa -> /profile, aks holda -> /user/[id]
  const linkPath = isOwnProfile ? `/${locale}/profile` : `/${locale}/user/${user.id}`;
  // Rasm yuklanishida xatolik bo'lganini bilish uchun state
  const [imageError, setImageError] = useState(false);

  // Foydalanuvchining ko'rsatiladigan ismi (agar full_name bo'lsa o'sha, bo'lmasa username)
  const displayName = user.full_name || user.username || 'User';

  // Ismning birinchi harfini katta harfda olish
  const firstLetter = displayName.charAt(0).toUpperCase();

  // Profil rasmining haqiqatda borligini tekshirish
  const hasAvatar = user.avatar_url && !imageError;

  return (
    <Link
      href={linkPath}
      // Dark Mode uchun fon, border va hover holatlari global o'zgaruvchilarga moslashtirildi
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all shadow-xs sm:shadow-none block"
    >
      {/* Avatar qismi: Dark mode fon va borderlari to'g'rilandi */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
        {hasAvatar ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-sm sm:text-base font-bold text-zinc-600 dark:text-zinc-400 select-none transition-colors duration-200">
            {firstLetter}
          </span>
        )}
      </div>

      {/* Matnlar qismi: Dark mode matn ranglari o'zgaruvchilarga bog'landi */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Ism: text-[var(--color-text-main)] ulandi */}
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-main)] truncate transition-colors duration-200">
          {user.full_name || 'No Name'}
        </h3>
        {/* Username: dark:text-zinc-400 orqali qorong'i fonda kontrast berildi */}
        <p className="text-[11px] sm:text-sm text-zinc-400 sm:text-zinc-500 dark:text-zinc-400 font-medium truncate transition-colors duration-200">
          @{user.username || 'user'}
        </p>
      </div>
    </Link>
  );
}