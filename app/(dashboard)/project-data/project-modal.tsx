"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectItem } from "./page";

const TYPES = ["Github", "Vercel", "Supabase", "Hyperlink", "Notes"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: ProjectItem, isEdit: boolean) => void;
  initialData?: ProjectItem | null;
}

export function ProjectModal({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState<ProjectItem>({
    id: "",
    type: "Github",
    name: "",
    url: "",
    username: "",
    password: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        id: "",
        type: "Github",
        name: "",
        url: "",
        username: "",
        password: "",
        notes: "",
      });
  }, [initialData]);

  const isNotes = form.type === "Notes";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = () => {
    onSave(form, !!initialData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Config" : "Add Config"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          {!isNotes && (
            <>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={form.url || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username || ""}
                  onChange={handleChange}
                  placeholder="Username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  placeholder="Password"
                  type="password"
                />
              </div>
            </>
          )}

          {isNotes && (
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
                placeholder="Write notes here..."
                rows={5}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="btn-primary-gradient">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
