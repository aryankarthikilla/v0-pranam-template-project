"use client";

import { useState } from "react";
import {
  createSubject,
  updateSubject,
  Subject,
} from "../actions/subjects-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SubjectForm({
  subject,
  onSuccess,
}: {
  subject?: Subject;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    name: subject?.name || "",
    subject_type: subject?.subject_type || "",
    course_name: subject?.course_name || "",
    tags: subject?.tags?.join(", ") || "",
    description: subject?.description || "",
  });

  const handleSubmit = async () => {
    try {
      const tagsArray = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (subject) {
        await updateSubject({ ...form, tags: tagsArray, id: subject.id });
        toast.success("Subject updated");
      } else {
        await createSubject({ ...form, tags: tagsArray });
        toast.success("Subject created");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Subject name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Type (e.g. Framework, Science)"
        value={form.subject_type}
        onChange={(e) => setForm({ ...form, subject_type: e.target.value })}
      />
      <Input
        placeholder="Course name"
        value={form.course_name}
        onChange={(e) => setForm({ ...form, course_name: e.target.value })}
      />
      <Input
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Button onClick={handleSubmit}>{subject ? "Update" : "Create"}</Button>
    </div>
  );
}
