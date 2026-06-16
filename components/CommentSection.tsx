"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// 1. ZUSTAND IMPORT QILINDI
import { useInteractionStore } from '@/store/useInteractionStore';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl'; // ✨ Import qilindi

export default function CommentSection({ postId }: { postId: string }) {
  const t = useTranslations('CommentSection'); // ✨ Alohida yangi obyekt ulandi
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const locale = (params.locale as string) || 'ru';
  // Komponent tepasidagi state'lar yoniga qo'shing:
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // 2. ZUSTAND HOOK CHAQIRILDI
  const setInteraction = useInteractionStore((state) => state.setInteraction);

  // components/CommentSection.tsx
  // 22-qatordagi useEffect blokini mana buga almashtiring:

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // <--- Dependency massivi bo'sh holatga qaytarildi (Konstant o'lcham)

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (!error) {
      const fetchedComments = data || [];
      setComments(fetchedComments);
      // 3. GLOBAL XOTIRA YANGILANDI
      setInteraction(postId, { commentCount: fetchedComments.length });
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
   if (!user) return toast.error(t('loginRequired')); // ✨ Dinamik xabar
    if (!comment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      post_id: postId, user_id: user.id, content: comment
    });

    if (!error) {
      setComment('');
      fetchComments();
    }
  };

  // Eski handleDelete o'rniga buni qo'ying (confirm olib tashlandi):
  const handleDelete = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    setOpenMenuId(null);
    setCommentToDelete(null); // Modalni yopish
    fetchComments();
  };

  return (
    <div className="w-full mt-8 sm:mt-10">
      {/* TITLE: Dark Mode moslashtirildi */}
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[var(--color-text-main)] transition-colors duration-200">
      {t('title')} ({comments.length})
      </h3>

      {/* Scrollable container */}
      <div className="space-y-4 sm:space-y-6 max-h-125 overflow-y-auto pr-1 sm:pr-2 pb-2 custom-scrollbar">
        {comments.map((c) => (
          <div key={c.id} className="py-3 sm:py-4 border-b border-zinc-100 last:border-0 animate-in fade-in duration-100">
            <div className="flex gap-2.5 sm:gap-3 items-start min-w-0 w-full">

              {/* Avatar va Link */}
              <Link href={`/${locale}/user/${c.user_id}`} className="cursor-pointer shrink-0 mt-0.5">
                {c.profiles?.avatar_url ? (
                  <img src={c.profiles.avatar_url} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm border dark:border-zinc-800" alt="Avatar" />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm border border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
                    {c.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>

              {/* Comment Content qismi */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {/* USERNAME: Dark Mode moslashtirildi */}
                  <Link href={`/${locale}/user/${c.user_id}`} className="min-w-0">
                    <span className="text-[var(--color-text-main)] hover:text-zinc-600 dark:hover:text-zinc-400 text-xs sm:text-sm font-bold cursor-pointer transition-colors block truncate max-w-[140px] sm:max-w-none">
                      @{c.profiles?.username || 'user'}
                    </span>
                  </Link>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 transition-colors duration-200">
                    {new Date(c.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {/* COMMENT TEXT: Dark Mode moslashtirildi */}
                <p className="mt-1.5 sm:mt-2 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-left break-words font-normal transition-colors duration-200">
                  {c.content}
                </p>
              </div>

              {/* 3 nuqta menyusi: Responsive SVG o'rnatildi */}
              <div className="relative shrink-0" ref={openMenuId === c.id ? menuRef : null}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                  className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded-full hover:bg-zinc-50 cursor-pointer transition-colors flex items-center justify-center"
                  aria-label="Options"
                >
                  <svg className="w-[15px] h-[15px] sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="5" r="1" fill="currentColor" />
                    <circle cx="12" cy="19" r="1" fill="currentColor" />
                  </svg>
                </button>

                {openMenuId === c.id && (
                  <div className="absolute right-0 mt-1 w-36 max-[400px]:w-32 bg-white border border-zinc-100 shadow-xl z-10 py-1 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                    {currentUserId === c.user_id ? (
                      <button
                        onClick={() => {
                          setCommentToDelete(c.id); // O'chiriladigan komment ID-sini o'rnatadi (Modal ochiladi)
                          setOpenMenuId(null);       // Dropdown menyuni yopadi
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs max-[400px]:text-[11px] font-semibold text-red-600 cursor-pointer transition-colors hover:bg-red-50"
                      >
                        {t('delete')} {/* ✨ Өчүрүү / Удалить */}
                      </button>
                    ) : (
                      <button className="w-full text-left px-3.5 py-2 text-xs max-[400px]:text-[11px] font-medium text-zinc-600 cursor-pointer transition-colors hover:bg-zinc-50">
                        {t('report')} {/* ✨ Арыздануу / Пожаловаться */}
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* INPUT BO'LIMI (Comment Input va Submit Button) */}
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[var(--color-border-subtle)] pb-12 sm:pb-4 transition-colors duration-200">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 sm:p-4 border border-zinc-200 dark:border-zinc-700 text-[var(--color-text-main)] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 rounded-xl focus:ring-1 focus:ring-[var(--color-text-main)] focus:border-[var(--color-text-main)] outline-none text-xs sm:text-sm bg-zinc-50/30 dark:bg-zinc-900/30 focus:bg-white dark:focus:bg-transparent transition-all resize-none"
          placeholder={t('placeholder')} // ✨ Динамик placeholder
          rows={3}
        />
        <button
          onClick={handleAddComment}
          className="mt-2.5 px-5 py-2 sm:px-6 sm:py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl cursor-pointer hover:bg-black dark:hover:bg-white font-semibold text-xs sm:text-sm border border-transparent transition-all active:scale-[0.99] shadow-sm"
        >
          {t('submit')} {/* ✨ Жөнөтүү / Отправить */}
        </button>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-xl w-full max-w-xs p-5 shadow-xl animate-in fade-in zoom-in-95 duration-100 border border-zinc-100 text-center">

            {/* Diqqat belgisi ixtiyoriy chiroyli SVG */}
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
              </svg>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-zinc-950 mb-1">
             {t('deleteTitle')}
            </h4>
            <p className="text-xs text-zinc-400 font-medium mb-5">
            {t('deleteDesc')}
            </p>

            {/* Harakat tugmalari: To'liq responsive */}
            <div className="flex gap-2.5 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(commentToDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer transition-colors shadow-xs"
              >
                {t('delete')}
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}