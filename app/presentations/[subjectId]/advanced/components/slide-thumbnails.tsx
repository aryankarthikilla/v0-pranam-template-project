"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Copy, Trash2 } from "lucide-react";
import type { CanvasSlide } from "@/types/canvas";

interface Props {
  slides: CanvasSlide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
}

export function SlideThumbnails({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
}: Props) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button onClick={onAddSlide} size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {slides.map((slide, index) => (
            <Card
              key={slide.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                index === currentSlideIndex
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onSlideSelect(index)}
            >
              <CardContent className="p-3">
                {/* Slide Preview */}
                <div
                  className="w-full aspect-video bg-white border border-gray-200 rounded mb-2 relative overflow-hidden"
                  style={{
                    background:
                      slide.background.type === "color"
                        ? slide.background.value
                        : slide.background.type === "gradient"
                        ? `linear-gradient(${
                            slide.background.gradient?.direction || 0
                          }deg, ${
                            slide.background.gradient?.colors.join(", ") ||
                            "#ffffff, #f0f0f0"
                          })`
                        : `url(${slide.background.value}) center/cover`,
                  }}
                >
                  {/* Mini elements preview */}
                  {slide.elements.slice(0, 5).map((element) => (
                    <div
                      key={element.id}
                      className="absolute bg-blue-200 border border-blue-300 rounded"
                      style={{
                        left: `${(element.x / 1920) * 100}%`,
                        top: `${(element.y / 1080) * 100}%`,
                        width: `${(element.width / 1920) * 100}%`,
                        height: `${(element.height / 1080) * 100}%`,
                        minWidth: "2px",
                        minHeight: "2px",
                      }}
                    />
                  ))}

                  {slide.elements.length > 5 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      +{slide.elements.length - 5}
                    </div>
                  )}
                </div>

                {/* Slide Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div className="flex gap-1">
                      {onDuplicateSlide && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateSlide(index);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteSlide && slides.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSlide(index);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xs font-medium truncate">
                    {slide.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {slide.elements.length} element
                    {slide.elements.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
