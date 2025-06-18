"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubjectForm } from "./subject-form";
import { Plus } from "lucide-react";

export function CreateSubjectModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new subject in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <SubjectForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
