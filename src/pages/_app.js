import "@/styles/globals.css";
import { AuthProvider } from "@/pages/context/AuthProvider";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/router";
import React, { useState } from "react";
import AppHeader from "@/components/ui/header";
import Image from "next/image";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/";
  // Detect invoice page (dynamic route)
  const isInvoicePage = router.pathname.startsWith("/cash/invoice");
  const isPrintPage =
    router.pathname === '/checks/print' ||
    router.pathname === '/cash/invoice/print' ||
    router.pathname === '/cash/suspenceInvoice/[id]';
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : isInvoicePage ? (
        <Component {...pageProps} />
      ) : isPrintPage ? (
        <Component {...pageProps} />
      ) : (
        <>
          
          <div className="flex">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Expand button, only when collapsed and on desktop */}
          {collapsed && (
            <button
              type="button"
              className=" fixed left-0 z-50 items-center justify-center w-8 h-8 hover:w-10 hover:h-10 trans bg-gradient-to-r hover:from-gray-400 hover:to-gray-200 border-0 rounded-r-full shadow-lg  hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
            <Image src="/open-side.svg" alt="expand" width={20} height={20} />
              {/* <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> */}
            </button>
          )}
          <main className="flex pt-12 px-2 w-full h-screen overflow-y-auto">
            <Toaster position="top-right" richColors size="lg" />
            <AppHeader />
            <Component {...pageProps} />
          </main>
          </div>
        </>
      )}
    </AuthProvider>
  );
}
