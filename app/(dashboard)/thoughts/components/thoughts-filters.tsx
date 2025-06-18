"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  Calendar,
  Smile,
  Frown,
  Zap,
  Leaf,
  AlertCircle,
  Heart,
  Sun,
  Brain,
} from "lucide-react";

const moods = [
  { value: "happy", label: "Happy", icon: Smile },
  { value: "sad", label: "Sad", icon: Frown },
  { value: "excited", label: "Excited", icon: Zap },
  { value: "peaceful", label: "Peaceful", icon: Leaf },
  { value: "anxious", label: "Anxious", icon: AlertCircle },
  { value: "grateful", label: "Grateful", icon: Heart },
  { value: "optimistic", label: "Optimistic", icon: Sun },
  { value: "reflective", label: "Reflective", icon: Brain },
];

const dateRanges = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

interface FiltersState {
  mood: string;
  tags: string[];
  dateRange: string;
  search: string;
}

interface ThoughtsFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

export function ThoughtsFilters({
  filters,
  onFiltersChange,
}: ThoughtsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const updateFilters = (updates: Partial<FiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      updateFilters({ tags: [...filters.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFilters({ tags: filters.tags.filter((tag) => tag !== tagToRemove) });
  };

  const clearAllFilters = () => {
    onFiltersChange({ mood: "", tags: [], dateRange: "", search: "" });
  };

  const hasActiveFilters =
    filters.mood ||
    filters.tags.length > 0 ||
    filters.dateRange ||
    filters.search;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Toggle */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200 text-muted-foreground" />
              <Input
                placeholder="Search thoughts..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 bg-background border-border"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-border"
            >
              <Filter className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {
                    [filters.mood, ...filters.tags, filters.dateRange].filter(
                      Boolean
                    ).length
                  }
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid gap-4 md:grid-cols-3 animate-in slide-in-from-top-2 duration-200">
              {/* Mood Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mood
                </label>
                <Select
                  value={filters.mood}
                  onValueChange={(value) => updateFilters({ mood: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Any mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any mood</SelectItem>
                    {moods.map((mood) => {
                      const Icon = mood.icon;
                      return (
                        <SelectItem key={mood.value} value={mood.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
                            {mood.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Date Range
                </label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => updateFilters({ dateRange: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any time</SelectItem>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
                          {range.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag filter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-background border-border"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    size="icon"
                  >
                    <Search className="h-3 w-3 hover:h-4 hover:w-4 transition-all duration-200" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Active Tag Filters */}
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground">
                Tag filters:
              </span>
              {filters.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-2 w-2 hover:h-3 hover:w-3 transition-all duration-200 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
