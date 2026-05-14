'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BankProvider } from '@/contexts/BankContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { setupGlobalAbortController, abortAllRequests } from '@/app/api/apiClient';
import '../css/global.css';

export default function AssistantGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    setupGlobalAbortController();
    return () => {
      abortAllRequests();
    };
  }, [pathname]);

  return (
    <BankProvider>
      <ChatProvider>{children}</ChatProvider>
    </BankProvider>
  );
}
