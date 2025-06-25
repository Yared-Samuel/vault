import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

export default function AppHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await fetch("/api/users/logout", { method: "POST", headers: { "Content-Type": "application/json" } });
    window.location.href = "/";
  };

  return (
    <nav className="top-0 z-20 w-full bg-[#eeefe0b4] border-b border-[#A7C1A8] shadow-sm transition-all duration-300">
      <div className="px-3 py-1.5 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start pl-6">
            {/* Logo at the top */}
            <div className="">
              <Image src="/Logo.png" alt="Logo" width={40} height={40} style={{objectFit:'contain'}} />
            </div>
          </div>
          {/* User avatar with dropdown */}
          <div className="flex items-center ms-3 relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex text-sm bg-white border border-[#A7C1A8] hover:bg-[#A7C1A8] hover:text-white rounded-full focus:ring-2 focus:ring-[#A7C1A8] transition-all"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <span className="sr-only">Open user menu</span>
              <img className="w-9 h-9 rounded-full border border-[#A7C1A8]" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#A7C1A8] animate-fade-in">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-[#1a202c] hover:bg-[#A7C1A8] hover:text-white rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 