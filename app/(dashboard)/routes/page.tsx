"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  CheckSquare,
  FileText,
  Home,
  List,
  Settings,
  Shuffle,
  User,
  Users,
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  BookOpenCheck,
  SquarePen,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const allRoutes = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Thoughts", path: "/thoughts", icon: Brain },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Manage Tasks", path: "/tasks/manage", icon: List },
  { label: "Random Task", path: "/tasks/random", icon: Shuffle },
  { label: "Task Settings", path: "/tasks/settings", icon: Settings },
  { label: "AI Logs", path: "/ai-logs", icon: Brain },
  { label: "Users", path: "/users", icon: Users },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Help Center", path: "/help", icon: HelpCircle },
  { label: "Subjects", path: "/subjects", icon: BookOpenCheck },
  { label: "New Subject", path: "/subjects/new", icon: SquarePen },
];

export default function RoutesLibraryPage() {
  const [query, setQuery] = useState("");

  const filteredRoutes = allRoutes.filter((route) =>
    `${route.label} ${route.path}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Route Library</CardTitle>
          <p className="text-sm text-muted-foreground">
            Search and access all available routes
          </p>
        </CardHeader>

        <CardContent>
          <Input
            placeholder="Search routes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredRoutes.map(({ label, path, icon: Icon }) => (
              <Link
                href={path}
                key={path}
                className="flex items-center gap-3 rounded-md px-4 py-2 border hover:bg-accent hover:text-primary transition-colors group text-sm"
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                <span className="font-medium">{label}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {path}
                </span>
              </Link>
            ))}
            {filteredRoutes.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No matching routes.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
