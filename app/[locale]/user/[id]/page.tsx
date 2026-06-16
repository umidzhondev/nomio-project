import { createClient } from '@/lib/supabase/server'; // Server component uchun to'g'ri client
import ProfileView from '@/components/ProfileView';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Sessiyani olish (O'zimizmi yoki yo'qmi bilish uchun)
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // 2. Foydalanuvchini bazadan olish
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  // 3. Postlarni olish
  const { data: rawPosts } = await supabase
    .from('posts')
    .select(`
      *, 
      profiles(username), 
      comments(count)
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  const posts = rawPosts?.map(post => ({
    ...post,
    comment_count: post.comments && post.comments.length > 0 ? post.comments[0].count : 0
  }));

  if (!profile) return <div className="p-10 text-center">Foydalanuvchi topilmadi</div>;

  return (
    <ProfileView 
      profile={profile} 
      posts={posts || []} 
      isOwnProfile={profile.id === currentUserId} // Endi bu dinamik ishlaydi
    />
  );
}