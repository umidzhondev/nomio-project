"use client";
// components/ProfileView.tsx
import PostCard from './PostCard';
import Link from 'next/link';
import { useTranslations } from 'next-intl'; // ✨ Import qilindi
import { useParams } from 'next/navigation';
export default function ProfileView({ profile, posts, isOwnProfile, onDelete }: any) {
  const t = useTranslations('ProfileView'); // ✨ Alohida obyekt ulandi
  const params = useParams();
  const locale = (params.locale as string) || 'ru';
  return (
    // pt-1 orqali tepadagi bo'shliq minimal darajaga keltirildi
    <div className="max-w-2xl mx-auto pt-1 pb-4 sm:py-8 px-4">
      {/* Profil Headeri */}
      <div className="flex flex-col sm:flex-row items-start text-left gap-4 sm:gap-6 mb-5 sm:mb-8 p-1">
        
        {/* Avatar: Dark modeda border va fon ranglari moslashtirildi */}
        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 sm:border-4 border-zinc-100 dark:border-zinc-700 shadow-sm transition-colors duration-200">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl sm:text-2xl font-bold text-zinc-500 dark:text-zinc-400">
              {profile?.username?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* User Information - Dark modeda matn ranglari avtomatik o'zgaradi */}
        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 w-full pt-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] truncate leading-tight transition-colors duration-200">
            {profile?.full_name || t('defaultName')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm truncate transition-colors duration-200">
            @{profile?.username}
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm max-w-sm mt-1.5 break-words transition-colors duration-200">
           {profile?.bio || t('noBio')} {/* ✨ Динамик */}
          </p>
        </div>
      </div>

      {/* Agar o'z profilimiz bo'lsa, Edit tugmasini chiqaramiz (Dark mode uchun moslashtirildi) */}
      {isOwnProfile && (
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/profile/edit" 
            className="block text-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 border border-transparent dark:border-[var(--color-border-subtle)] transition-all active:scale-[0.99] duration-200"
          >
            {t('editProfile')} {/* ✨ Редактировать профиль */}
          </Link>
        </div>
      )}

      {!isOwnProfile && (
        <div className="mb-6 sm:mb-8 mt-4 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
            {t('posts')} {/* ✨ Публикации */}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-zinc-200 dark:bg-zinc-700 mt-2 rounded-full transition-colors duration-200"></div>
        </div>
      )}

      {/* Postlar ro'yxati */}
      <div className="space-y-4 sm:space-y-6">
        {posts?.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={isOwnProfile}
            onDelete={onDelete}
          />
        ))}

        {(!posts || posts.length === 0) && !isOwnProfile && (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-10 text-sm transition-colors duration-200">
           {t('noPosts')} {/* ✨ Динамик */}
          </p>
        )}
      </div>
    </div>
  );
}