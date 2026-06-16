import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['ru', 'kg'], // Bizning tillar
  defaultLocale: 'ru'    // Asosiy til
});
 
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);