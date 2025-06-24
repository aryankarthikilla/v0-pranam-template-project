"use client";

import type React from "react";

import { useRef, useCallback, useState, useEffect } from "react";
import { DraggableElement } from "./draggable-element";
import type { CanvasElement, CanvasSlide, CanvasState } from "@/types/canvas";

interface Props {
  slide: CanvasSlide | undefined;
  canvasState: CanvasState;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onSelectElement: (elementId: string, multiSelect?: boolean) => void;
  onDeleteElement: (elementId: string) => void;
}

export function CanvasEditor({
  slide,
  canvasState,
  onUpdateElement,
  onSelectElement,
  onDeleteElement,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  // Handle canvas click (deselect elements)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelectElement("", false); // Deselect all
      }
    },
    [onSelectElement]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        canvasState.selectedElements.forEach((elementId) => {
          onDeleteElement(elementId);
        });
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "a":
            e.preventDefault();
            // Select all elements
            if (slide) {
              slide.elements.forEach((el) => onSelectElement(el.id, true));
            }
            break;
          case "c":
            e.preventDefault();
            // Copy selected elements
            break;
          case "v":
            e.preventDefault();
            // Paste elements
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasState.selectedElements, onDeleteElement, onSelectElement, slide]);

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No slide selected</p>
          <p className="text-sm">Select a slide to start editing</p>
        </div>
      </div>
    );
  }

  const scale = canvasState.zoom / 100;
  const gridSize = canvasState.gridSize * scale;

  return (
    <div className="flex-1 overflow-auto bg-gray-100 rounded-lg relative">
      <div
        className="relative mx-auto my-8 bg-white shadow-lg"
        style={{
          width: canvasSize.width * scale,
          height: canvasSize.height * scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
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
        />

        {/* Grid */}
        {canvasState.gridVisible && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        {/* Canvas Click Area */}
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-default"
          onClick={handleCanvasClick}
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          {/* Render Elements */}
          {slide.elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={canvasState.selectedElements.includes(element.id)}
                onUpdate={(updates) => onUpdateElement(element.id, updates)}
                onSelect={(multiSelect) =>
                  onSelectElement(element.id, multiSelect)
                }
                snapToGrid={canvasState.snapToGrid}
                gridSize={canvasState.gridSize}
              />
            ))}
        </div>

        {/* Canvas Info */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {canvasSize.width} × {canvasSize.height} | {canvasState.zoom}%
        </div>
      </div>
    </div>
  );
}
