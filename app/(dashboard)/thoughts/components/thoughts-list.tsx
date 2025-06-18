"use client";

import { ThoughtCard } from "./thought-card";
import type { Thought } from "../actions/thoughts-actions";
import { Brain } from "lucide-react";

interface ThoughtsListProps {
  thoughts: Thought[];
}

export function ThoughtsList({ thoughts }: ThoughtsListProps) {
  if (thoughts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          No thoughts yet
        </h3>
        <p className="text-muted-foreground text-lg">
          Start by adding your first thought!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {thoughts.map((thought) => (
        <ThoughtCard key={thought.id} thought={thought} />
      ))}
    </div>
  );
}
