'use client'
import React, { useEffect } from 'react';
import NavBar from "@/components/ui/NavBar";
import { BankProvider } from "@/contexts/BankContext"; // 添加这行导入
import { useTranslations } from 'next-intl';
export default function CustomAuth({children}: {children: React.ReactNode}){
  const t = useTranslations('Common');
  useEffect(() => {
    // 方法1：平滑滚动
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });

    // 方法2：立即滚动（无动画）
    // window.scrollTo(0, document.documentElement.scrollHeight);
  }, []);
  return (
    <>
    <BankProvider> 
      <NavBar />
      <div
        className="min-h-screen flex justify-center items-center"
        style={{
          background:
            "linear-gradient(99.83deg, #ED1522 -1.65%, #E66E48 82.54%)",
        }}
      >
        <div className="flex w-full max-w-4xl bg-white bg-opacity-80 rounded-lg shadow-lg overflow-hidden">
          {/* 左侧 logo/文案区 */}
          <div className="hidden md:flex flex-col justify-between items-center w-1/2 p-10">
            {/* 可放 logo、文案等 */}
            <div className="flex items-center flex-end">
              <img
                src="./images/LogoRedSQ.svg"
                alt="logo"
                className="h-10 mx-auto"
              />
              <div style={{
                color: "#991B1B",
                fontSize: "24px",
                fontWeight: 600,
                display: 'flex',
                alignItems: 'flex-end',
                height: '45px'}}>Banker</div>
              </div>
            <div>
              <img src="/images/login/loginBackground.svg" />
            </div>
            <div>
              <h2 style={{textAlign: "center", color: "black"}} className="text-xl font-bold mb-2">{t('welcome')}</h2>
              <p style={{textAlign: "center"}} className="text-gray-600">{t('description')}</p>
            </div>
          </div>
          {/* 右侧内容区 */}
          <div className="flex-1 flex flex-col p-8">
            {children}
          </div>
        </div>
      </div>
      </BankProvider>
    </>
  )
}