'use client'

import { useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import AOS from 'aos'
import 'aos/dist/aos.css'


import Footer from '@/components/ui/footer'
import NavBar from "@/components/ui/NavBar";
import "../css/global.css"

export default function DefaultLayout({
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
  })

  return (
    // <ClerkProvider>
    <>
      <NavBar />
      
      <main className="grow">

        {children}

      </main>

      <Footer />
     {/* </ClerkProvider> */}
    </>
  )
}
