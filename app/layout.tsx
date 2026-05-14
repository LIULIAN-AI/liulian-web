/**
 * Demo-minimal root layout — bypasses Clerk + next-intl + contentlayer
 * so the /forecast and /studio Day-1 pages can render without all of
 * liulian's auth/i18n/content infrastructure wired up.
 *
 * The full liulian-derived layout is preserved at app/layout.original.tsx
 * and gets restored at M2 when we wire Clerk + next-intl properly.
 */

export const metadata = {
  title: 'LIULIAN — Liquid Intelligence for Time',
  description:
    'Open-source production stack for spatio-temporal AI: research-grade model zoo wrapped in production-grade BI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Brand fonts — pinned snapshot of @liulian/design-tokens font stack */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          background: '#FBFBFA',
          color: '#131313',
          fontFamily: "'Switzer', 'SF Pro Text', system-ui, sans-serif",
          fontSize: 15,
          lineHeight: 1.55,
          fontFeatureSettings: "'ss01', 'ss02', 'kern'",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  );
}
