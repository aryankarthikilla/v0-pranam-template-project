"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Plus, X, RefreshCw } from "lucide-react"

interface SmartSuggestion {
  id: string
  type: "task" | "optimization" | "habit"
  title: string
  description: string
  reason: string
  priority: "low" | "medium" | "high"
  impact: number
}

export function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  const loadSuggestions = async () => {
    setIsLoading(true)

    // Simulate AI suggestion generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockSuggestions: SmartSuggestion[] = [
      {
        id: "1",
        type: "task",
        title: "Schedule weekly review session",
        description: "Set up a recurring 30-minute session to review completed tasks and plan ahead.",
        reason: "Users with weekly reviews complete 34% more tasks",
        priority: "high",
        impact: 85,
      },
      {
        id: "2",
        type: "optimization",
        title: "Batch similar tasks together",
        description: "Group similar tasks (emails, calls, research) to reduce context switching.",
        reason: "Based on your task patterns, this could save 45 minutes daily",
        priority: "medium",
        impact: 72,
      },
      {
        id: "3",
        type: "habit",
        title: "Add 5-minute breaks between tasks",
        description: "Short breaks can improve focus and prevent burnout.",
        reason: "Your completion rate drops after 90 minutes of continuous work",
        priority: "medium",
        impact: 68,
      },
    ]

    setSuggestions(mockSuggestions.filter((s) => !dismissedSuggestions.includes(s.id)))
    setIsLoading(false)
  }

  useEffect(() => {
    loadSuggestions()
  }, [dismissedSuggestions])

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions((prev) => [...prev, id])
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  const applySuggestion = (suggestion: SmartSuggestion) => {
    // Here you would integrate with your task creation or settings update logic
    console.log("Applying suggestion:", suggestion)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return "📋"
      case "optimization":
        return "⚡"
      case "habit":
        return "🎯"
      default:
        return "💡"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "optimization":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "habit":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Smart Suggestions
        </CardTitle>
        <CardDescription>AI-powered recommendations to optimize your productivity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{suggestions.length} active suggestions</span>
          <Button variant="outline" size="sm" onClick={loadSuggestions} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No new suggestions at the moment.</p>
            <p className="text-sm">Check back later for personalized recommendations!</p>
          </div>
        )}

        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <Badge className={getTypeColor(suggestion.type)}>{suggestion.type}</Badge>
                    <Badge
                      variant={
                        suggestion.priority === "high"
                          ? "destructive"
                          : suggestion.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>

                  <h5 className="font-medium mb-1">{suggestion.title}</h5>
                  <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>💡 {suggestion.reason}</span>
                    <span>📈 {suggestion.impact}% impact</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Button size="sm" onClick={() => applySuggestion(suggestion)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismissSuggestion(suggestion.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
