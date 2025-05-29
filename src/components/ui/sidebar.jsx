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
} from "lucide-react";
import Image from "next/image";

const navItems = [
  {
    label: "Payment Request",
    href: "/transactions",
    icon: FileText,
  },
  {
    label: "Finance Payment",
    href: "/cash",
    icon: CreditCard,
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
      { label: "Vehicle List", href: "/vehicles" },
      { label: "New Vehicle", href: "/vehicles/new" },
    ],
  },
  {
    label: "Parts",
    icon: Package,
    dropdown: [
      { label: "Inventory", href: "/parts" },
      { label: "Add/Adjust Part", href: "/parts/new" },
    ],
  },
  {
    label: "Fuel Transactions",
    icon: Fuel,
    href: "/fuel-transactions",
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
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeSidebar = () => setSidebarOpen(false);

  console.log(sidebarOpen)

  return (
    <>
      {/* Sidebar */}
      {!collapsed && (
        <aside
          id="logo-sidebar"
          className="relative w-60  h-screen transition-transform -translate-x-full sm:translate-x-0 duration-600 ease-in-out"
          aria-label="Sidebar"
        >
          {/* Collapse button (desktop only) */}
          <button
            type="button"
            className=" flex items-center justify-center absolute top-0  left-45 w-9 h-9 bg-gradient-to-l hover:from-gray-400 hover:to-gray-200 border-0 rounded-full shadow-lg   hover:scale-105 active:scale-95 transition-all duration-300 group z-50 cursor-pointer"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
          >
            <Image src="/close-side.svg" alt="expand"  width={20} height={20} />
          </button>
          <div className="h-full px-3 pb-8 overflow-y-auto bg-white dark:bg-gray-800 flex flex-col justify-between ">
            <ul className="space-y-2 font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.dropdown) {
                  // Check if any dropdown item is active
                  const isActive = item.dropdown.some((d) => router.pathname === d.href);
                  const isOpen = openDropdowns[item.label] || isActive;
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
                        <ul className="pl-8 mt-1 space-y-1">
                          {item.dropdown.map((d) => (
                            <li key={d.href}>
                              <Link
                                href={d.href}
                                className={`flex items-center p-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${router.pathname === d.href ? "bg-accent text-accent-foreground dark:bg-gray-700 dark:text-white" : ""}`}
                                onClick={closeSidebar}
                              >
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
                      className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${router.pathname === item.href ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                      onClick={closeSidebar}
                    >
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
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
      {/* Overlay for mobile when sidebar is open */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-opacity-30 sm:hidden"
          onClick={closeSidebar}
        />
      )} */}
    </>
  );
} 