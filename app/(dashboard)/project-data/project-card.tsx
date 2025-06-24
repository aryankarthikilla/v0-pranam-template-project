"use client";

import { Copy, Edit, Trash2 } from "lucide-react";
import { ProjectItem } from "./page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // ✅ make sure this path is correct

interface Props {
  item: ProjectItem;
  onEdit: (item: ProjectItem) => void;
  onDelete: (item: ProjectItem) => void;
}

export function ProjectCard({ item, onEdit, onDelete }: Props) {
  const { toast } = useToast(); // ✅ fix: destructure toast from the hook

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      variant: "success", // optional: visually differentiate
    });
  };

  return (
    <Card className="p-4 space-y-2 border border-border">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item)}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{item.type}</p>

      {item.url && (
        <div className="flex items-center justify-between">
          <span className="truncate text-sm">{item.url}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(item.url!, "URL")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}

      {item.username && (
        <div className="flex items-center justify-between">
          <span className="text-sm">{item.username}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(item.username!, "Username")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}

      {item.password && (
        <div className="flex items-center justify-between">
          <span className="text-sm">••••••••</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(item.password!, "Password")}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}

      {item.notes && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {item.notes}
        </p>
      )}
    </Card>
  );
}
