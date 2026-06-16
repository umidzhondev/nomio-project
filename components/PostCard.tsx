'use client';

import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReportModal from './ReportModal';
import { useLikePost } from '@/hooks/useLikePost';
import { useSavePost } from '@/hooks/useSavePost';
import { useQueryClient } from '@tanstack/react-query';
import { useInteractionStore } from '@/store/useInteractionStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl'; // ✨ Import qilindi

export default function PostCard({
  post,
  isOwner,
  onDelete
}: {
  post: any,
  isOwner: boolean,
  onDelete?: (id: string) => void
}) {
  const t = useTranslations('PostCard'); // ✨ Tarjima hooki ulandi
  // --- ZUSTAND GLOBAL STATE ---
  const overrides = useInteractionStore((state) => state.overrides[post.id]);
  const setInteraction = useInteractionStore((state) => state.setInteraction);

  const isLiked = overrides?.isLiked ?? !!post.is_liked;
  const likeCount = overrides?.likesCount ?? (post.like_count || 0);
  const isSaved = overrides?.isSaved ?? !!post.is_saved;
  const commentCount = overrides?.commentCount ?? (post.comment_count || 0);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const params = useParams();
  const locale = params.locale || 'ru';
  const menuRef = useRef<HTMLDivElement>(null);

  const { mutate: toggleSave } = useSavePost(post.id);
  const { mutate: toggleLike, isPending } = useLikePost(post.id);

  const queryClient = useQueryClient();
  // Komponent tepasidagi state'lar yoniga qo'shing:
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const handleLike = () => {
    const newLikedStatus = !isLiked;
    const newLikeCount = newLikedStatus ? likeCount + 1 : likeCount - 1;

    setInteraction(post.id, { isLiked: newLikedStatus, likesCount: newLikeCount });

    toggleLike(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      },
      onError: () => {
        setInteraction(post.id, { isLiked, likesCount: likeCount });
      }
    });
  };

  const handleSave = () => {
    const newSavedStatus = !isSaved;
    setInteraction(post.id, { isSaved: newSavedStatus });

    toggleSave(newSavedStatus, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      },
      onError: () => {
        setInteraction(post.id, { isSaved });
      }
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async () => {
    setIsMenuOpen(false);
    if (navigator.share) {
      await navigator.share({ title: post.title, url: `${window.location.origin}/post/${post.id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success(t('toastSuccess')); //
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(null); // Avval tasdiqlash modalini yopamiz

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      toast.error(t('deleteError') + error.message);
    } else {
      // Muvaffaqiyatli o'chgach, tanlangan yashil Toastni yoqamiz
      setShowDeleteToast(true);

      // KODDAGI ASOSIY TUZATISH: 
      // Topilmagan fetchPosts/setPosts o'rniga komponent tepasidagi onDelete propini chaqiramiz
      if (onDelete) {
        onDelete(postId);
      }

      // 2 soniyadan keyin toast bildirishnomasini avtomatik yopamiz
      setTimeout(() => {
        setShowDeleteToast(false);
      }, 2000);
    }
  };

  return (
    // mb-5 orqali har bir card pastidan chiroyli masofa ochildi (Oxirgi card ham endi yopishib qolmaydi)
    // ✨ Kard asosi: dark:border-zinc-850, dark:bg-zinc-900/40 va dark:hover:border-zinc-800 orqali qorong'u rejimga moslandi
    <div className="p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors mb-5 shadow-sm">

      {/* Top Section - Username & Metadata */}
      <div className="flex justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link href={isOwner ? `/${locale}/profile` : `/${locale}/user/${post.user_id}`} className="hover:opacity-80 min-w-0 shrink">
            {/* Username chipi: dark:bg-zinc-100 va dark:text-zinc-950 bilan teskari kontrast berildi */}
            <span className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide shadow-sm block truncate max-w-[140px] sm:max-w-[200px]">
              @{post.profiles?.username || 'user'}
            </span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 shrink-0">•</span>
          <time className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
            {/* Har doim bir xil formatda chiqadi va Next.js ni chalg'itmaydi */}
            {new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </time>
        </div>

        {/* Action Buttons (Save & Dropdown Menu) */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

          {/* Saqlash (Save) Tugmasi */}
          <button
            onClick={handleSave}
            className={`p-2 sm:p-2.5 transition-colors cursor-pointer rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isSaved ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-all" viewBox="0 0 18 20" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M16 19L9 14L2 19V3C2 1.9 2.9 1 4 1H14C15.1 1 16 1.9 16 3V19Z" />
            </svg>
          </button>

          <div className="relative" ref={menuRef}>
            {/* Uch nuqta tugmasi */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 sm:p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>

            {/* IXCHAM DROPDOWN MENU */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 sm:w-44 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                <button onClick={handleShare} className="w-full text-left px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-2">
                  {t('share')} {/* ✨ Бөлүшүү / Поделиться */}
                </button>
                {isOwner ? (
                  <>
                    <Link href={`/${locale}/edit/${post.id}`} className="block w-full text-left px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      {t('edit')} {/* ✨ Өзгөртүү / Изменить */}
                    </Link>
                    <button
                      onClick={() => {
                        setPostToDelete(post.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                    >
                      {t('delete')} {/* ✨ Өчүрүү / Удалить */}
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer">
                    {t('report')} {/* ✨ Арыздануу / Пожаловаться */}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="w-full overflow-hidden rounded-xl mb-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100/50 dark:border-zinc-800/40">
          <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-60 sm:max-h-64 object-cover" />
        </div>
      )}

      {/* Title & Description */}
      <div className="space-y-1.5 sm:space-y-2 mb-4">
        <Link href={`/${locale}/post/${post.id}`} className="block hover:opacity-80">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug break-words">{post.title}</h2>
        </Link>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 break-words">{post.description}</p>
      </div>

      {/* Footer Icons - Likes & Comments */}
      <div className="flex items-center gap-4 sm:gap-6 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm">

        {/* Like Tugmasi */}
        <button
          onClick={handleLike}
          disabled={isPending}
          className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer p-2 -m-2 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
        >
          <svg className="w-[19px] h-[17px] sm:w-[22px] sm:h-[20px] transition-all" viewBox="0 0 22 20" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M11 19.3L9.6 18C4.5 13.4 1 10.3 1 6.5C1 3.4 3.4 1 6.5 1C8.3 1 10 1.9 11 3.3C12 1.9 13.7 1 15.5 1C18.6 1 21 3.4 21 6.5C21 10.3 17.5 13.4 12.4 18L11 19.3Z" />
          </svg>
          <span className="min-w-[10px] text-center text-xs sm:text-sm">{likeCount}</span>
        </button>

        {/* Comment Tugmasi */}
        <Link href={`/${locale}/post/${post.id}#comments`} className="flex items-center gap-1.5 font-bold text-zinc-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 -m-2 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900">
          <svg className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-all" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 1C5 1 1 4.6 1 9C1 11.4 2.1 13.6 4 15.1V19L8.1 16.9C8.7 17 9.4 17 10 17C15 17 19 13.4 19 9C19 4.6 15 1 10 1Z" />
          </svg>
          <span className="text-xs sm:text-sm">{commentCount}</span>
        </Link>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          postId={post.id}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Custom Post Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-zinc-950 rounded-xl w-full max-w-xs p-5 shadow-xl animate-in fade-in zoom-in-95 duration-100 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
              </svg>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              {t('deleteTitle')} {/* ✨ Динамик сарлавҳа */}
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-5 leading-normal">
              {t('deleteDesc')} {/* ✨ Динамик тавсиф */}
            </p>
            <div className="flex gap-2.5 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                {t('cancel')} {/* ✨ Жокко чыгаруу / Отмена */}
              </button>
              <button
                type="button"
                onClick={() => handleDeletePost(postToDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer transition-colors shadow-xs"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tanlangan 2-variant: Muloyim yashil effektli Toast bildirishnoma */}
      {showDeleteToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-zinc-900 dark:bg-zinc-950 text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-zinc-800 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs sm:text-sm font-bold text-zinc-100">
              {t('deleteToastTitle')} {/* ✨ Ўчирилди */}
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate">
              {t('deleteToastDesc')} {/* ✨ Жазуу муваффақиятли өчүрүлдү */}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}