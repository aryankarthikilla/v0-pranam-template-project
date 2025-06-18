"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PresentationMode } from "@/types/presentation";

interface Props {
  presentationMode: PresentationMode;
  onUpdate: (mode: PresentationMode) => void;
  onClose: () => void;
}

export function PresentationSettings({
  presentationMode,
  onUpdate,
  onClose,
}: Props) {
  const updateSetting = (key: keyof PresentationMode, value: any) => {
    onUpdate({ ...presentationMode, [key]: value });
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Presentation Settings</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Settings</CardTitle>
            <CardDescription>
              Configure how your presentation appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Speaker Notes</Label>
                <div className="text-sm text-muted-foreground">
                  Display speaker notes during presentation (Press N to toggle)
                </div>
              </div>
              <Switch
                checked={presentationMode.showNotes}
                onCheckedChange={(checked) =>
                  updateSetting("showNotes", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Timer</Label>
                <div className="text-sm text-muted-foreground">
                  Display session and slide timers (Press T to toggle)
                </div>
              </div>
              <Switch
                checked={presentationMode.showTimer}
                onCheckedChange={(checked) =>
                  updateSetting("showTimer", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto-Advance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto-Advance</CardTitle>
            <CardDescription>
              Automatically advance slides during presentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Advance</Label>
                <div className="text-sm text-muted-foreground">
                  Slides will advance automatically after the specified time
                </div>
              </div>
              <Switch
                checked={presentationMode.autoAdvance}
                onCheckedChange={(checked) =>
                  updateSetting("autoAdvance", checked)
                }
              />
            </div>

            {presentationMode.autoAdvance && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>
                    Auto-Advance Delay: {presentationMode.autoAdvanceDelay}{" "}
                    seconds
                  </Label>
                  <Slider
                    value={[presentationMode.autoAdvanceDelay]}
                    onValueChange={([value]) =>
                      updateSetting("autoAdvanceDelay", value)
                    }
                    min={10}
                    max={300}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10s</span>
                    <span>5 minutes</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Quick reference for presentation controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium">Navigation</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>→ / Space - Next slide</div>
                  <div>← - Previous slide</div>
                  <div>F5 / Ctrl+Enter - Start slideshow</div>
                  <div>ESC - Exit slideshow</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Presentation</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>F - Toggle fullscreen</div>
                  <div>N - Toggle notes</div>
                  <div>T - Toggle timer</div>
                  <div>Ctrl+E - Edit slide</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Settings</CardTitle>
            <CardDescription>Additional presentation options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Presentation Quality</Label>
              <Select defaultValue="high">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Better performance)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Better quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slide Transition</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onClose}>Apply Settings</Button>
      </div>
    </div>
  );
}
