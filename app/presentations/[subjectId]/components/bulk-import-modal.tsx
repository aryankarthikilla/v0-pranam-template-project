"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { bulkImportSlides } from "../../actions/presentation-actions";
import type { Subject } from "@/types/presentation";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  currentSubjectId?: string;
  onImportComplete?: () => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  subjects,
  currentSubjectId,
  onImportComplete,
}: BulkImportModalProps) {
  const [jsonContent, setJsonContent] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    currentSubjectId || ""
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const exampleJson = `[
  {
    "title": "Introduction to AI",
    "subtitle": "Understanding Artificial Intelligence",
    "content": "• What is AI?\\n• History of AI\\n• Types of AI\\n• Current Applications",
    "slide_type": "content",
    "background_color": "#ffffff",
    "text_color": "#000000",
    "notes": "Start with basic definitions and examples",
    "duration_seconds": 300
  },
  {
    "title": "Machine Learning Basics",
    "subtitle": "Core Concepts",
    "content": "• Supervised Learning\\n• Unsupervised Learning\\n• Reinforcement Learning",
    "code_block": "# Example Python code\\nimport numpy as np\\nfrom sklearn.linear_model import LinearRegression\\n\\nmodel = LinearRegression()\\nmodel.fit(X_train, y_train)",
    "code_language": "python",
    "slide_type": "code",
    "notes": "Demonstrate with simple examples"
  },
  {
    "title": "AI in Practice",
    "subtitle": "Real-world Applications",
    "content": "Examples of AI in various industries",
    "image_url": "https://example.com/ai-applications.jpg",
    "slide_type": "image"
  }
]`;

  const validateJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return {
          valid: false,
          error: "JSON must be an array of slide objects",
        };
      }

      for (let i = 0; i < parsed.length; i++) {
        const slide = parsed[i];
        if (!slide.title) {
          return { valid: false, error: `Slide ${i + 1}: title is required` };
        }
      }

      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: "Invalid JSON format" };
    }
  };

  const handleImport = async () => {
    if (!selectedSubjectId) {
      setImportResult({ success: false, message: "Please select a subject" });
      return;
    }

    const validation = validateJson(jsonContent);
    if (!validation.valid) {
      setImportResult({
        success: false,
        message: validation.error || "Invalid JSON",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const importedSlides = await bulkImportSlides(
        selectedSubjectId,
        validation.data!
      );
      setImportResult({
        success: true,
        message: `Successfully imported ${importedSlides.length} slides!`,
        count: importedSlides.length,
      });
      setJsonContent("");
      onImportComplete?.();
      onClose();
    } catch (error) {
      setImportResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to import slides",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const copyExampleJson = () => {
    navigator.clipboard.writeText(exampleJson);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Import Slides
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="subject" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subject">1. Select Subject</TabsTrigger>
            <TabsTrigger value="format">2. JSON Format</TabsTrigger>
            <TabsTrigger value="import">3. Import Data</TabsTrigger>
          </TabsList>

          <TabsContent value="subject" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Choose Subject</CardTitle>
                <CardDescription>
                  Select the subject where you want to import the slides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <span>{subject.name}</span>
                          {subject.id === currentSubjectId && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="format" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>JSON Format</CardTitle>
                <CardDescription>
                  Your JSON should be an array of slide objects with the
                  following structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Required Fields:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <code>title</code> - Slide title (required)
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Optional Fields:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <code>subtitle</code> - Slide subtitle
                    </li>
                    <li>
                      • <code>content</code> - Main slide content (supports \\n
                      for line breaks)
                    </li>
                    <li>
                      • <code>code_block</code> - Code snippet
                    </li>
                    <li>
                      • <code>code_language</code> - Programming language for
                      syntax highlighting
                    </li>
                    <li>
                      • <code>image_url</code> - URL to an image
                    </li>
                    <li>
                      • <code>slide_type</code> - content, title, section, code,
                      image, quiz
                    </li>
                    <li>
                      • <code>background_color</code> - Hex color (default:
                      #ffffff)
                    </li>
                    <li>
                      • <code>text_color</code> - Hex color (default: #000000)
                    </li>
                    <li>
                      • <code>template</code> - Slide template (default:
                      default)
                    </li>
                    <li>
                      • <code>notes</code> - Speaker notes
                    </li>
                    <li>
                      • <code>duration_seconds</code> - Estimated duration
                      (default: 300)
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Example JSON:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyExampleJson}
                    >
                      Copy Example
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {exampleJson}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paste JSON Data</CardTitle>
                <CardDescription>
                  Paste your JSON array of slides below and click import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your JSON data here..."
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />

                {importResult && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      importResult.success
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {importResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{importResult.message}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleImport}
                    disabled={
                      isImporting || !jsonContent.trim() || !selectedSubjectId
                    }
                    className="flex-1"
                  >
                    {isImporting ? "Importing..." : "Import Slides"}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
