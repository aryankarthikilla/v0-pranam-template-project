"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createAnalysis,
  deleteAnalysis,
  getThoughtAnalysis,
  ThoughtAnalysis,
  ThoughtAnalysisType,
} from "../actions/thought-analysis-actions";

interface ThoughtAnalyzerModalProps {
  thoughtId: string;
  open: boolean;
  onClose: () => void;
  thoughtTitle: string;
  thoughtContent: string;
  onCountChange?: (counts: Record<ThoughtAnalysisType, number>) => void;
}

const types: ThoughtAnalysisType[] = ["advantage", "disadvantage", "neutral"];

export function ThoughtAnalyzerModal({
  thoughtId,
  open,
  onClose,
  thoughtTitle,
  thoughtContent,
  onCountChange,
}: ThoughtAnalyzerModalProps) {
  const [analysis, setAnalysis] = useState<ThoughtAnalysis[]>([]);
  const [inputs, setInputs] = useState<Record<ThoughtAnalysisType, string>>({
    advantage: "",
    disadvantage: "",
    neutral: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const refreshAnalysis = async () => {
    const updated = await getThoughtAnalysis(thoughtId);
    setAnalysis(updated);
    if (onCountChange) {
      const counts = types.reduce((acc, type) => {
        acc[type] = updated.filter((a) => a.type === type).length;
        return acc;
      }, {} as Record<ThoughtAnalysisType, number>);
      onCountChange(counts);
    }
  };

  useEffect(() => {
    if (open && thoughtId) {
      refreshAnalysis();
    }
  }, [open, thoughtId]);

  const handleSave = async (type: ThoughtAnalysisType) => {
    const content = inputs[type].trim();
    if (!content) return;

    setIsSaving(true);
    await createAnalysis({ thought_id: thoughtId, type, content });
    await refreshAnalysis();
    setInputs((prev) => ({ ...prev, [type]: "" }));
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAnalysis(id);
    await refreshAnalysis();
  };

  const totalCount = analysis.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Thought Analysis ({totalCount})</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-semibold">{thoughtTitle}:</span>{" "}
            {thoughtContent}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {types.map((type) => (
            <div key={type} className="space-y-2">
              <h3 className="text-sm font-semibold capitalize text-muted-foreground">
                {type}
              </h3>

              {analysis
                .filter((a) => a.type === type)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="text-sm bg-muted p-2 rounded-md flex justify-between items-start"
                  >
                    <span className="break-words pr-2">{entry.content}</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-destructive hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}

              <Textarea
                value={inputs[type]}
                onChange={(e) =>
                  setInputs((prev) => ({ ...prev, [type]: e.target.value }))
                }
                placeholder={`Add a ${type}`}
                rows={3}
              />

              <Button
                size="sm"
                onClick={() => handleSave(type)}
                disabled={isSaving || !inputs[type].trim()}
              >
                Add {type}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
