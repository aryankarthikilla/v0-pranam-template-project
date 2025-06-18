"use client";

import { useState } from "react";
import { Subject, deleteSubject } from "../actions/subjects-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubjectForm } from "./subject-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function SubjectCard({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSubject(subject.id);
      toast.success("Subject deleted");
    } catch (err) {
      toast.error("Failed to delete subject");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{subject.name}</CardTitle>
        <Badge variant={subject.is_active ? "default" : "outline"}>
          {subject.is_active ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {subject.description && <p>{subject.description}</p>}
        {subject.tags.length > 0 && (
          <p>
            <strong>Tags:</strong> {subject.tags.join(", ")}
          </p>
        )}
        {subject.subject_type && (
          <p>
            <strong>Type:</strong> {subject.subject_type}
          </p>
        )}
        {subject.course_name && (
          <p>
            <strong>Course:</strong> {subject.course_name}
          </p>
        )}
        <div className="text-xs pt-2">
          Created: {formatDate(subject.created_at)}
          {subject.updated_at !== subject.created_at && (
            <span className="ml-2">
              • Updated: {formatDate(subject.updated_at)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
            </DialogHeader>
            <SubjectForm subject={subject} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>

        <Button
          size="sm"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
