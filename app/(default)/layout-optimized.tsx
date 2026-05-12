'use client'

import { useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { memo, Suspense } from 'react'

import Footer from '@/components/ui/footer'
import NavBar from "@/components/ui/NavBar";
import { BankProvider } from "@/contexts/BankContext";
import "../css/global.css"

// 使用 memo 包装静态组件，避免不必要的重新渲染
const MemoizedNavBar = memo(NavBar);
const MemoizedFooter = memo(Footer);

export default function OptimizedDefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {  

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    // <ClerkProvider>
      <BankProvider>
        <MemoizedNavBar />
        
        <main className="grow">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>

        <MemoizedFooter />
      </BankProvider>
    // </ClerkProvider>
  )
}
