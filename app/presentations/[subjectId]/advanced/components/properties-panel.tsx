"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import type { CanvasElement, CanvasSlide } from "@/types/canvas";

interface Props {
  selectedElements: CanvasElement[];
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  slide: CanvasSlide | undefined;
  onUpdateSlide: (updates: Partial<CanvasSlide>) => void;
}

export function PropertiesPanel({
  selectedElements,
  onUpdateElement,
  slide,
  onUpdateSlide,
}: Props) {
  const [activeTab, setActiveTab] = useState("element");

  const selectedElement = selectedElements[0];
  const multipleSelected = selectedElements.length > 1;

  const updateElement = (updates: Partial<CanvasElement>) => {
    selectedElements.forEach((element) => {
      onUpdateElement(element.id, updates);
    });
  };

  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No element selected</p>
          <p className="text-xs mt-1">
            Select an element to edit its properties
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Element Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Element</span>
              <Badge variant="outline" className="text-xs">
                {selectedElement.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {multipleSelected && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                {selectedElements.length} elements selected
              </div>
            )}

            {/* Position & Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => updateElement({ x: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => updateElement({ y: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) =>
                    updateElement({ width: Number(e.target.value) })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) =>
                    updateElement({ height: Number(e.target.value) })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Rotation & Opacity */}
            <div className="space-y-2">
              <Label className="text-xs">
                Rotation: {selectedElement.rotation}°
              </Label>
              <Slider
                value={[selectedElement.rotation || 0]}
                onValueChange={([value]) =>
                  updateElement({ rotation: value || 0 })
                }
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                Opacity: {Math.round(selectedElement.opacity * 100)}%
              </Label>
              <Slider
                value={[(selectedElement.opacity || 1) * 100]}
                onValueChange={([value]) =>
                  updateElement({ opacity: (value || 0) / 100 })
                }
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Element Controls */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateElement({ visible: !selectedElement.visible })
                }
                className="h-8 w-8 p-0"
              >
                {selectedElement.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateElement({ locked: !selectedElement.locked })
                }
                className="h-8 w-8 p-0"
              >
                {selectedElement.locked ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedElements.forEach((el) =>
                    onUpdateElement(el.id, { zIndex: el.zIndex + 1 })
                  );
                }}
                className="h-8 px-2 text-xs"
              >
                Bring Forward
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific Properties */}
        {selectedElement.type === "text" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Text Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Text</Label>
                <Input
                  value={selectedElement.text || ""}
                  onChange={(e) => updateElement({ text: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) =>
                      updateElement({ fontSize: Number(e.target.value) })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Font Family</Label>
                  <Select
                    value={selectedElement.fontFamily || "Inter"}
                    onValueChange={(value) =>
                      updateElement({ fontFamily: value })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant={
                    selectedElement.fontWeight === "bold" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    updateElement({
                      fontWeight:
                        selectedElement.fontWeight === "bold"
                          ? "normal"
                          : "bold",
                    })
                  }
                  className="h-8 w-8 p-0"
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Italic className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Underline className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex gap-1">
                <Button
                  variant={
                    selectedElement.textAlign === "left" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => updateElement({ textAlign: "left" })}
                  className="h-8 w-8 p-0"
                >
                  <AlignLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant={
                    selectedElement.textAlign === "center" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => updateElement({ textAlign: "center" })}
                  className="h-8 w-8 p-0"
                >
                  <AlignCenter className="h-3 w-3" />
                </Button>
                <Button
                  variant={
                    selectedElement.textAlign === "right" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => updateElement({ textAlign: "right" })}
                  className="h-8 w-8 p-0"
                >
                  <AlignRight className="h-3 w-3" />
                </Button>
              </div>

              <div>
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.textColor || "#000000"}
                    onChange={(e) =>
                      updateElement({ textColor: e.target.value })
                    }
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={selectedElement.textColor || "#000000"}
                    onChange={(e) =>
                      updateElement({ textColor: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedElement.type === "shape" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shape Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Shape Type</Label>
                <Select
                  value={selectedElement.shapeType || "rectangle"}
                  onValueChange={(value: any) =>
                    updateElement({ shapeType: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="triangle">Triangle</SelectItem>
                    <SelectItem value="arrow">Arrow</SelectItem>
                    <SelectItem value="star">Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.fillColor || "#3b82f6"}
                    onChange={(e) =>
                      updateElement({ fillColor: e.target.value })
                    }
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={selectedElement.fillColor || "#3b82f6"}
                    onChange={(e) =>
                      updateElement({ fillColor: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Stroke Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.strokeColor || "#1e40af"}
                    onChange={(e) =>
                      updateElement({ strokeColor: e.target.value })
                    }
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={selectedElement.strokeColor || "#1e40af"}
                    onChange={(e) =>
                      updateElement({ strokeColor: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Stroke Width</Label>
                <Input
                  type="number"
                  value={selectedElement.strokeWidth || 2}
                  onChange={(e) =>
                    updateElement({ strokeWidth: Number(e.target.value) })
                  }
                  className="h-8 text-xs"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSlideProperties = () => {
    if (!slide) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Slide Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={slide.title}
                onChange={(e) => onUpdateSlide({ title: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Background Type</Label>
              <Select
                value={slide.background.type}
                onValueChange={(value: "color" | "gradient" | "image") =>
                  onUpdateSlide({
                    background: { ...slide.background, type: value },
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {slide.background.type === "color" && (
              <div>
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={slide.background.value}
                    onChange={(e) =>
                      onUpdateSlide({
                        background: {
                          ...slide.background,
                          value: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={slide.background.value}
                    onChange={(e) =>
                      onUpdateSlide({
                        background: {
                          ...slide.background,
                          value: e.target.value,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {slide.background.type === "image" && (
              <div>
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={slide.background.value}
                  onChange={(e) =>
                    onUpdateSlide({
                      background: {
                        ...slide.background,
                        value: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-sm">Properties</h3>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="element" className="text-xs">
            Element
          </TabsTrigger>
          <TabsTrigger value="slide" className="text-xs">
            Slide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="element" className="flex-1 overflow-auto p-4 pt-2">
          {renderElementProperties()}
        </TabsContent>

        <TabsContent value="slide" className="flex-1 overflow-auto p-4 pt-2">
          {renderSlideProperties()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
