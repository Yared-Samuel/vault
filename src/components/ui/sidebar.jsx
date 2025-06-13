import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Car,
  Package,
  Fuel,
  BarChart2,
  ChevronRight,
  ChevronDown,
  Users,
  Circle,
  ChevronsLeftRight,
} from "lucide-react";
import Image from "next/image";

const navItems = [

  {
    label: "Payments",
    icon: CreditCard,
    dropdown: [
      { label: "Payment Request", href: "/transactions" , icon: <Circle size={10}/> },
      { label: "Payment Actions", href: "/cash" , icon: <Circle size={10}/> },
    ],
  },
  {
    label: "Check Requests",
    href: "/checks",
    icon: CreditCard,
  },
  
  {
    label: "Vehicles",
    icon: Car,
    dropdown: [
      { label: "Vehicle List", href: "/vehicles" , icon:  <ChevronsLeftRight size={10}/>},
      { label: "New Vehicle", href: "/vehicles/new" , icon:  <ChevronsLeftRight size={10}/>},
      { label: "Fuel Dispense", href: "/fuel-transactions", icon:  <ChevronsLeftRight size={10}/>},
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart2,
  },
  {
    label: "Users",
    icon: Users,
    dropdown: [
      { label: "Register User", href: "/users/register" },
      { label: "User List", href: "/users" },
    ],
  },
];

const handleLogout = async (e) => {
  e.preventDefault();
  try {
    await fetch("/api/users/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    window.location.href = "/";
  } catch (error) {
    window.location.href = "/";
  }
};

export default function AppSidebar({ collapsed, setCollapsed, sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => {
      // If the clicked dropdown is already open, close it
      if (prev[label]) return {};
      // Otherwise, open only this dropdown and close all others
      const newState = {};
      newState[label] = true;
      return newState;
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  console.log(sidebarOpen)

  return (
    
      <div className="pt-13">
        {/* Overlay and sidebar for mobile only */}
        <div className={
          `sm:hidden ${sidebarOpen ? '' : 'hidden'}`
        }>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeSidebar}
            aria-hidden={!sidebarOpen}
          />
          {/* Sidebar */}
          <aside
            id="logo-sidebar"
            className={`fixed top-0 left-0 z-50 w-60 h-screen bg-[#EEEFE0] shadow-lg transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              sm:hidden`}
            aria-label="Sidebar"
          >
            
            {/* Sidebar content (copy from below) */}
            <button
              type="button"
              className=" flex items-center justify-center absolute top-20  left-45 w-9 h-9 bg-gradient-to-l hover:from-gray-400 hover:to-gray-200 border-0 rounded-full shadow-lg   hover:scale-105 active:scale-95 transition-all duration-300 group z-50 cursor-pointer"
              onClick={() => setCollapsed(true) || closeSidebar()}
              title="Collapse sidebar"
            >
              <Image src="/close-side.svg" alt="expand"  width={20} height={20} />
            </button>
            <div className="h-full px-3 pb-8 overflow-y-auto bg-[#EEEFE0] flex flex-col justify-between ">
              
              <ul className="space-y-2 font-small text-sm">
                
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.dropdown) {
                    // Check if any dropdown item is active
                    const isActive = item.dropdown.some((d) => router.pathname === d.href);
                    const isOpen = !!openDropdowns[item.label];
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.label)}
                          className={`flex items-center w-full p-2 rounded-lg group transition-colors duration-150
                            ${isOpen ? 'bg-[#f1f5f9]' : ''}
                            ${isActive ? 'border-l-4 border-[#A7C1A8] bg-[#A7C1A8] text-white font-bold' : 'text-[#1a202c] hover:bg-[#e3e8f0]'}
                          `}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#2563eb]'}`} />
                          <span className="flex-1 ms-3 text-left whitespace-nowrap">{item.label}</span>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 ml-auto text-[#2563eb]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 ml-auto text-[#64748b]" />
                          )}
                        </button>
                        {isOpen && (
                          <ul className="pl-8 mt-1 space-y-1 text-xs" style={{ background: '#f1f5f9', borderRadius: 6 }}>
                            {item.dropdown.map((d) => (
                              <li key={d.href}>
                                <Link
                                  href={d.href}
                                  className={`flex items-center p-2 rounded-lg transition-colors duration-150
                                    ${router.pathname === d.href ? 'bg-[#A7C1A8] text-white font-bold' : 'text-[#1a202c] hover:bg-[#e3e8f0]'}
                                  `}
                                  onClick={closeSidebar}
                                  style={{ marginLeft: 12 }}
                                >
                                  {d.icon && <span className="mr-2">{d.icon}</span>}
                                  <span>{d.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  // Single link
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`flex items-center p-2 rounded-lg group transition-colors duration-150
                          ${router.pathname === item.href ? 'border-l-4 border-[#A7C1A8] bg-[#A7C1A8] text-white font-bold' : 'text-[#1a202c] hover:bg-[#e3e8f0]'}
                        `}
                        onClick={closeSidebar}
                      >
                        <Icon className={`w-5 h-5 ${router.pathname === item.href ? 'text-white' : 'text-[#64748b] group-hover:text-[#2563eb]'}`} />
                        <span className="ms-3">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {/* Logout button at the bottom */}
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-150 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
        {/* Desktop/medium sidebar (original logic) */}
        {!collapsed && (
          <aside
            id="logo-sidebar"
            className="hidden sm:block relative w-60  h-screen bg-[#EEEFE0] transition-transform -translate-x-full sm:translate-x-0 duration-600 ease-in-out"
            aria-label="Sidebar"
          >
   
            {/* Sidebar content (same as above) */}
            <button
              type="button"
              className=" flex items-center justify-center absolute top-0  left-45 w-9 h-9 bg-gradient-to-l hover:from-gray-400 hover:to-gray-200 border-0 rounded-full shadow-lg   hover:scale-105 active:scale-95 transition-all duration-300 group z-50 cursor-pointer"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <Image src="/close-side.svg" alt="expand"  width={20} height={20} />
            </button>
            <div className="h-full px-3 pb-8 overflow-y-auto bg-[#EEEFE0] flex flex-col justify-between ">
              <ul className="space-y-2 font-medium">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  if (item.dropdown) {
                    // Check if any dropdown item is active
                    const isActive = item.dropdown.some((d) => router.pathname === d.href);
                    const isOpen = !!openDropdowns[item.label];
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.label)}
                          className={`flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                        >
                          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                          <span className="flex-1 ms-3 text-left whitespace-nowrap">{item.label}</span>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 ml-auto" />
                          ) : (
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                        {isOpen && (
                          <ul className="pl-8 mt-1 space-y-1 text-xs" style={{ background: '#f1f5f9', borderRadius: 6 }}>
                            {item.dropdown.map((d) => (
                              <li key={d.href}>
                                <Link
                                  href={d.href}
                                  className={`flex items-center p-2 rounded-lg transition-colors duration-150
                                    ${router.pathname === d.href ? 'bg-[#A7C1A8] text-white font-bold' : 'text-[#1a202c] hover:bg-[#e3e8f0]'}
                                  `}
                                  onClick={closeSidebar}
                                  style={{ marginLeft: 12 }}
                                >
                                  {d.icon && <span className="mr-2">{d.icon}</span>}
                                  <span>{d.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  // Single link
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`flex items-center p-2 rounded-lg group transition-colors duration-150
                          ${router.pathname === item.href ? 'border-l-4 border-[#A7C1A8] bg-[#A7C1A8] text-white font-bold' : 'text-[#1a202c] hover:bg-[#e3e8f0]'}
                        `}
                        onClick={closeSidebar}
                      >
                        <Icon className={`w-5 h-5 ${router.pathname === item.href ? 'text-white' : 'text-[#64748b] group-hover:text-[#2563eb]'}`} />
                        <span className="ms-3">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {/* Logout button at the bottom */}
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-150 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                  Logout
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
  );
} 