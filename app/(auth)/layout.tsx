"use client";
import NavBar from "@/components/ui/NavBar";
import React from "react";
import { ClerkProvider } from '@clerk/nextjs'
import { useTranslations } from 'next-intl';
import { BankProvider } from "@/contexts/BankContext"; 
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Common');
  return (
    <>
      {/* <ClerkProvider> */}
      <BankProvider>
        <NavBar />
      </BankProvider>
      {/* </ClerkProvider> */}
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
              <h2 style={{textAlign: "center",color: "black"}} className="text-xl font-bold mb-2">{t('welcome')}</h2>
              <p style={{textAlign: "center"}} className="text-gray-600">{t('description')}</p>
            </div>
          </div>
          {/* 右侧内容区 */}
          <div className="flex-1 flex flex-col justify-center items-center p-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
