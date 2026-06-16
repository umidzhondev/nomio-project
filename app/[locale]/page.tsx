import { createClient } from '@/lib/supabase/server';
import PostFeed from '@/components/PostFeed'; // Umumiy PostFeed

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PostFeed currentUserId={user?.id || null} />
  );
}