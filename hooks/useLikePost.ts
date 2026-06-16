import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export const useLikePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Tizimga kirmagan");
      // RPC server tomonida state'ni o'zi almashtiradi
      await supabase.rpc('toggle_like', { p_post_id: postId, p_user_id: user.id });
    },
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['profile-posts'] });

      const updateCache = (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((post: any) => post.id === postId ? {
          ...post,
          is_liked: !post.is_liked,
          like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
        } : post);
      };

      queryClient.setQueriesData({ queryKey: ['posts'] }, updateCache);
      queryClient.setQueriesData({ queryKey: ['profile-posts'] }, updateCache);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
    },
  });
};