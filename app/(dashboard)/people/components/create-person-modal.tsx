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
import { PersonForm } from "./person-form";
import { Plus } from "lucide-react";

export function CreatePersonModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Person
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Person</DialogTitle>
          <DialogDescription>
            Fill out the details of the person you want to add.
          </DialogDescription>
        </DialogHeader>
        <PersonForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
