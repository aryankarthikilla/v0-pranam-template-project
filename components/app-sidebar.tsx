"use client"

import { Home, Settings, Users, BarChart3, FileText, HelpCircle, User, CheckSquare } from "lucide-react"
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
import Link from "next/link"

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
      title: t("tasks"),
      url: "/tasks",
      icon: CheckSquare,
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
    const menuButton = (
      <SidebarMenuButton asChild className="text-foreground hover:bg-muted hover:text-primary transition-colors w-full">
        <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{menuButton}</div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-popover text-popover-foreground border border-border shadow-lg rounded-md px-3 py-2"
              sideOffset={8}
            >
              <p className="text-sm font-medium">{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return menuButton
  }

  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/50">
        <div className={`px-3 py-3 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Logo size={isCollapsed ? "xs" : "sm"} />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wider">
              {t("mainMenu")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuItemWithTooltip item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wider">
              {t("support")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
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
