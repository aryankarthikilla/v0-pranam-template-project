"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calendar, Tag, TrendingUp } from "lucide-react";
import type { Thought } from "../actions/thoughts-actions";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThoughtsStatsProps {
  thoughts: Thought[];
}

export function ThoughtsStats({ thoughts }: ThoughtsStatsProps) {
  const totalThoughts = thoughts.length;
  const todayThoughts = thoughts.filter((thought) => {
    const today = new Date();
    const thoughtDate = new Date(thought.created_at);
    return thoughtDate.toDateString() === today.toDateString();
  }).length;

  const thisWeekThoughts = thoughts.filter((thought) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thoughtDate = new Date(thought.created_at);
    return thoughtDate >= weekAgo;
  }).length;

  const allTags = thoughts.flatMap((thought) => thought.tags);
  const uniqueTags = [...new Set(allTags)].length;

  const stats = [
    {
      title: "Total Thoughts",
      value: totalThoughts.toString(),
      description: "All time thoughts",
      icon: Brain,
    },
    {
      title: "Today",
      value: todayThoughts.toString(),
      description: "Thoughts today",
      icon: Calendar,
    },
    {
      title: "This Week",
      value: thisWeekThoughts.toString(),
      description: "Thoughts this week",
      icon: TrendingUp,
    },
    {
      title: "Unique Tags",
      value: uniqueTags.toString(),
      description: "Different tags used",
      icon: Tag,
    },
  ];

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Statistics</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronDown className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
          ) : (
            <ChevronUp className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-top-2 duration-300">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
