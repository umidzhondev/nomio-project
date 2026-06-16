'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useParams, notFound } from 'next/navigation';
import CommentSection from '@/components/CommentSection';
import PostActions from '@/components/PostActions';
import Link from 'next/link';

export default function PostDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const locale = params.locale as string || 'ru';

    // 1. Post va statuslarni olish (Kesh orqali)
    const { data: postData, isLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // Postni va bazadagi ma'lumotlarni olish
            const { data: post, error } = await supabase
                .from('posts')
                .select(`*, profiles(username, avatar_url), categories(name)`)
                .eq('id', id)
                .maybeSingle();

            if (error || !post) throw new Error("Post topilmadi");

            // Like va Save statuslarini tekshirish
            const [likesRes, likeStatusRes, saveStatusRes] = await Promise.all([
                supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', id),
                user ? supabase.from('likes').select('*').eq('post_id', id).eq('user_id', user.id).maybeSingle() : { data: null },
                user ? supabase.from('saved_posts').select('*').eq('post_id', id).eq('user_id', user.id).maybeSingle() : { data: null }
            ]);

            return {
                ...post,
                likesCount: likesRes.count || 0,
                isLiked: !!likeStatusRes.data,
                isSaved: !!saveStatusRes.data,
                currentUserId: user?.id
            };
        }
    });

    if (isLoading) return <div className="text-center py-20 text-sm text-zinc-500">Загрузка...</div>;
    if (!postData) return notFound();

    const post = postData;
    const isAuthor = post.currentUserId ? post.currentUserId === post.user_id : false;

    // Kategoriya stili funksiyasi
    const getCategoryStyles = (id: number) => {
        const styles: { [key: number]: string } = {
            1: "bg-blue-100 text-blue-700 hover:bg-blue-200",
            2: "bg-purple-100 text-purple-700 hover:bg-purple-200",
            3: "bg-orange-100 text-orange-700 hover:bg-orange-200",
            4: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
            5: "bg-rose-100 text-rose-700 hover:bg-rose-200",
            6: "bg-amber-100 text-amber-700 hover:bg-amber-200",
            7: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
            8: "bg-teal-100 text-teal-700 hover:bg-teal-200"
        };
        return styles[id] || "bg-zinc-100 text-zinc-600 hover:bg-zinc-200";
    };

    return (
        <article className="max-w-3xl mx-auto py-3 sm:py-10 px-3.5 sm:px-6">

            {/* Kategoriya badge */}
            {post.category_id && (
                <Link
                    href={`/${locale}/category/${post.category_id}`}
                    className={`inline-block mb-3 sm:mb-4 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition ${getCategoryStyles(post.category_id)}`}
                >
                    {post.categories.name}
                </Link>
            )}

            {/* Title: Dark Mode uchun to'liq moslashtirildi */}
            <h1 className="text-xl sm:text-2xl md:text-5xl font-extrabold text-[var(--color-text-main)] mb-4 sm:mb-8 tracking-tight leading-tight wrap-break-word transition-colors duration-200">
                {post.title}
            </h1>

            {/* Muallif bloki va Actions: Border ranglari o'zgaruvchiga bog'landi */}
            <div className="flex flex-row items-center justify-between mb-5 sm:mb-8 py-2.5 sm:py-4 border-y border-[var(--color-border-subtle)] gap-2 min-w-0 w-full transition-colors duration-200">

                <Link href={`/${locale}/user/${post.user_id}`} className="flex flex-row items-center gap-2 sm:gap-3 group min-w-0 flex-1 text-left">
                    {/* Avatar */}
                    <div className="shrink-0">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm border dark:border-zinc-800" alt="Avatar" />
                        ) : (
                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 text-xs sm:text-base border border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
                                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>

                    {/* Username va Sana: Dark Modega moslashtirildi */}
                    <div className="flex flex-col min-w-0 text-left items-start justify-center">
                        <span className="font-semibold text-[11px] mb-0.5 sm:text-base text-[var(--color-text-main)] group-hover:underline truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none leading-tight transition-colors duration-200">
                            @{post.profiles?.username}
                        </span>
                        <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none transition-colors duration-200">
                            {new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </Link>

                {/* O'ng tarafdagi Actions (Like, Save va h.k.): Prop orqali userId uzatilgan, ichki o'zgaruvchilarga bog'liq */}
                <div className="shrink-0 flex items-center justify-end">
                    <PostActions
                        postId={id}
                        isAuthor={isAuthor}
                        likes={post.likesCount}
                        isLiked={post.isLiked}
                        isSaved={post.isSaved}
                        userId={post.currentUserId}
                    />
                </div>
            </div>

            {/* Post Image */}
            {post.image_url && (
                <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl mb-5 sm:mb-10 shadow-sm bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 transition-colors duration-200">
                    <img src={post.image_url} className="w-full h-auto max-h-56 sm:max-h-[450px] object-cover" alt={post.title} />
                </div>
            )}

            {/* Matn qismi: Dark Mode matn ranglari o'zgaruvchilarga bog'landi */}
            <div className="prose prose-zinc max-w-none text-[var(--color-text-main)] leading-relaxed">
                {/* Subtitle / Description */}
                <p className="text-[13px] sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium mb-4 sm:mb-6 break-words leading-relaxed transition-colors duration-200">
                    {post.description}
                </p>

                {/* Asosiy Uzun Content TextContent */}
                <div className="whitespace-pre-line break-words text-[var(--color-text-main)] text-xs sm:text-base md:text-lg space-y-4 leading-relaxed tracking-normal transition-colors duration-200">
                    {post.content}
                </div>
            </div>

            {/* Kommentariyalar bo'limi: Kontur liniyasi o'zgaruvchiga o'tkazildi */}
            <div className="mt-8 sm:mt-16 pt-5 sm:pt-8 border-t border-[var(--color-border-subtle)] transition-colors duration-200">
                <CommentSection postId={id} />
            </div>

        </article>
    );
}