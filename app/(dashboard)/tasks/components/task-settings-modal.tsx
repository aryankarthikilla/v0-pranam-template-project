"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTaskSettings,
  updateTaskSettings,
  getFilterOptions,
} from "../actions/task-settings-actions";

interface TaskSettingsModalProps {
  onSettingsChange?: () => void;
}

export function TaskSettingsModal({
  onSettingsChange,
}: TaskSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<
    Array<{ filter_key: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [settings, options] = await Promise.all([
        getTaskSettings(),
        getFilterOptions(),
      ]);
      setCurrentSetting(settings.show_completed_tasks || "no");
      setFilterOptions(options);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSettingChange = async (value: string) => {
    setLoading(true);
    try {
      await updateTaskSettings(value);
      setCurrentSetting(value);
      onSettingsChange?.();
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-200"
        >
          <Settings className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Display Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Show completed tasks</label>
            <Select
              value={currentSetting}
              onValueChange={handleSettingChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Don't show completed tasks</SelectItem>
                {filterOptions
                  .filter((option) => option.filter_key !== "no")
                  .map((option) => (
                    <SelectItem
                      key={option.filter_key}
                      value={option.filter_key}
                    >
                      {option.filter_key}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
