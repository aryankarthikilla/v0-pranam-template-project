"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Lightbulb, Clock, MapPin, Zap, Plus, Save, Play } from "lucide-react"
import { generateOpportunisticTasks } from "../actions/ai-task-actions-enhanced"
import { createTaskFromSuggestion, createAndStartTaskFromSuggestion } from "../actions/smart-task-actions"
import { toast } from "sonner"

interface OpportunisticTaskSuggestionsProps {
  currentLocation?: string
  availableTime?: number
  activeTasks: any[]
}

export function OpportunisticTaskSuggestions({
  currentLocation,
  availableTime = 30,
  activeTasks,
}: OpportunisticTaskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isContextOpen, setIsContextOpen] = useState(false)
  const [contextInput, setContextInput] = useState("")
  const [timeInput, setTimeInput] = useState(availableTime.toString())
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: "start" | "save" | null }>({})

  const getSuggestions = async (context?: string, time?: number) => {
    setIsLoading(true)
    try {
      const result = await generateOpportunisticTasks({
        context: context || currentLocation || "general",
        availableTime: time || availableTime,
        activeTasks: activeTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
      })

      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions)
      } else {
        toast.error("Failed to get suggestions")
      }
    } catch (error) {
      toast.error("Failed to get suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTask = async (suggestion: any, index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: "save" }))

    try {
      const result = await createTaskFromSuggestion({
        title: suggestion.title,
        description: suggestion.description,
        estimated_minutes: suggestion.estimated_minutes || suggestion.estimatedMinutes || 15,
        priority: suggestion.priority,
        context_type: suggestion.context_type,
        reasoning: suggestion.reasoning,
      })

      if (result.success) {
        toast.success(`Task "${suggestion.title}" saved to your task list!`)
        // Remove this suggestion from the list
        setSuggestions((prev) => prev.filter((_, i) => i !== index))
      } else {
        toast.error(result.error || "Failed to save task")
      }
    } catch (error) {
      toast.error("Failed to save task")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: null }))
    }
  }

  const handleStartTask = async (suggestion: any, index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: "start" }))

    try {
      const result = await createAndStartTaskFromSuggestion(
        {
          title: suggestion.title,
          description: suggestion.description,
          estimated_minutes: suggestion.estimated_minutes || suggestion.estimatedMinutes || 15,
          priority: suggestion.priority,
          context_type: suggestion.context_type,
          reasoning: suggestion.reasoning,
        },
        currentLocation,
      )

      if (result.success) {
        toast.success(`Task "${suggestion.title}" created and started!`)
        // Remove this suggestion from the list
        setSuggestions((prev) => prev.filter((_, i) => i !== index))
      } else {
        toast.error(result.error || "Failed to start task")
      }
    } catch (error) {
      toast.error("Failed to start task")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: null }))
    }
  }

  const handleContextSubmit = () => {
    getSuggestions(contextInput, Number.parseInt(timeInput))
    setIsContextOpen(false)
  }

  useEffect(() => {
    if (currentLocation || activeTasks.length > 0) {
      getSuggestions()
    }
  }, [currentLocation, activeTasks.length])

  if (suggestions.length === 0 && !isLoading) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center text-sm mb-3">No smart suggestions available right now</p>
          <Dialog open={isContextOpen} onOpenChange={setIsContextOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Get Suggestions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Get Smart Task Suggestions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Situation</label>
                  <Input
                    placeholder="e.g., waiting at hospital, commuting, have 30 minutes free"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Available Time (minutes)</label>
                  <Input
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    min="5"
                    max="240"
                  />
                </div>
                <Button onClick={handleContextSubmit} className="w-full">
                  Get Suggestions
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-yellow-700 dark:text-yellow-300">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </div>
          <Dialog open={isContextOpen} onOpenChange={setIsContextOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-yellow-600 hover:bg-yellow-100">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Context</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Situation</label>
                  <Input
                    placeholder="e.g., waiting at hospital, commuting, have 30 minutes free"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Available Time (minutes)</label>
                  <Input
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    min="5"
                    max="240"
                  />
                </div>
                <Button onClick={handleContextSubmit} className="w-full">
                  Update Suggestions
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-sm">AI is finding perfect tasks for you...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              {currentLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {currentLocation}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {availableTime} min available
              </div>
            </div>

            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    {suggestion.reasoning && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">
                        💡 {suggestion.reasoning}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.estimated_minutes || suggestion.estimatedMinutes}m
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {suggestion.priority}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveTask(suggestion, index)}
                      disabled={loadingStates[index] !== null}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                    >
                      {loadingStates[index] === "save" ? (
                        <Zap className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
                      Save
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleStartTask(suggestion, index)}
                      disabled={loadingStates[index] !== null}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {loadingStates[index] === "start" ? (
                        <Zap className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}
