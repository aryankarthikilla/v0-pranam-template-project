"use client"

import { Home, Settings, Users, BarChart3, FileText, HelpCircle, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const menuItems = [
  {
    title: "डैशबोर्ड (Dashboard)",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "विश्लेषण (Analytics)",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "उपयोगकर्ता (Users)",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "दस्तावेज़ (Documents)",
    url: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "सेटिंग्स (Settings)",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "प्रोफ़ाइल (Profile)",
    url: "/dashboard/profile",
    icon: User,
  },
]

const supportItems = [
  {
    title: "सहायता केंद्र (Help Center)",
    url: "/dashboard/help",
    icon: HelpCircle,
  },
]

interface AppSidebarProps {
  user: SupabaseUser
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">प्र</span>
          </div>
          <span className="text-lg font-semibold">प्रणाम</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>मुख्य मेनू (Main Menu)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>सहायता (Support)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
