/**
 * Demo-minimal Next.js config — strips contentlayer + next-intl wrappers
 * so Day-1 /forecast and /studio pages can compile without those deps
 * being fully configured.
 *
 * Full neobanker-derived config preserved at next.config.original.js.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }, // we'll re-enable when neobanker pages are migrated
  images: { unoptimized: true, remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

module.exports = nextConfig;
