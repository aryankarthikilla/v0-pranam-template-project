"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calendar, Tag, TrendingUp } from "lucide-react";
import type { Thought } from "../actions/thoughts-actions";

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
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
  );
}
