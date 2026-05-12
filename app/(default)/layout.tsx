'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { memo, Suspense } from 'react'
import Footer from '@/components/ui/footer'
import NavBar from "@/components/ui/NavBar";
import { BankProvider } from "@/contexts/BankContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatBubble from "@/components/chat/ChatBubble";
import "../css/global.css"
import { setupGlobalAbortController, abortAllRequests } from '@/app/api/apiClient'; // 新增导入
import { usePathname } from 'next/navigation';
// 使用 memo 包装静态组件，避免不必要的重新渲染
const MemoizedNavBar = memo(NavBar);
const MemoizedFooter = memo(Footer);

export default function OptimizedDefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  }, [])
   // 监听路径变化，页面切换时中止请求
  useEffect(() => {
    // 页面加载或切换时设置新的AbortController
    setupGlobalAbortController();
    
    return () => {
      // 页面卸载时中止所有未完成的请求
      abortAllRequests();
    };
  }, [pathname]) // 监听路径变化
  return (
    <BankProvider>
      <ChatProvider>
        <MemoizedNavBar />

        <main className="grow">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>

        <MemoizedFooter />
        <ChatBubble />
      </ChatProvider>
    </BankProvider>
  )
}
