"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Layklar sonini olish
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      setLikeCount(count || 0);

      // User layk bosganligini tekshirish
      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();
        if (data) setLiked(true);
      }
    }
    fetchData();
  }, [postId]);

  const toggleLike = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Войдите в систему, чтобы поставить лайк!");
      setLoading(false);
      return;
    }

    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLikeCount(prev => prev - 1);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
      setLikeCount(prev => prev + 1);
      setLiked(true);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleLike}
      disabled={loading}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200
        ${liked ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}
        border border-transparent hover:border-zinc-300 active:scale-95 font-medium
      `}
    >
      <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
      <span>{likeCount} {liked ? 'Нравится' : 'Нравится'}</span>
    </button>
  );
}