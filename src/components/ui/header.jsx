import React from "react";

export default function AppHeader() {
  return (
    <nav className="fixed  top-0 z-1 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 overflow-x-hidden">
      <div className="px-3 py-1 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">

            <span className="flex ms-2 md:me-24 items-center">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Finance Vault</span>
            </span>
          </div>
          {/* User avatar placeholder */}
          <div className="flex items-center ms-3">
            <div>
              <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false">
                <span className="sr-only">Open user menu</span>
                <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 