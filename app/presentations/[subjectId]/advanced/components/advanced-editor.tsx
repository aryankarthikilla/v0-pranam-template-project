"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Play,
  Settings,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ElementToolbar } from "./element-toolbar";
import { CanvasEditor } from "./canvas-editor";
import { PropertiesPanel } from "./properties-panel";
import { SlideThumbnails } from "./slide-thumbnails";
import type { Subject, Slide } from "@/types/presentation";
import type { CanvasElement, CanvasSlide, CanvasState } from "@/types/canvas";

interface Props {
  subject: Subject;
  slides: Slide[];
}

export function AdvancedEditor({ subject, slides: initialSlides }: Props) {
  const router = useRouter();

  // Convert regular slides to canvas slides
  const [canvasSlides, setCanvasSlides] = useState<CanvasSlide[]>(
    initialSlides.map((slide) => ({
      id: slide.id,
      subject_id: slide.subject_id,
      title: slide.title,
      elements: [],
      background: {
        type: "color" as const,
        value: slide.background_color || "#ffffff",
      },
      slide_order: slide.slide_order,
      created_at: slide.created_at,
      updated_at: slide.updated_at,
    }))
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    selectedElements: [],
    clipboard: [],
    history: [],
    historyIndex: -1,
    zoom: 100,
    gridVisible: true,
    snapToGrid: true,
    gridSize: 20,
  });

  const currentSlide = canvasSlides[currentSlideIndex];

  const handleAddElement = useCallback(
    (element: Omit<CanvasElement, "id">) => {
      if (!currentSlide) return;

      const newElement: CanvasElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const updatedSlide = {
        ...currentSlide,
        elements: [...currentSlide.elements, newElement],
      };

      setCanvasSlides((prev) =>
        prev.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide
        )
      );

      // Select the new element
      setCanvasState((prev) => ({
        ...prev,
        selectedElements: [newElement.id],
      }));

      toast.success("Element added to canvas");
    },
    [currentSlide, currentSlideIndex]
  );

  const handleUpdateElement = useCallback(
    (elementId: string, updates: Partial<CanvasElement>) => {
      if (!currentSlide) return;

      const updatedSlide = {
        ...currentSlide,
        elements: currentSlide.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      };

      setCanvasSlides((prev) =>
        prev.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide
        )
      );
    },
    [currentSlide, currentSlideIndex]
  );

  const handleDeleteElement = useCallback(
    (elementId: string) => {
      if (!currentSlide) return;

      const updatedSlide = {
        ...currentSlide,
        elements: currentSlide.elements.filter((el) => el.id !== elementId),
      };

      setCanvasSlides((prev) =>
        prev.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide
        )
      );

      setCanvasState((prev) => ({
        ...prev,
        selectedElements: prev.selectedElements.filter(
          (id) => id !== elementId
        ),
      }));

      toast.success("Element deleted");
    },
    [currentSlide, currentSlideIndex]
  );

  const handleSelectElement = useCallback(
    (elementId: string, multiSelect = false) => {
      setCanvasState((prev) => ({
        ...prev,
        selectedElements: multiSelect
          ? prev.selectedElements.includes(elementId)
            ? prev.selectedElements.filter((id) => id !== elementId)
            : [...prev.selectedElements, elementId]
          : [elementId],
      }));
    },
    []
  );

  const handleZoom = useCallback((direction: "in" | "out" | "reset") => {
    setCanvasState((prev) => {
      let newZoom = prev.zoom;
      if (direction === "in") newZoom = Math.min(200, prev.zoom + 25);
      else if (direction === "out") newZoom = Math.max(25, prev.zoom - 25);
      else newZoom = 100;

      return { ...prev, zoom: newZoom };
    });
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Here you would save the canvas slides to the database
      toast.success("Presentation saved successfully!");
    } catch (error) {
      toast.error("Failed to save presentation");
    }
  }, [canvasSlides]);

  const handleAddSlide = useCallback(() => {
    const newSlide: CanvasSlide = {
      id: `slide_${Date.now()}`,
      subject_id: subject.id,
      title: `Slide ${canvasSlides.length + 1}`,
      elements: [],
      background: {
        type: "color",
        value: "#ffffff",
      },
      slide_order: canvasSlides.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCanvasSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(canvasSlides.length);
    toast.success("New slide added");
  }, [canvasSlides.length, subject.id]);

  const selectedElements =
    currentSlide?.elements.filter((el) =>
      canvasState.selectedElements.includes(el.id)
    ) || [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Slide Thumbnails */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/presentations/${subject.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-sm truncate">{subject.name}</h2>
              <Badge variant="secondary" className="text-xs">
                Advanced Editor
              </Badge>
            </div>
          </div>
        </div>

        <SlideThumbnails
          slides={canvasSlides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onAddSlide={handleAddSlide}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={() => handleZoom("out")}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {canvasState.zoom}%
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleZoom("in")}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCanvasState((prev) => ({
                  ...prev,
                  gridVisible: !prev.gridVisible,
                }))
              }
              className={canvasState.gridVisible ? "bg-accent" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Present
            </Button>
          </div>
        </div>

        {/* Element Toolbar */}
        <ElementToolbar onAddElement={handleAddElement} />

        {/* Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <CanvasEditor
              slide={currentSlide}
              canvasState={canvasState}
              onUpdateElement={handleUpdateElement}
              onSelectElement={handleSelectElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-200">
            <PropertiesPanel
              selectedElements={selectedElements}
              onUpdateElement={handleUpdateElement}
              slide={currentSlide}
              onUpdateSlide={(updates) => {
                if (!currentSlide) return;
                const updatedSlide = { ...currentSlide, ...updates };
                setCanvasSlides((prev) =>
                  prev.map((slide, index) =>
                    index === currentSlideIndex ? updatedSlide : slide
                  )
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
