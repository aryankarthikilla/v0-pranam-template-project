"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, Star, StarOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  FileText,
  FolderOpen,
  BookOpen,
  Layers,
  Terminal,
  BarChart3,
  Cpu,
  Cloud,
  Database,
  Settings,
} from "lucide-react";

const icons: LucideIcon[] = [
  FileText,
  FolderOpen,
  BookOpen,
  Layers,
  Terminal,
  BarChart3,
  Cpu,
  Cloud,
  Database,
  Settings,
];

function getRandomIcon(index: number): LucideIcon {
  return icons[index % icons.length]!;
}

type PageInfo = {
  name: string;
  path: string;
};

export default function ContentsPage() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/contents");
        if (!res.ok) throw new Error("Failed to fetch contents");
        const data: PageInfo[] = await res.json();
        setPages(data);
      } catch (err) {
        console.error("Error loading contents:", err);
      }
    };
    fetchPages();
  }, []);

  const toggleFavorite = (path: string) => {
    setFavorites((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedPages = [
    ...filteredPages.filter((page) => favorites.includes(page.path)),
    ...filteredPages.filter((page) => !favorites.includes(page.path)),
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">All Pages</h1>

      <div className="relative w-full">
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 w-full"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
        {sortedPages.map((page, index) => {
          if (!page.path) return null;

          const parts = page.path
            .replace("/dashboard", "Dashboard")
            .split("/")
            .filter((p) => p && !p.startsWith("["))
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1));

          const label = parts.join(" > ");
          const Icon = getRandomIcon(index);
          const isFav = favorites.includes(page.path);

          return (
            <Card
              key={page.path}
              className={cn(
                "hover:bg-accent/40 transition-shadow hover:shadow-lg border border-border p-4 flex items-center gap-4 justify-between"
              )}
            >
              <div className="flex items-center gap-4 w-full">
                <Icon className="text-muted-foreground" />
                <Link
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium hover:underline flex-1 truncate"
                >
                  {label}
                </Link>
              </div>
              <button
                className="text-muted-foreground hover:text-yellow-500 transition"
                onClick={() => toggleFavorite(page.path)}
              >
                {isFav ? (
                  <Star className="w-4 h-4 fill-yellow-500" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
