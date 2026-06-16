import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const useSavePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isSaved: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Tizimga kirmagan");
      
      const { error } = await supabase.rpc('toggle_save', { 
        p_post_id: postId, 
        p_user_id: user.id 
      });

      if (error) throw error;

      // Xato to'g'rilandi: !isSaved o'rniga isSaved qaytaramiz
      return isSaved; 
    },
    
    onSuccess: (isSaved) => {
      // Endi toast xabarlari mantiqan to'g'ri ishlaydi
      toast.success(isSaved ? "Post saqlandi" : "Saqlanganlardan olib tashlandi");
    },

    onError: () => {
      toast.error("Saqlashda xatolik yuz berdi");
    },
    
    onSettled: () => {
      // Zaxira sinxronizatsiyasi uchun keshni yangilab qo'yamiz
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });
};