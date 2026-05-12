import './css/style.css'
import { Inter } from 'next/font/google'
import ThemeProvider from "@/components/ThemeProvider"
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales, defaultLocale } from '@/i18n'
import { cookies } from 'next/headers'
import { setupGlobalAbortController, abortAllRequests } from '@/app/api/apiClient';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

interface RootLayoutProps {
  children: React.ReactNode
}

// 将cookies的使用移到异步函数中
async function getLocale() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  return localeCookie?.value || defaultLocale
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  // 从cookie获取当前语言
  const locale = await getLocale()
  // 获取消息
  const messages = await getMessages({ locale })
  
  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Neobanker is a modern bank that provides you with a secure and convenient way to manage your finances." />
        <title>Neobanker</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.variable} font-inter antialiased tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="bg-background text-foreground">
                <ClerkProvider>
                  {children}
                </ClerkProvider>
              </div>
            </ThemeProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  )
}