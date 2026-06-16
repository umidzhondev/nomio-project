import '../globals.css';
import { Inter, Orbitron } from 'next/font/google';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';
import AuthButton from '@/components/AuthButton';
import CategorySidebar from '@/components/CategorySidebar';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { NextIntlClientProvider } from 'next-intl';
import ClientProviders from '@/components/ClientProviders'; // ✨ Yangi xavfsiz qobiq ulandi
import { getTranslations } from 'next-intl/server'; // ✨ Server tarjima funksiyasi import qilindi
const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export default async function RootLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Dinamik kategoriyalarni olish
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name')
    .order('id', { ascending: true });

  // Ma'lumotni tayyorlash
  const categories = categoriesData?.map(cat => ({
    id: cat.id,
    name: cat.name
  })) || [];

  const { locale } = await params;

  // ✨ 1. Server darajasida Sidebar tarjimalarini yuklaymiz
  const t = await getTranslations({ locale, namespace: 'Sidebar' });

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    messages = {};
  }
  

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} ${orbitron.variable} bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200`}>
        <Toaster position="bottom-right" richColors />

        {/* 🛠️ ESKI THEMEPROVIDER ALMASHTIRILDI: Skript xatosini yo'qotuvchi No-SSR qobiq */}
        <ClientProviders>
          <ReactQueryProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>

              <header className="border-b border-zinc-100 dark:border-zinc-900 fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50 transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-3 md:px-6 h-16 flex items-center justify-between">

                  {/* Chap tomon: Logo */}
                  <div className="flex items-center flex-shrink-0">
                    <Link href={`/${locale}`} className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      NOMIO.
                    </Link>
                  </div>

                  {/* Markaz: Qidiruv paneli (Desktop) */}
                  <div className="hidden sm:block flex-1 max-w-xs md:max-w-sm mx-4">
                    <SearchInput />
                  </div>

                  {/* O'ng tomon: Amallar */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold flex-shrink-0">
                    <LanguageSwitcher currentLocale={locale} />
                    <ThemeToggle />

                    {/* Post qo'shish tugmasi: Mobil uchun "+" ikonka, Desktop uchun yozuv */}
                    <Link
                      href={`/${locale}/write`}
                      className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-all text-xs font-bold cursor-pointer flex-shrink-0"
                    >
                      <span className="hidden sm:inline">{t('addPost')}</span>
                      <span className="sm:hidden text-lg">+</span>
                    </Link>

                    {/* AuthButton */}
                    <div className="h-9 flex items-center [&_button]:h-9 [&_button]:rounded-xl [&_button]:border [&_button]:border-zinc-200 [&_button]:dark:border-zinc-800 [&_button]:bg-zinc-50 [&_button]:dark:bg-zinc-900 [&_button]:px-3 sm:[&_button]:px-4 [&_button]:text-xs [&_button]:font-bold [&_button]:text-zinc-800 [&_button]:dark:text-zinc-200 [&_button]:hover:bg-zinc-100 [&_button]:dark:hover:bg-zinc-800 [&_button]:transition-all [&_button]:cursor-pointer">
                      <AuthButton initialUser={user} />
                    </div>
                  </div>
                </div>
              </header>

              {/* Asosiy Grid */}
              <div className="max-w-6xl mx-auto flex pt-16">
                {/* Desktop Sidebar (Left) */}
                <aside className="w-64 pt-10 px-6 hidden md:block flex-shrink-0">
                  <nav className="flex flex-col gap-2 sticky top-24">
                    <Link href={`/${locale}`} className="flex items-center gap-4 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all font-medium text-lg cursor-pointer">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      {t('home')}
                    </Link>

                    <Link href={`/${locale}/search`} className="flex items-center gap-4 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all font-medium text-lg cursor-pointer">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      {t('search')}
                    </Link>

                    <Link href={`/${locale}/profile?tab=saved`} className="flex items-center gap-4 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all font-medium text-lg cursor-pointer">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {t('saved')}
                    </Link>

                    <Link href={`/${locale}/profile`} className="flex items-center gap-4 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all font-medium text-lg cursor-pointer">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {t('profile')}
                    </Link>

                    <Link href={`/${locale}/users`} className="flex items-center gap-4 px-4 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all font-medium text-lg cursor-pointer">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {t('users')}
                    </Link>
                  </nav>
                </aside>

                {/* MAIN CONTENT CENTER */}
                <main className="flex-1 min-w-0 w-full border-x-0 md:border-x border-zinc-100 dark:border-zinc-800 min-h-screen">
                  <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
                    <div className="lg:hidden mb-2 w-full overflow-hidden">
                      <CategorySidebar locale={locale} categories={categories} />
                    </div>
                    {children}
                  </div>
                </main>

                {/* Category Sidebar (Right) */}
                <aside className="w-64 pt-10 px-6 hidden lg:block flex-shrink-0">
                  <div className="sticky top-24">
                    <CategorySidebar locale={locale} categories={categories} />
                  </div>
                </aside>
              </div>

              {/* MOBIL NAVIGATION MENU */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-around px-4 z-50">
                <Link href={`/${locale}`} className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </Link>

                <Link href={`/${locale}/search`} className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </Link>

                <Link href={`/${locale}/profile?tab=saved`} className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>

                <Link href={`/${locale}/profile`} className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>

                <Link href={`/${locale}/users`} className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </Link>
              </nav>

            </NextIntlClientProvider>
          </ReactQueryProvider>
        </ClientProviders>
      </body>
    </html>
  );
}