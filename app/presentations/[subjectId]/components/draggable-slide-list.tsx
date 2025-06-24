"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Edit, Copy, Trash2 } from "lucide-react";
import { reorderSlides } from "../../actions/presentation-actions";
import type { Slide } from "@/types/presentation";

interface DraggableSlideListProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onSlideEdit: (slide: Slide) => void;
  onSlidesReorder: (slides: Slide[]) => void;
  onSlideDuplicate?: (slideId: string) => void;
  onSlideDelete?: (slideId: string) => void;
  selectedSlideId?: string;
}

export function DraggableSlideList({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onSlideEdit,
  onSlidesReorder,
  onSlideDuplicate,
  onSlideDelete,
  selectedSlideId,
}: DraggableSlideListProps) {
  const [draggedSlide, setDraggedSlide] = useState<Slide | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, slide: Slide) => {
    setDraggedSlide(slide);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedSlide) return;

    const dragIndex = slides.findIndex((slide) => slide.id === draggedSlide.id);
    if (dragIndex === dropIndex) return;

    // Create new order
    const newSlides = [...slides];
    const removedSlides = newSlides.splice(dragIndex, 1);
    const removed = removedSlides[0];

    // Add safety check for removed slide
    if (!removed) return;

    newSlides.splice(dropIndex, 0, removed);

    // Update slide order in database
    try {
      const slideIds = newSlides.map((slide) => slide.id);
      // Add null check for slides array and first slide
      const firstSlide = slides[0];
      if (slides.length > 0 && firstSlide) {
        await reorderSlides(firstSlide.subject_id, slideIds);
      }
    } catch (error) {
      console.error("Failed to reorder slides:", error);
    }

    // Update local state
    onSlidesReorder(newSlides);
    setDraggedSlide(null);
  };

  const handleDragEnd = () => {
    setDraggedSlide(null);
    setDragOverIndex(null);
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case "title":
        return "bg-blue-100 text-blue-800";
      case "section":
        return "bg-purple-100 text-purple-800";
      case "code":
        return "bg-green-100 text-green-800";
      case "image":
        return "bg-orange-100 text-orange-800";
      case "quiz":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 overflow-auto p-2 space-y-2">
      {slides.map((slide, index) => (
        <Card
          key={slide.id || index}
          className={`cursor-pointer transition-all duration-200 ${
            index === currentSlideIndex
              ? "ring-2 ring-primary bg-accent/20"
              : "hover:bg-accent/10"
          } ${dragOverIndex === index ? "border-primary border-2" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, slide)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onClick={() => onSlideSelect(index)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
                  {index + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {slide.title}
                  </h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getSlideTypeColor(
                      slide.slide_type || "content"
                    )}`}
                  >
                    {slide.slide_type || "content"}
                  </Badge>
                </div>
                {slide.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {slide.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlideEdit(slide);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {onSlideDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlideDuplicate(slide.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
                {onSlideDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlideDelete(slide.id);
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
