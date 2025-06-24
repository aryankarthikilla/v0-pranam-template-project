"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Type,
  ImageIcon,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Star,
  BarChart3,
  LineChart,
  PieChart,
  Smile,
  Minus,
  Upload,
} from "lucide-react";
import type { CanvasElement } from "@/types/canvas";

interface Props {
  onAddElement: (element: Omit<CanvasElement, "id">) => void;
}

export function ElementToolbar({ onAddElement }: Props) {
  const addTextElement = () => {
    onAddElement({
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      text: "Click to edit text",
      fontSize: 16,
      fontFamily: "Inter",
      fontWeight: "normal",
      textAlign: "left",
      textColor: "#000000",
    });
  };

  const addShapeElement = (
    shapeType: "rectangle" | "circle" | "triangle" | "arrow" | "star"
  ) => {
    onAddElement({
      type: "shape",
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      shapeType,
      fillColor: "#3b82f6",
      strokeColor: "#1e40af",
      strokeWidth: 2,
    });
  };

  const addImageElement = () => {
    onAddElement({
      type: "image",
      x: 200,
      y: 200,
      width: 200,
      height: 150,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      imageUrl: "/placeholder.svg?height=150&width=200",
      imageFit: "cover",
    });
  };

  const addChartElement = (chartType: "bar" | "line" | "pie" | "doughnut") => {
    onAddElement({
      type: "chart",
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      chartType,
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [
          {
            label: "Sample Data",
            data: [12, 19, 3, 5],
            backgroundColor: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
          },
        ],
      },
    });
  };

  const addLineElement = () => {
    onAddElement({
      type: "line",
      x: 100,
      y: 100,
      width: 200,
      height: 2,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      startX: 0,
      startY: 0,
      endX: 200,
      endY: 0,
      lineStyle: "solid",
      strokeColor: "#000000",
      strokeWidth: 2,
      arrowStart: false,
      arrowEnd: false,
    });
  };

  const addIconElement = () => {
    onAddElement({
      type: "icon",
      x: 150,
      y: 150,
      width: 48,
      height: 48,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      iconName: "smile",
      iconColor: "#3b82f6",
    });
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-2 overflow-x-auto">
      {/* Text Tools */}
      <Button
        variant="ghost"
        size="sm"
        onClick={addTextElement}
        title="Add Text"
      >
        <Type className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Shape Tools */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addShapeElement("rectangle")}
        title="Rectangle"
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addShapeElement("circle")}
        title="Circle"
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addShapeElement("triangle")}
        title="Triangle"
      >
        <Triangle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addShapeElement("arrow")}
        title="Arrow"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addShapeElement("star")}
        title="Star"
      >
        <Star className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Media Tools */}
      <Button
        variant="ghost"
        size="sm"
        onClick={addImageElement}
        title="Add Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addIconElement}
        title="Add Icon"
      >
        <Smile className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Chart Tools */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addChartElement("bar")}
        title="Bar Chart"
      >
        <BarChart3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addChartElement("line")}
        title="Line Chart"
      >
        <LineChart className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => addChartElement("pie")}
        title="Pie Chart"
      >
        <PieChart className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Line Tools */}
      <Button
        variant="ghost"
        size="sm"
        onClick={addLineElement}
        title="Add Line"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Upload Tools */}
      <Button variant="ghost" size="sm" title="Upload Image">
        <Upload className="h-4 w-4" />
      </Button>
    </div>
  );
}
