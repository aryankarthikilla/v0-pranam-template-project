"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import type { CanvasElement } from "@/types/canvas";

interface Props {
  element: CanvasElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onSelect: (multiSelect?: boolean) => void;
  snapToGrid: boolean;
  gridSize: number;
}

export function DraggableElement({
  element,
  isSelected,
  onUpdate,
  onSelect,
  snapToGrid,
  gridSize,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const snapToGridValue = useCallback(
    (value: number) => {
      if (!snapToGrid) return value;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(e.ctrlKey || e.metaKey);
    },
    [onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (element.type === "text") {
        // Enter text editing mode
      }
    },
    [element.type]
  );

  const renderElementContent = () => {
    switch (element.type) {
      case "text":
        return (
          <div
            className="w-full h-full flex items-center justify-start p-2 cursor-text"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.textColor,
              textAlign: element.textAlign,
              lineHeight: 1.2,
            }}
          >
            {element.text || "Click to edit text"}
          </div>
        );

      case "shape":
        const shapeStyle = {
          width: "100%",
          height: "100%",
          backgroundColor: element.fillColor,
          border: `${element.strokeWidth}px solid ${element.strokeColor}`,
        };

        switch (element.shapeType) {
          case "circle":
            return <div style={{ ...shapeStyle, borderRadius: "50%" }} />;
          case "triangle":
            return (
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${element.width / 2}px solid transparent`,
                  borderRight: `${element.width / 2}px solid transparent`,
                  borderBottom: `${element.height}px solid ${element.fillColor}`,
                }}
              />
            );
          case "star":
            return (
              <svg width="100%" height="100%" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={element.fillColor}
                  stroke={element.strokeColor}
                  strokeWidth={element.strokeWidth}
                />
              </svg>
            );
          case "arrow":
            return (
              <svg width="100%" height="100%" viewBox="0 0 24 24">
                <path
                  d="M2 12h16m-4-4l4 4-4 4"
                  fill="none"
                  stroke={element.strokeColor}
                  strokeWidth={element.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            );
          default: // rectangle
            return <div style={shapeStyle} />;
        }

      case "image":
        return (
          <img
            src={element.imageUrl || "/placeholder.svg?height=150&width=200"}
            alt="Element"
            className="w-full h-full object-cover rounded"
            style={{ objectFit: element.imageFit }}
          />
        );

      case "icon":
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: element.iconColor }}
          >
            {/* You would render the actual icon here based on element.iconName */}
            <div className="text-2xl">😊</div>
          </div>
        );

      case "line":
        return (
          <svg width="100%" height="100%" className="absolute inset-0">
            <line
              x1={element.startX}
              y1={element.startY}
              x2={element.endX}
              y2={element.endY}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeDasharray={
                element.lineStyle === "dashed"
                  ? "5,5"
                  : element.lineStyle === "dotted"
                  ? "2,2"
                  : "none"
              }
            />
            {element.arrowEnd && (
              <polygon
                points={`${element.endX},${element.endY} ${
                  element.endX! - 10
                },${element.endY! - 5} ${element.endX! - 10},${
                  element.endY! + 5
                }`}
                fill={element.strokeColor}
              />
            )}
          </svg>
        );

      case "chart":
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-sm font-medium">
                {element.chartType?.toUpperCase()} Chart
              </div>
              <div className="text-xs">Chart visualization</div>
            </div>
          </div>
        );

      default:
        return <div className="w-full h-full bg-gray-200 rounded" />;
    }
  };

  if (element.locked) {
    return (
      <div
        className="absolute cursor-not-allowed opacity-75"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex,
          opacity: element.opacity,
          display: element.visible ? "block" : "none",
        }}
        onClick={handleClick}
      >
        {renderElementContent()}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-red-500 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
              Locked
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(e, d) => {
        setIsDragging(false);
        onUpdate({
          x: snapToGridValue(d.x),
          y: snapToGridValue(d.y),
        });
      }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={(e, direction, ref, delta, position) => {
        setIsResizing(false);
        onUpdate({
          width: snapToGridValue(ref.offsetWidth),
          height: snapToGridValue(ref.offsetHeight),
          x: snapToGridValue(position.x),
          y: snapToGridValue(position.y),
        });
      }}
      bounds="parent"
      className={`${isSelected ? "ring-2 ring-blue-500" : ""} ${
        isDragging || isResizing ? "cursor-move" : "cursor-pointer"
      }`}
      style={{
        zIndex: element.zIndex,
        opacity: element.opacity,
        display: element.visible ? "block" : "none",
        transform: `rotate(${element.rotation}deg)`,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      enableResizing={isSelected && !element.locked}
      disableDragging={element.locked}
    >
      {renderElementContent()}

      {isSelected && !element.locked && (
        <>
          {/* Selection handles are provided by react-rnd */}
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">
            {element.type}
          </div>
        </>
      )}
    </Rnd>
  );
}
