// app/(dashboard)/project-data/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "./project-modal";
import { ProjectCard } from "./project-card";

export type ProjectItem = {
  id: string;
  type: string;
  name: string;
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
};

export default function ProjectDataPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectItem | null>(null);

  const load = async () => {
    const res = await fetch("/api/project-data");
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch("/api/project-data", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    load();
  };

  const handleSave = async (item: ProjectItem, isEdit = false) => {
    await fetch("/api/project-data", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(item),
      headers: { "Content-Type": "application/json" },
    });
    setOpen(false);
    setEditItem(null);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Project Data</h1>
          <p className="text-muted-foreground">
            Store important project credentials and URLs here.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Config
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No project data available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((item) => (
            <ProjectCard
              key={item.id}
              item={item}
              onEdit={() => {
                setEditItem(item);
                setOpen(true);
              }}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      <ProjectModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        initialData={editItem}
      />
    </div>
  );
}
