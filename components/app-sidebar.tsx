"use client";

import {
  Home,
  Settings,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  User,
  CheckSquare,
  List,
  Cog,
  Brain,
  Shuffle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Logo } from "@/components/logo";
import { useTranslations } from "@/lib/i18n/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface AppSidebarProps {
  user: SupabaseUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { t } = useTranslations("common");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();

  const menuItems = [
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Contents",
      url: "/contents",
      icon: FileText, // or consider BookOpen, NotebookText, LayoutGrid if preferred
    },

    {
      title: "Thoughts",
      url: "/thoughts",
      icon: Brain,
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
      subItems: [
        {
          title: t("tasksDashboard"),
          url: "/tasks",
          icon: CheckSquare,
        },
        {
          title: t("manage"),
          url: "/tasks/manage",
          icon: List,
        },
        {
          title: t("randomTask"),
          url: "/tasks/random",
          icon: Shuffle,
        },
        {
          title: t("settings"),
          url: "/tasks/settings",
          icon: Cog,
        },
      ],
    },
    {
      title: "AI Logs",
      url: "/ai-logs",
      icon: Brain,
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
  ];

  const supportItems = [
    {
      title: t("helpCenter"),
      url: "/help",
      icon: HelpCircle,
    },
  ];

  const SidebarMenuItemWithTooltip = ({
    item,
  }: {
    item: (typeof menuItems)[0];
  }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = pathname.startsWith(item.url);

    if (hasSubItems && !isCollapsed) {
      return (
        <Collapsible defaultOpen={isActive}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="text-foreground hover:bg-muted hover:text-primary transition-colors w-full">
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === subItem.url}
                  >
                    <Link
                      href={subItem.url}
                      className="flex items-center gap-2"
                    >
                      <subItem.icon className="h-3 w-3" />
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const menuButton = (
      <SidebarMenuButton
        asChild
        className="text-foreground hover:bg-muted hover:text-primary transition-colors w-full"
        isActive={pathname === item.url}
      >
        <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="truncate">{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">{menuButton}</div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-card text-card-foreground border border-border shadow-lg rounded-md px-3 py-2 ml-2"
              sideOffset={12}
            >
              <p className="text-sm font-medium">{item.title}</p>
              {hasSubItems && (
                <div className="mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <p
                      key={subItem.title}
                      className="text-xs text-muted-foreground"
                    >
                      {subItem.title}
                    </p>
                  ))}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return menuButton;
  };

  return (
    <Sidebar
      className="border-r border-border bg-background/95 backdrop-blur-sm"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50">
        <div
          className={`px-3 py-3 ${isCollapsed ? "flex justify-center" : ""}`}
        >
          <Logo size={isCollapsed ? "xs" : "sm"} showText={!isCollapsed} />
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
  );
}
