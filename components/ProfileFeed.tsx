'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import PostCard from './PostCard';

export default function ProfileFeed({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'my' | 'saved'>('my');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['profile-posts', userId, activeTab],
    // queryFn ichidagi qismni mana buga o'zgartiring:
    queryFn: async () => {
      // 1. Asosiy select so'rovi (saved_posts yoniga !inner qo'shildi)
      let query = supabase
        .from('posts')
        .select(`
      *, 
      profiles(username), 
      likes(user_id), 
      saved_posts!inner(user_id)
    `);

      // 2. Tabga qarab filterlash mantiqi
      if (activeTab === 'my') {
        // O'ziga tegishli postlar
        query = query.eq('user_id', userId);
      } else {
        // Faqat saqlangan postlarni olish uchun saved_posts ichidagi user_id ni tekshiramiz
        // .innerJoin() o'rniga to'g'ridan-to'g'ri .eq() ishlatiladi
        query = query.eq('saved_posts.user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return data.map((post: any) => ({
        ...post,
        like_count: post.likes ? post.likes.length : 0,
        is_liked: post.likes ? post.likes.some((l: any) => l.user_id === userId) : false,
        // Agar activeTab 'saved' bo'lsa true, 'my' bo'lsa user_id bo'yicha dinamik tekshiramiz
        is_saved: activeTab === 'saved' ? true : (post.saved_posts ? post.saved_posts.length > 0 : false)
      }));
    }
  });

  return (
    <div>
      {/* Tablar */}
      <div className="flex gap-8 border-b border-zinc-200 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 font-medium ${activeTab === 'my' ? 'border-b-2 border-black' : 'text-zinc-500'}`}
        >
          My Posts
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 font-medium ${activeTab === 'saved' ? 'border-b-2 border-black' : 'text-zinc-500'}`}
        >
          Saved Posts
        </button>
      </div>

      {/* Kontent */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {posts?.map((post: any) => (
            <PostCard key={post.id} post={post} isOwner={activeTab === 'my'} />
          ))}
        </div>
      )}
    </div>
  );
}