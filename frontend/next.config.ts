import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5071', pathname: '/uploads/**' },
      // Add your production domain here when deploying:
      // { protocol: 'https', hostname: 'api.escape4sdg.com', pathname: '/uploads/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
