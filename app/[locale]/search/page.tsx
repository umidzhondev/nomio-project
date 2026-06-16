import { createClient } from '@/lib/supabase/server';
import PostCard from '@/components/PostCard';
import SearchPageInput from './SearchPageInput';
import { getTranslations } from 'next-intl/server'; // ✨ Server tarjima funksiyasi import qilindi
export default async function SearchPage({
  searchParams,
  params
}: {
  searchParams: Promise<{ q?: string }>;
  params: Promise<{ locale: string }>; // ✨ Next.js params va'dasi (Promise)
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const searchQuery = q?.trim();
const { locale } = await params; // ✨ Joriy tilni oldik ('ru' yoki 'kg')
// ✨ SERVER DARAJASIDA TARJIMANI YUKLAYMIZ
  const t = await getTranslations({ locale, namespace: 'Search' });
  let query = supabase
    .from('posts')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data: posts } = await query;
  const postsList = posts || [];

  return (
    <div className="py-4 md:py-8 pb-20 md:pb-4 max-w-2xl mx-auto px-4 sm:px-0">
      
      {/* DARK MODEGA MOSLASHTIRILGAN VA RUS TILIGA O'GIRILGAN SARLAVHA BLOCKI */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight transition-colors duration-200">
          {/* ✨ Sarlavha dinamik parametrlari bilan tarjimaga ulandi */}
          {searchQuery 
            ? t('resultsTitle', { query: searchQuery }) 
            : t('allPosts')
          }
        </h1>
        <div className="w-10 md:w-12 h-1 bg-zinc-900 dark:bg-zinc-400 mt-2 md:mt-3 rounded-full transition-colors duration-200"></div>
      </div>

      {/* INPUT BLOCKI */}
      <div className="mb-6">
        <SearchPageInput defaultValue={searchQuery || ''} />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {postsList.length > 0 ? (
          postsList.map((post) => (
            <PostCard
              key={post.id}
              post={post} 
              isOwner={false} 
            />
          ))
        ) : (
          /* RUS TILIDAGI EMPTY STATE */
          <div className="text-center py-20 text-zinc-500 text-sm">
           {/* ✨ Dinamik o'zgaruvchi bilan empty state bog'landi */}
            {searchQuery
              ? t('noResults', { query: searchQuery })
              : t('emptyState')
            }
          </div>
        )}
      </div>
    </div>
  );
}