import "@/styles/globals.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
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
  const isInvoicePage = router.pathname.startsWith("/cash/invoice");
  const isPrintPage =
    router.pathname === '/checks/print' ||
    router.pathname === '/cash/invoice/print' ||
    router.pathname === '/cash/suspenceInvoice/[id]' ||
    router.pathname === '/fuel-transactions/report' ||
    router.pathname === '/reports/paymentReport/print';
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
            <AppHeader />
          
          <div className="flex">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Floating sidebar open button for mobile (only when sidebar is closed) */}
          {!sidebarOpen && (
            <button
              type="button"
              className="fixed top-3 left-2 z-50 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-100 border-0 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer sm:hidden"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <Image src="/open-side.svg" alt="expand" width={20} height={20} />
            </button>
          )}
          {/* Expand button for desktop/medium screens */}
          {collapsed && (
            <button
              type="button"
              className="hidden sm:flex fixed left-0 z-50 items-center justify-center w-8 h-8 hover:w-10 hover:h-10 trans bg-gradient-to-r hover:from-gray-400 hover:to-gray-200 border-0 rounded-r-full shadow-lg  hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <Image src="/open-side.svg" alt="expand" width={20} height={20} />
            </button>
          )}
          <main className="flex  px-2 w-full h-screen overflow-y-auto">
            <Toaster position="top-right" richColors size="lg" />
            <Component {...pageProps} />
          </main>
          </div>
        </>
      )}
    </AuthProvider>
  );
}
