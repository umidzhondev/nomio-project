"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import ReportModal from '@/components/ReportModal';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

export default function PostActions({
    postId,
    isAuthor,
    likes: serverLikes = 0,
    isLiked: serverIsLiked = false,
    isSaved: serverIsSaved = false,
    userId = null
}: any) {
   const t = useTranslations('PostActions');
    const params = useParams();
    const locale = (params.locale as string) || 'ru'; // ✨ Faol tilni aniqlaymiz


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();

    // 1. ZUSTAND GLOBAL STATE
    const overrides = useInteractionStore((state) => state.overrides[postId]);
    const setInteraction = useInteractionStore((state) => state.setInteraction);

    // 2. YAKUNIY QIYMATLAR
    const isLiked = overrides?.isLiked ?? serverIsLiked;
    const likes = overrides?.likesCount ?? serverLikes;
    const isSaved = overrides?.isSaved ?? serverIsSaved;

    // Komponent tepasidagi boshqa state'lar yoniga qo'shing:
    const [showToast, setShowToast] = useState(false);

    // Komponent tepasidagi state'lar yoniga qo'shing:
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const toggleLike = async () => {
        if (!userId) return toast.error(t('loginRequired')); // ✨ Динамик

        const newIsLiked = !isLiked;
        const newLikesCount = newIsLiked ? likes + 1 : likes - 1;

        // UI ni darhol o'zgartiramiz
        setInteraction(postId, { isLiked: newIsLiked, likesCount: newLikesCount });

        const { error } = isLiked
            ? await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId)
            : await supabase.from('likes').insert({ post_id: postId, user_id: userId });

        if (error) {
            toast.error(t('dbError')); // ✨ Динамик
            setInteraction(postId, { isLiked, likesCount: likes }); // Rollback
        } else {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
    };

    const toggleSave = async () => {
       if (!userId) return toast.error(t('loginRequired'));

        const newIsSaved = !isSaved;
        setInteraction(postId, { isSaved: newIsSaved });

        const { error } = isSaved
            ? await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', userId)
            : await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });

        if (error) {
            toast.error(t('dbError'));
             setInteraction(postId, { isSaved }); // Rollback
        } else {
            // ✨ Dinamik toast bildirishnomalari ulandi
            toast.success(newIsSaved ? t('postSaved') : t('postUnsaved'));
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
toast.success(t('toastSuccess'));
        setIsMenuOpen(false);
    };

    const handleDelete = async () => {
        setIsDeleteModalOpen(false); // Tasdiqlash modalini yopamiz

        const { error } = await supabase.from('posts').delete().eq('id', postId);

        if (error) {
           toast.error(t('deleteError') + error.message);
        } else {
            // Muvaffaqiyatli o'chgach, bildirishnomani yoqamiz
            setShowToast(true);

            // 1.5 soniyadan keyin avtomatik ravishda bosh sahifaga o'tkazamiz
            setTimeout(() => {
                setShowToast(false);
              router.push(`/${locale}`);
            }, 1500);
        }
    };

    return (
        <div className="flex items-center justify-center w-full">
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">

                {/* Like Button - Dark Mode va faollik ranglari to'g'rilandi */}
                <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1 max-[400px]:gap-0.5 px-2 max-[400px]:px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition-all cursor-pointer ${isLiked
                        ? 'text-red-600 bg-red-50 dark:bg-red-950/30'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                >
                    <svg className="w-[16px] h-[16px] min-[401px]:w-[18px] min-[401px]:h-[18px] sm:w-[20px] sm:h-[20px] transition-all" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-[11px] min-[401px]:text-xs sm:text-sm font-semibold sm:font-medium">{likes}</span>
                </button>

                {/* Save Button - Dark Mode ranglari moslashtirildi */}
                <button
                    onClick={toggleSave}
                    className={`p-1.5 max-[400px]:p-1 min-[401px]:p-2 sm:p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer ${isSaved
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                >
                    <svg className="w-[17px] h-[17px] min-[401px]:w-[19px] min-[401px]:h-[19px] sm:w-[22px] sm:h-[22px] transition-all" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>

                {/* Dropdown Options Button - Vertikal uch nuqta SVG ikonka bilan */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 max-[400px]:p-1 min-[401px]:p-2 sm:p-2.5 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition cursor-pointer flex items-center justify-center"
                        aria-label="More options"
                    >
                        {/* Vertikal uch nuqta SVG: 400px dan pastda w-[17px] h-[17px] bo'ladi */}
                        <svg
                            className="w-[17px] h-[17px] min-[401px]:w-[19px] min-[401px]:h-[19px] sm:w-[22px] sm:h-[22px] transition-all"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 max-[400px]:w-36 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => router.push(`/edit/${postId}`)}
                                        className="w-full text-left px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-sm max-[400px]:text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                                    >
                                        {t('edit')}
                                    </button>
                                    {/* Dropdown ichidagi o'chirish tugmasini mana buga almashtiring: */}
                                    <button
                                        onClick={() => {
                                            setIsDeleteModalOpen(true); // Tasdiqlash modalini ochish
                                            setIsMenuOpen(false);       // Dropdown menyuning o'zini yopish
                                        }}
                                        className="w-full text-left px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-sm max-[400px]:text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                        {t('delete')}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleShare}
                                className="w-full text-left px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-sm max-[400px]:text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                            >
                                {t('share')}
                            </button>
                            <button
                                onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 max-[400px]:px-3 max-[400px]:py-2 text-sm max-[400px]:text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                            >
                                {t('report')}
                            </button>
                        </div>
                    )}
                </div>


            </div>
            <ReportModal isOpen={isReportModalOpen} postId={postId} onClose={() => setIsReportModalOpen(false)} />


            {/* Custom Post Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
                    <div className="bg-white rounded-xl w-full max-w-xs p-5 shadow-xl animate-in fade-in zoom-in-95 duration-100 border border-zinc-100 text-center">

                        {/* Diqqatni tortuvchi axlat qutisi SVG ikonkasi */}
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                            </svg>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-zinc-950 mb-1">
                      {t('deleteTitle')}
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium mb-5 leading-normal">
                            {t('deleteDesc')}
                        </p>

                        {/* Harakat tugmalari: Loyiha burchak standartlari (rounded-xl) asosida */}
                        <div className="flex gap-2.5 text-xs sm:text-sm font-semibold">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer transition-colors shadow-xs"
                            >
                                {t('delete')}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Muvaffaqiyatli o'chirilganlik haqida chiroyli Toast bildirishnoma */}
            {showToast && (
                <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-zinc-900 text-white px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Muloyim yashil effektli ikonka qutisi */}
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                            {t('deleteToastTitle')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">
                          {t('deleteToastDesc')}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}