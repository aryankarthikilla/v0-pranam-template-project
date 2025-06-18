"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Play,
  Maximize,
  Edit,
  Plus,
  Settings,
  Clock,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Presentation,
  StickyNote,
  ArrowLeft,
} from "lucide-react";
import { SlideEditor } from "./slide-editor";
import { SlideRenderer } from "./slide-renderer";
import { SlideshowMode } from "./slideshow-mode";
import { PresentationSettings } from "./presentation-settings";
import { PresentationAnalytics } from "./presentation-analytics";
import type { Subject, Slide, PresentationMode } from "@/types/presentation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  subject: Subject;
  slides: Slide[];
}

export function PresentationInterface({
  subject,
  slides: initialSlides,
}: Props) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>({
    isFullscreen: false,
    isSlideshow: false,
    currentSlideIndex: 0,
    showNotes: false,
    showTimer: false,
    autoAdvance: false,
    autoAdvanceDelay: 30,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [slideStartTime, setSlideStartTime] = useState<Date | null>(null);
  const router = useRouter();

  const currentSlide = slides[currentSlideIndex];

  // Reset currentSlideIndex if it's out of bounds
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (presentationMode.isSlideshow) {
        switch (event.key) {
          case "ArrowRight":
          case " ":
            event.preventDefault();
            nextSlide();
            break;
          case "ArrowLeft":
            event.preventDefault();
            previousSlide();
            break;
          case "Escape":
            event.preventDefault();
            exitSlideshow();
            break;
          case "f":
          case "F":
            event.preventDefault();
            toggleFullscreen();
            break;
          case "n":
          case "N":
            event.preventDefault();
            setPresentationMode((prev) => ({
              ...prev,
              showNotes: !prev.showNotes,
            }));
            break;
          case "t":
          case "T":
            event.preventDefault();
            setPresentationMode((prev) => ({
              ...prev,
              showTimer: !prev.showTimer,
            }));
            break;
        }
      } else {
        // Normal mode shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case "Enter":
              event.preventDefault();
              startSlideshow();
              break;
            case "e":
              event.preventDefault();
              if (currentSlide) {
                handleEditSlide(currentSlide);
              }
              break;
            case "n":
              event.preventDefault();
              handleAddSlide();
              break;
          }
        }

        switch (event.key) {
          case "ArrowRight":
            if (!isEditing) {
              event.preventDefault();
              nextSlide();
            }
            break;
          case "ArrowLeft":
            if (!isEditing) {
              event.preventDefault();
              previousSlide();
            }
            break;
          case "F5":
            event.preventDefault();
            startSlideshow();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    presentationMode.isSlideshow,
    isEditing,
    currentSlideIndex,
    slides.length,
    currentSlide,
  ]);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setPresentationMode((prev) => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex + 1,
      }));
      setSlideStartTime(new Date());
    }
  }, [currentSlideIndex, slides.length]);

  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setPresentationMode((prev) => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex - 1,
      }));
      setSlideStartTime(new Date());
    }
  }, [currentSlideIndex]);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setPresentationMode((prev) => ({ ...prev, currentSlideIndex: index }));
    setSlideStartTime(new Date());
  };

  const startSlideshow = () => {
    if (slides.length === 0) {
      toast.error("No slides to present!");
      return;
    }

    setPresentationMode((prev) => ({
      ...prev,
      isSlideshow: true,
      currentSlideIndex: currentSlideIndex,
    }));
    setSessionStartTime(new Date());
    setSlideStartTime(new Date());
    toast.success("Slideshow started! Use arrow keys to navigate, ESC to exit");
  };

  const exitSlideshow = () => {
    setPresentationMode((prev) => ({
      ...prev,
      isSlideshow: false,
      isFullscreen: false,
    }));
    setSessionStartTime(null);
    setSlideStartTime(null);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setPresentationMode((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      await document.exitFullscreen();
      setPresentationMode((prev) => ({ ...prev, isFullscreen: false }));
    }
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setIsEditing(true);
  };

  const handleAddSlide = () => {
    const newSlide: Partial<Slide> = {
      subject_id: subject.id,
      title: "New Slide",
      subtitle: "",
      content: "",
      slide_order: slides.length + 1,
      slide_type: "content",
      background_color: "#ffffff",
      text_color: "#000000",
      template: "default",
      duration_seconds: 300,
      is_active: true,
    };
    setEditingSlide(newSlide as Slide);
    setIsEditing(true);
  };

  const handleSlideUpdate = (updatedSlide: Slide) => {
    setSlides((prev) => {
      const index = prev.findIndex((s) => s.id === updatedSlide.id);
      if (index >= 0) {
        const newSlides = [...prev];
        newSlides[index] = updatedSlide;
        return newSlides;
      } else {
        return [...prev, updatedSlide];
      }
    });
    setIsEditing(false);
    setEditingSlide(null);
    toast.success("Slide updated successfully!");
  };

  if (presentationMode.isSlideshow) {
    return (
      <SlideshowMode
        slides={slides}
        currentIndex={presentationMode.currentSlideIndex}
        presentationMode={presentationMode}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onExit={exitSlideshow}
        sessionStartTime={sessionStartTime}
        slideStartTime={slideStartTime}
      />
    );
  }

  // Show empty state if no slides
  if (slides.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/presentations")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h2 className="font-semibold text-card-foreground truncate">
                  {subject.name}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  0 slides
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {subject.description}
            </p>
          </div>

          <div className="p-4 space-y-2 border-b border-border">
            <Button onClick={handleAddSlide} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Slide
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Presentation className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No slides yet</p>
              <p className="text-xs">Add your first slide to get started</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Presentation className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              No slides in this presentation
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first slide to start building your presentation
            </p>
            <Button onClick={handleAddSlide}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Slide
            </Button>
          </div>
        </div>

        {/* Slide Editor Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {editingSlide && (
              <SlideEditor
                slide={editingSlide}
                onSave={handleSlideUpdate}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingSlide(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Slides List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/presentations")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-card-foreground truncate">
                {subject.name}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {slides.length} slides
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subject.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2 border-b border-border">
          <Button onClick={startSlideshow} className="w-full" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start Slideshow (F5)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleAddSlide} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Slide
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setShowAnalytics(true)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Resources
            </Button>
          </div>
        </div>

        {/* Slides List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`p-3 cursor-pointer transition-all hover:bg-accent ${
                  index === currentSlideIndex
                    ? "ring-2 ring-primary bg-accent"
                    : ""
                }`}
                onClick={() => goToSlide(index)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-card-foreground">
                      {slide.title}
                    </h4>
                    {slide.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {slide.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {slide.slide_type}
                      </Badge>
                      {slide.duration_seconds && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {Math.round(slide.duration_seconds / 60)}m
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSlide(slide);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Keyboard Shortcuts Help */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium mb-2">Keyboard Shortcuts:</div>
            <div>F5 - Start slideshow</div>
            <div>Ctrl+Enter - Start slideshow</div>
            <div>Ctrl+E - Edit current slide</div>
            <div>Ctrl+N - New slide</div>
            <div>← → - Navigate slides</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              {currentSlide?.title || "No slide selected"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentSlide && handleEditSlide(currentSlide)}
              disabled={!currentSlide}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4 mr-2" />
              Fullscreen
            </Button>
            <Button
              onClick={startSlideshow}
              size="sm"
              disabled={slides.length === 0}
            >
              <Presentation className="h-4 w-4 mr-2" />
              Present
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 p-6 bg-muted/30">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl">
              {currentSlide ? (
                <SlideRenderer slide={currentSlide} isPreview={true} />
              ) : (
                <div className="aspect-video bg-card border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Presentation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No slide selected</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Speaker Notes */}
        {currentSlide?.notes && (
          <div className="border-t border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-card-foreground">
                Speaker Notes
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentSlide.notes}
            </p>
          </div>
        )}
      </div>

      {/* Slide Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingSlide && (
            <SlideEditor
              slide={editingSlide}
              onSave={handleSlideUpdate}
              onCancel={() => {
                setIsEditing(false);
                setEditingSlide(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <PresentationSettings
            presentationMode={presentationMode}
            onUpdate={setPresentationMode}
            onClose={() => setShowSettings(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PresentationAnalytics
            subject={subject}
            slides={slides}
            onClose={() => setShowAnalytics(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
