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
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Logo } from "@/components/logo"
import { useTranslations } from "@/lib/i18n/hooks"

interface AppSidebarProps {
  user: SupabaseUser
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { t } = useTranslations("common")
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const menuItems = [
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("analytics"),
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: t("users"),
      url: "/users",
      icon: Users,
    },
    {
      title: t("documents"),
      url: "/documents",
      icon: FileText,
    },
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings,
    },
    {
      title: t("profile"),
      url: "/profile",
      icon: User,
    },
  ]

  const supportItems = [
    {
      title: t("helpCenter"),
      url: "/help",
      icon: HelpCircle,
    },
  ]

  const SidebarMenuItemWithTooltip = ({ item }: { item: (typeof menuItems)[0] }) => {
    const content = (
      <SidebarMenuButton asChild className="text-foreground hover:bg-muted hover:text-primary transition-colors">
        <a href={item.url} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>{item.title}</span>}
        </a>
      </SidebarMenuButton>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-popover text-popover-foreground border border-border shadow-md"
              sideOffset={5}
            >
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return content
  }

  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/50">
        <div className="px-2 py-2">
          <Logo size={isCollapsed ? "xs" : "sm"} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-muted-foreground">{t("mainMenu")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-muted-foreground">{t("support")}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
