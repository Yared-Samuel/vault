import * as React from "react";

export function Sidebar({ className = "", ...props }) {
  return <aside className={`flex flex-col ${className}`} {...props} />;
}

export function SidebarHeader({ className = "", ...props }) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export function SidebarMenu({ className = "", ...props }) {
  return <nav className={`flex flex-col gap-2 ${className}`} {...props} />;
}

export function SidebarMenuItem({ className = "", ...props }) {
  return <div className={`w-full ${className}`} {...props} />;
}

export function SidebarMenuButton({ className = "", ...props }) {
  return <button className={`flex items-center w-full px-2 py-2 rounded hover:bg-muted transition ${className}`} {...props} />;
} 