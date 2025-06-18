"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "cards" | "list";
  onViewChange: (view: "cards" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-border rounded-lg p-1 bg-background">
      <Button
        variant={view === "cards" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className={`h-8 px-3 border-0 ${
          view === "cards"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-transparent text-foreground hover:bg-muted"
        }`}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Cards
      </Button>
      <Button
        variant={view === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={`h-8 px-3 border-0 ${
          view === "list"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-transparent text-foreground hover:bg-muted"
        }`}
      >
        <List className="h-4 w-4 mr-2" />
        List
      </Button>
    </div>
  );
}
