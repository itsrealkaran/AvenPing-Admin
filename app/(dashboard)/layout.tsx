"use client";

import SidebarContainer from "@/components/layout/sidebar-container";
import Header from "@/components/layout/header";
import { CompanyProvider } from "@/context/company-provider";
import { UserProvider } from "@/context/user-context";

function DashboardContent({ children }: { children: React.ReactNode }) {

  // Define navigation items with typed icon names
  const navigationItems = [
    {
      iconName: "LayoutDashboard" as const,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      iconName: "Users" as const,
      label: "Admin",
      href: "/admin",
    },
  ];

  return (
    <>
      <div className="flex h-screen overflow-hidden relative py-2">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/bg-gradient.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/bg-bottom.svg')",
            backgroundSize: "contain",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat",
          }}
        />
        <SidebarContainer
          brand={{
            name: "AvenPing",
            logo: "/AvenPing-Logo.svg",
          }}
          navigationItems={navigationItems}
        />
        <div className="flex flex-col flex-1 relative overflow-hidden bg-white rounded-xl mr-2 border-[#E0DADA] border-5">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <CompanyProvider>
        <DashboardContent>{children}</DashboardContent>
      </CompanyProvider>
    </UserProvider>
  );
}
