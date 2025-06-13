import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarToggle } from "@/components/sidebar-toggle"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader user={user} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
      <SidebarToggle />
    </SidebarProvider>
  )
}
