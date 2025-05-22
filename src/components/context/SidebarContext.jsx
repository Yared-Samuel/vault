import React, { createContext, useState, useContext } from "react";

export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
} 