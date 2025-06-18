"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Calendar,
  Users,
  Clock,
  Presentation,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Subject } from "@/types/presentation";

import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "./../actions/presentation-actions";

interface Props {
  initialSubjects: Subject[];
}

export function PresentationsPageClient({ initialSubjects }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject_type: "",
    course_name: "",
    description: "",
    tags: [] as string[],
  });
  const router = useRouter();

  const handleCreateSubject = async () => {
    try {
      const newSubject = await createSubject(formData);
      setSubjects([newSubject, ...subjects]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Subject created successfully!");
    } catch (error) {
      toast.error("Failed to create subject");
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    try {
      const updatedSubject = await updateSubject(editingSubject.id, formData);
      setSubjects(
        subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
      );
      setEditingSubject(null);
      resetForm();
      toast.success("Subject updated successfully!");
    } catch (error) {
      toast.error("Failed to update subject");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
      toast.success("Subject deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject_type: "",
      course_name: "",
      description: "",
      tags: [],
    });
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      subject_type: subject.subject_type || "",
      course_name: subject.course_name || "",
      description: subject.description || "",
      tags: subject.tags,
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Presentation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Presentation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Presentation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Large Language Models Fundamentals"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject_type">Subject Type</Label>
                  <Select
                    value={formData.subject_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical Training">
                        Technical Training
                      </SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Product Training">
                        Product Training
                      </SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_name">Course Name</Label>
                  <Input
                    id="course_name"
                    value={formData.course_name}
                    onChange={(e) =>
                      setFormData({ ...formData, course_name: e.target.value })
                    }
                    placeholder="e.g., AI & Machine Learning Masterclass"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the presentation content..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g., AI, Machine Learning, LLM, GPT"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSubject}>
                  Create Presentation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Presentation className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No presentations yet
          </h3>
          <p className="text-muted-foreground text-lg mb-4">
            Create your first presentation to get started!
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Presentation
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="group hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {subject.subject_type && (
                        <Badge variant="secondary" className="mr-2">
                          {subject.subject_type}
                        </Badge>
                      )}
                      {subject.course_name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {subject.description}
                </p>

                {subject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {subject.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {subject.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{subject.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(subject.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(subject.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/presentations/${subject.id}`)
                    }
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(subject)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSubject}
        onOpenChange={() => setEditingSubject(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Presentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Presentation Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Large Language Models Fundamentals"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject_type">Subject Type</Label>
                <Select
                  value={formData.subject_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical Training">
                      Technical Training
                    </SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Product Training">
                      Product Training
                    </SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-course_name">Course Name</Label>
                <Input
                  id="edit-course_name"
                  value={formData.course_name}
                  onChange={(e) =>
                    setFormData({ ...formData, course_name: e.target.value })
                  }
                  placeholder="e.g., AI & Machine Learning Masterclass"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the presentation content..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g., AI, Machine Learning, LLM, GPT"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingSubject(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubject}>Update Presentation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
