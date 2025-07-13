"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, User, Calendar, Route, LogOut, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface DriverSidebarProps {
  userId: string;
}

export function DriverSidebar({ userId }: DriverSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = [
    {
      title: "Tableau de bord",
      icon: BarChart3,
      href: `/dashboard/driver/${userId}`,
    },
    {
      title: "Profil",
      icon: User,
      href: `/dashboard/driver/${userId}/profile`,
    },
    {
      title: "Réservations reçues",
      icon: Calendar,
      href: `/dashboard/driver/${userId}/reservations`,
    },
    {
      title: "Mes trajets",
      icon: Route,
      href: `/dashboard/driver/${userId}/trips`,
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Chauffeur</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="w-full justify-start">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <Button
          onClick={async () => {
            await logout();
            router.push("/auth/login");
          }}
          variant="outline"
          className="w-full justify-start bg-transparent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
