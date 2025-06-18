"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ThoughtForm } from "./thought-form";
import { ThoughtsList } from "./thoughts-list";
import { ThoughtsStats } from "./thoughts-stats";
import { QuickThoughtInput } from "./quick-thought-input";
import { ViewToggle } from "./view-toggle";
import { ThoughtsListView } from "./thoughts-list-view";
import { ThoughtsFilters } from "./thoughts-filters";
import type { Thought } from "../actions/thoughts-actions";

interface FiltersState {
  mood: string;
  tags: string[];
  dateRange: string;
  search: string;
}

interface ThoughtsPageClientProps {
  thoughts: Thought[];
}

export function ThoughtsPageClient({ thoughts }: ThoughtsPageClientProps) {
  const [view, setView] = useState<"cards" | "list">("cards");
  const [filters, setFilters] = useState<FiltersState>({
    mood: "",
    tags: [],
    dateRange: "",
    search: "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Thoughts
          </h1>
          <p className="text-muted-foreground">
            Capture and organize your thoughts, ideas, and reflections
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={setView} />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-border">
                <Plus className="h-4 w-4 mr-2" />
                Detailed Thought
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  Add Detailed Thought
                </DialogTitle>
              </DialogHeader>
              <ThoughtForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Thought Input */}
      <QuickThoughtInput />

      {/* Filters - only show in list view */}
      {view === "list" && (
        <ThoughtsFilters filters={filters} onFiltersChange={setFilters} />
      )}

      {/* Stats */}
      <ThoughtsStats thoughts={thoughts} />

      {/* Content based on view */}
      {view === "cards" ? (
        <ThoughtsList thoughts={thoughts} />
      ) : (
        <ThoughtsListView thoughts={thoughts} filters={filters} />
      )}
    </div>
  );
}
