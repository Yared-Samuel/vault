import "@/styles/globals.css";
import { AuthProvider } from "@/pages/context/AuthProvider";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/router";
import React, { useState } from "react";
import AppHeader from "@/components/ui/header";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/";
  // Detect invoice page (dynamic route)
  const isInvoicePage = router.pathname.startsWith("/cash/invoice");
  const isPrintPage =
    router.pathname === '/checks/print' ||
    router.pathname === '/cash/invoice/print';
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
          <AppHeader setSidebarOpen={setSidebarOpen} />
          <div className="flex overflow-hidden">

          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* Expand button, only when collapsed and on desktop */}
          {collapsed && (
            <button
              type="button"
              className="hidden sm:flex fixed top-10 left-0 z-50 items-center justify-center w-5 h-5 hover:w-8 hover:h-8 trans bg-gradient-to-r from-teal-400 to-cyan-500 border-0 rounded-r-full shadow-lg hover:from-teal-500 hover:to-cyan-600 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <main className="p-6 pt-16 w-full h-screen overflow-y-auto">
            <Component {...pageProps} />
            <Toaster position="top-right" richColors />
          </main>
          </div>
        </>
      )}
    </AuthProvider>
  );
}
