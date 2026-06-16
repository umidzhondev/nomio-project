import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
    const { locale, category: categoryId } = await params;
    const supabase = await createClient();

    // 1. Joriy foydalanuvchini olish (isOwner ni tekshirish uchun)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Kategoriyani bazadan olish
    const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

    if (!categoryData) {
        notFound();
    }

    // 3. Postlarni VA ularning statistikalarini olish (count)
    const { data: postsRaw } = await supabase
        .from('posts')
        .select('*, profiles(*), comments(count), likes(count)') 
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

    // 4. Joriy foydalanuvchining Like va Save'larini aniqlash (1 ta tezkor so'rov bilan)
    let userLikes: string[] = [];
    let userSaves: string[] = [];

    if (user && postsRaw && postsRaw.length > 0) {
        const postIds = postsRaw.map(p => p.id);
        
        // Barcha postlar uchun userning like va savelarini birdaniga olamiz (N+1 muammosini oldini olish uchun)
        const [likesRes, savesRes] = await Promise.all([
            supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
            supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        ]);
        
        userLikes = likesRes.data?.map(l => l.post_id) || [];
        userSaves = savesRes.data?.map(s => s.post_id) || [];
    }

    // 5. Ma'lumotlarni PostCard kutayotgan aniq formatga moslash
    const posts = postsRaw?.map((post: any) => ({
        ...post,
        like_count: post.likes?.[0]?.count || 0,
        comment_count: post.comments?.[0]?.count || 0,
        is_liked: userLikes.includes(post.id),
        is_saved: userSaves.includes(post.id)
    })) || [];

    return (
       <div className="py-8">
            {/* TITLE VA CHIZIQ: Dark Mode tizimiga to'liq moslashtirildi */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
                    {categoryData.name}
                </h1>
                <div className="w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-3 rounded-full transition-colors duration-200"></div>
            </div>

            {/* Postlar ro'yxati */}
            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            isOwner={user?.id === post.user_id} 
                        />
                    ))
                ) : (
                    <div className="text-center py-20 text-zinc-500">
                       Пока что нет 
                    </div>
                )}
            </div>
        </div>
    );
}