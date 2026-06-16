'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import ProfileView from '@/components/ProfileView';
import PostCard from '@/components/PostCard';
import { toast } from 'sonner';

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const currentTabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'saved' || tab === 'posts') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // 1. Profil ma'lumotlarini olish
    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile-data'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            return data;
        }
    });

    // 2. Postlarni olish
    const { data: posts = [], isLoading: isPostsLoading } = useQuery({
        queryKey: ['profile-posts', activeTab],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            let data: any[] = [];
            let error: any = null;

            if (activeTab === 'posts') {
                const res = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles (username),
                        comments (count),
                        likes (user_id),
                        saved_posts (user_id)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                data = res.data || [];
                error = res.error;
            } else {
                const { data: savedIds } = await supabase
                    .from('saved_posts')
                    .select('post_id')
                    .eq('user_id', user.id);

                const ids = savedIds?.map(item => item.post_id) || [];

                if (ids.length > 0) {
                    const res = await supabase
                        .from('posts')
                        .select(`
                            *,
                            profiles (username),
                            comments (count),
                            likes (user_id),
                            saved_posts (user_id)
                        `)
                        .in('id', ids)
                        .order('created_at', { ascending: false });
                    data = res.data || [];
                    error = res.error;
                }
            }

            if (error) throw error;

            return data.map((post: any) => ({
                ...post,
                like_count: post.likes ? post.likes.length : 0,
                is_liked: post.likes ? post.likes.some((l: any) => l.user_id === user.id) : false,
                is_saved: post.saved_posts ? post.saved_posts.some((s: any) => s.user_id === user.id) : true,
                comment_count: post.comments && post.comments.length > 0 ? post.comments[0].count : 0
            }));
        }
    });
    
    const queryClient = useQueryClient();

    const handleDelete = async (postId: string) => {
        const { error } = await supabase.from('posts').delete().eq('id', postId);

        if (error) {
            toast.error("Ошибка при удалении публикации: " + error.message);
        } else {
            toast.success("Публикация успешно удалена");
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
        }
    };

    if (isProfileLoading || isPostsLoading) {
        return <div className="text-center py-20 text-sm text-zinc-500">Загрузка...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-2 md:py-6">
            <ProfileView
                profile={profile}
                isOwnProfile={true}
            />

            {/* TAB MENU */}
            <div className="flex gap-6 sm:gap-8 border-b border-[var(--color-border-subtle)] mt-2 mb-6 px-4 text-sm sm:text-base transition-colors duration-200">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`pb-3 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'posts' 
                            ? 'border-b-2 border-[var(--color-text-main)] text-[var(--color-text-main)]' 
                            : 'text-zinc-400 hover:text-[var(--color-text-main)]'
                    }`}
                >
                    Мои публикации
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`pb-3 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'saved' 
                            ? 'border-b-2 border-[var(--color-text-main)] text-[var(--color-text-main)]' 
                            : 'text-zinc-400 hover:text-[var(--color-text-main)]'
                    }`}
                >
                    Сохраненные
                </button>
            </div>

            {/* Postlar ro'yxati */}
            <div className="space-y-4 sm:space-y-6 pb-12 md:pb-20">
                {posts.length > 0 ? (
                    posts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isOwner={profile?.id === post.user_id}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className="text-center text-zinc-500 py-12 text-sm">
                        {activeTab === 'posts' ? 'У вас пока нет публикаций.' : 'Нет сохраненных публикаций.'}
                    </p>
                )}
            </div>
        </div>
    );
}