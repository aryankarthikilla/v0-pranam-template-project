"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  StickyNote,
  Timer,
} from "lucide-react";
import { SlideRenderer } from "./slide-renderer";
import type { Slide, PresentationMode } from "@/types/presentation";

interface Props {
  slides: Slide[];
  currentIndex: number;
  presentationMode: PresentationMode;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
  sessionStartTime: Date | null;
  slideStartTime: Date | null;
}

export function SlideshowMode({
  slides,
  currentIndex,
  presentationMode,
  onNext,
  onPrevious,
  onExit,
  sessionStartTime,
  slideStartTime,
}: Props) {
  const [showControls, setShowControls] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [slideTime, setSlideTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentSlide = slides[currentIndex];

  // Update timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTime) {
        setSessionTime(
          Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        );
      }
      if (slideStartTime) {
        setSlideTime(
          Math.floor((Date.now() - slideStartTime.getTime()) / 1000)
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, slideStartTime]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseMove = () => resetTimeout();

    resetTimeout();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (presentationMode.autoAdvance && isPlaying) {
      const timeout = setTimeout(() => {
        if (currentIndex < slides.length - 1) {
          onNext();
        }
      }, presentationMode.autoAdvanceDelay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [
    currentIndex,
    presentationMode.autoAdvance,
    presentationMode.autoAdvanceDelay,
    isPlaying,
    onNext,
    slides.length,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = ((currentIndex + 1) / slides.length) * 100;

  // Safety check for currentSlide
  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">No slide available</h2>
          <Button
            onClick={onExit}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Exit Slideshow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Controls Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              Exit (ESC)
            </Button>

            <div className="flex items-center gap-2 text-white">
              <span className="text-sm">
                {currentIndex + 1} / {slides.length}
              </span>
              <Progress value={progress} className="w-32 h-2" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {presentationMode.showTimer && (
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  Session: {formatTime(sessionTime)}
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  Slide: {formatTime(slideTime)}
                </div>
              </div>
            )}

            {presentationMode.autoAdvance && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newShowNotes = !presentationMode.showNotes;
                // Update presentation mode here if needed
              }}
              className="text-white hover:bg-white/20"
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Notes (N)
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-7xl">
          <SlideRenderer slide={currentSlide} className="h-full" />
        </div>
      </div>

      {/* Speaker Notes */}
      {presentationMode.showNotes && currentSlide.notes && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm text-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4" />
              <span className="font-medium">Speaker Notes</span>
            </div>
            <p className="text-sm opacity-90">{currentSlide.notes}</p>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-white text-sm px-2">
            {currentIndex + 1} / {slides.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={currentIndex === slides.length - 1}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide Thumbnails (Mini Navigator) */}
      <div
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => {
                // Navigate to slide
                const event = new KeyboardEvent("keydown", {
                  key: `${index + 1}`,
                });
                // Handle slide navigation
              }}
              className={`w-16 h-12 rounded border-2 transition-all ${
                index === currentIndex
                  ? "border-white bg-white/20"
                  : "border-white/30 bg-black/40 hover:bg-white/10"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div
        className={`absolute bottom-4 left-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <Card className="bg-black/80 backdrop-blur-sm border-white/20 text-white p-3">
          <div className="text-xs space-y-1">
            <div className="font-medium mb-2">Shortcuts:</div>
            <div>← → Space: Navigate</div>
            <div>ESC: Exit</div>
            <div>F: Fullscreen</div>
            <div>N: Toggle Notes</div>
            <div>T: Toggle Timer</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
