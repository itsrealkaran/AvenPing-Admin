"use client";

import React from "react";
import Sidebar from "./sidebar";

interface AccountInfoItem {
  name: string;
  number: string;
}

interface SidebarContainerProps {
  brand?: { name: string; logo: string };
  navigationItems: Array<{
    iconName: string;
    label: string;
    href: string;
  }>;
}

export default function SidebarContainer({
  brand,
  navigationItems,
}: SidebarContainerProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <Sidebar
        brand={brand}
        navigationItems={navigationItems}
      />
    </div>
  );
}
