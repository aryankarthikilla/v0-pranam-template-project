"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, Mail, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from "@/lib/i18n/hooks"

const usersTranslations = {
  title: {
    en: "Users",
    te: "వినియోగదారులు",
  },
  subtitle: {
    en: "Manage your application users",
    te: "మీ అప్లికేషన్ వినియోగదారులను నిర్వహించండి",
  },
  addUser: {
    en: "Add User",
    te: "వినియోగదారుని జోడించండి",
  },
  userManagement: {
    en: "User Management",
    te: "వినియోగదారు నిర్వహణ",
  },
  searchUsers: {
    en: "Search users...",
    te: "వినియోగదారులను వెతకండి...",
  },
  managementDescription: {
    en: "Search and manage all users in your application",
    te: "మీ అప్లికేషన్‌లోని అన్ని వినియోగదారులను వెతకండి మరియు నిర్వహించండి",
  },
  filter: {
    en: "Filter",
    te: "ఫిల్టర్",
  },
  active: {
    en: "Active",
    te: "చురుకుగా",
  },
  inactive: {
    en: "Inactive",
    te: "నిష్క్రియ",
  },
  admin: {
    en: "Admin",
    te: "అడ్మిన్",
  },
  user: {
    en: "User",
    te: "వినియోగదారు",
  },
  viewProfile: {
    en: "View Profile",
    te: "ప్రొఫైల్ చూడండి",
  },
  editUser: {
    en: "Edit User",
    te: "వినియోగదారుని సవరించండి",
  },
  resetPassword: {
    en: "Reset Password",
    te: "పాస్‌వర్డ్ రీసెట్ చేయండి",
  },
  deleteUser: {
    en: "Delete User",
    te: "వినియోగదారుని తొలగించండి",
  },
}

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    status: "Active",
    role: "Admin",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 234 567 8901",
    status: "Active",
    role: "User",
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1 234 567 8902",
    status: "Inactive",
    role: "User",
    avatar: "/placeholder.svg",
  },
]

export default function UsersPage() {
  const { t } = useTranslations(usersTranslations)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("addUser")}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userManagement")}</CardTitle>
          <CardDescription>{t("managementDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("searchUsers")} className="pl-8" />
            </div>
            <Button variant="outline">{t("filter")}</Button>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                        {user.status === "Active" ? t("active") : t("inactive")}
                      </Badge>
                      <Badge variant="outline">{user.role === "Admin" ? t("admin") : t("user")}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("viewProfile")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("editUser")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("resetPassword")}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">{t("deleteUser")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
