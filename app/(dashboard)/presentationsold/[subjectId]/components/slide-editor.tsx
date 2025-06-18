"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlideRenderer } from "./slide-renderer";
import type { Slide } from "@/types/presentation";
import { toast } from "sonner";

interface Props {
  slide: Slide;
  onSave: (slide: Slide) => void;
  onCancel: () => void;
}

const slideTemplates = [
  { value: "default", label: "Default", description: "Standard content slide" },
  {
    value: "title_slide",
    label: "Title Slide",
    description: "Opening slide with large title",
  },
  {
    value: "section_slide",
    label: "Section",
    description: "Section divider slide",
  },
  { value: "code_slide", label: "Code", description: "Code-focused slide" },
  {
    value: "closing_slide",
    label: "Closing",
    description: "Thank you / closing slide",
  },
];

const slideTypes = [
  { value: "content", label: "Content" },
  { value: "title", label: "Title" },
  { value: "section", label: "Section" },
  { value: "code", label: "Code" },
  { value: "image", label: "Image" },
  { value: "quiz", label: "Quiz" },
];

const codeLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "xml",
  "yaml",
  "markdown",
];

export function SlideEditor({ slide, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<Slide>(slide);
  const [activeTab, setActiveTab] = useState("content");

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the slide
      onSave(formData);
      toast.success("Slide saved successfully!");
    } catch (error) {
      toast.error("Failed to save slide");
    }
  };

  const updateField = (field: keyof Slide, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{slide.id ? "Edit Slide" : "Create New Slide"}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{formData.slide_type}</Badge>
            <Badge variant="secondary">{formData.template}</Badge>
          </div>
        </DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter slide title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="Enter slide subtitle..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content || ""}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Enter slide content..."
                rows={8}
              />
            </div>

            {(formData.slide_type === "code" ||
              formData.template === "code_slide") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code_language">Code Language</Label>
                  <Select
                    value={formData.code_language || "javascript"}
                    onValueChange={(value) =>
                      updateField("code_language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {codeLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code_block">Code Block</Label>
                  <Textarea
                    id="code_block"
                    value={formData.code_block || ""}
                    onChange={(e) => updateField("code_block", e.target.value)}
                    placeholder="Enter your code here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ""}
                onChange={(e) => updateField("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Speaker Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add speaker notes for this slide..."
                rows={4}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-2">
                {slideTemplates.map((template) => (
                  <Card
                    key={template.value}
                    className={`cursor-pointer transition-all ${
                      formData.template === template.value
                        ? "ring-2 ring-primary bg-accent"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => updateField("template", template.value)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">
                        {template.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) =>
                      updateField("background_color", e.target.value)
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) =>
                      updateField("background_color", e.target.value)
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => updateField("text_color", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Color Themes</Label>
              <div className="flex gap-2">
                {[
                  { bg: "#ffffff", text: "#000000", name: "Light" },
                  { bg: "#000000", text: "#ffffff", name: "Dark" },
                  { bg: "#1e40af", text: "#ffffff", name: "Blue" },
                  { bg: "#059669", text: "#ffffff", name: "Green" },
                  { bg: "#dc2626", text: "#ffffff", name: "Red" },
                ].map((theme) => (
                  <Button
                    key={theme.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateField("background_color", theme.bg);
                      updateField("text_color", theme.text);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.text,
                      }}
                    />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="slide_type">Slide Type</Label>
              <Select
                value={formData.slide_type}
                onValueChange={(value: any) => updateField("slide_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slideTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slide_order">Slide Order</Label>
              <Input
                id="slide_order"
                type="number"
                value={formData.slide_order}
                onChange={(e) =>
                  updateField("slide_order", parseInt(e.target.value))
                }
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_seconds">
                Estimated Duration (seconds)
              </Label>
              <Input
                id="duration_seconds"
                type="number"
                value={formData.duration_seconds}
                onChange={(e) =>
                  updateField("duration_seconds", parseInt(e.target.value))
                }
                min="30"
                step="30"
              />
              <div className="text-xs text-muted-foreground">
                Approximately {Math.round(formData.duration_seconds / 60)}{" "}
                minutes
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Preview of how your slide will appear in presentation mode:
            </div>
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="aspect-video max-w-2xl mx-auto">
                <SlideRenderer slide={formData} isPreview={true} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("preview")}>
            Preview
          </Button>
          <Button onClick={handleSave}>Save Slide</Button>
        </div>
      </div>
    </div>
  );
}
