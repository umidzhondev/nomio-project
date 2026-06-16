// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // 🌐 URL segmentidan joriy faol tilni aniqlaymiz (/kg/profile -> 'kg', /ru/login -> 'ru')
  const segments = pathname.split('/');
  const currentLocale = ['ru', 'kg'].includes(segments[1]) ? segments[1] : 'ru';

  // 1. Agar foydalanuvchi login bo'lsa va login/register sahifalarida bo'lsa
  // Dinamik yo'naltirish: joriy til saqlab qolinadi (/kg yoki /ru)
  if (user && (pathname.includes('/login') || pathname.includes('/register'))) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // 2. Agar foydalanuvchi login bo'lmasa va login/register sahifalarida bo'lmasa
  // Dinamik yo'naltirish: joriy til login sahifasiga uzatiladi (masalan: /kg/login)
  if (!user && !pathname.includes('/login') && !pathname.includes('/register')) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  // Supabase kukilarini i18n routing javobiga xavfsiz biriktiramiz
  const i18nResponse = handleI18nRouting(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    i18nResponse.cookies.set(cookie.name, cookie.value);
  });

  return i18nResponse;
}

export const config = {
  matcher: ['/', '/(ru|kg)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};