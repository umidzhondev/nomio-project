import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts' // i18n sozlamalar faylimiz yo'li
);

const nextConfig: NextConfig = {
  /* loyihaning boshqa sozlamalari shu yerga yoziladi */
};

export default withNextIntl(nextConfig);