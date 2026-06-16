'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import PostCard from './PostCard';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';


export default function PostFeed({ currentUserId }: { currentUserId: string | null }) {
  const t = useTranslations('Feed'); // ✨ Tarjima hooki chaqirildi
const queryClient = useQueryClient(); // Buni komponent ichiga, eng tepaga qo'shasiz
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *, 
          profiles (username), 
          comments (count),
          likes (user_id),
          saved_posts (user_id) 
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((post: any) => ({
        ...post,
        like_count: post.likes ? post.likes.length : 0,
        is_liked: post.likes ? post.likes.some((l: any) => l.user_id === currentUserId) : false,
        is_saved: post.saved_posts ? post.saved_posts.some((s: any) => s.user_id === currentUserId) : false,
        comment_count: post.comments && post.comments.length > 0 ? post.comments[0].count : 0
      }));
    }
  });
// O'chirish funksiyasini faqat shu qismini almashtiring:
const handleDelete = async (postId: string) => {
  // Eski confirm va window.location.reload butunlay olib tashlandi!
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    toast.error("Ошибка: " + error.message);
  } else {
    // Sahifani reload qilmasdan, silliq yangilash uchun React Query keshini tozalaymiz
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  }
};


  // ✨ STATIK YUKLANISH VA XATOLIK MATNLARI DINAMIK HOLATGA KELTIRILDI
  if (isLoading) return <div className="text-zinc-500 text-sm p-4 animate-pulse">{t('loading')}</div>;
  if (error) return <div className="text-red-500 text-sm p-4">{t('error')}</div>;

 return (
    <div>
      {/* RESPONSIVE VA DARK MODEGA MOSLASHTIRILGAN SARLAVHA BLOCKI */}
      <div className="mb-6 md:mb-10 mt-2 md:mt-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
       {t('title')} {/* ✨ Динамик сарлавҳа */}
        </h1>
        {/* Chiziqcha ham Dark modeda och rangga (zinc-400) o'tadi, Light modeda zinc-900 bo'ladi */}
        <div className="w-10 md:w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-2 md:mt-3 rounded-full transition-colors duration-200"></div>
      </div>

      {/* RESPONSIVE POSTLAR RO'YXATI */}
      <div className="space-y-4 md:space-y-6 pb-12 md:pb-20">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={post.user_id === currentUserId}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );}