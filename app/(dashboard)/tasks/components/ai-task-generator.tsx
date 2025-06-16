"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, Plus, RefreshCw } from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks"

interface AIGeneratedTask {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category: string
  confidence: number
  estimatedTime: string
}

export function AITaskGenerator() {
  const { t } = useTranslation("tasks")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<AIGeneratedTask[]>([])

  const generateTasks = async () => {
    setIsGenerating(true)

    // Simulate AI task generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTasks: AIGeneratedTask[] = [
      {
        id: "1",
        title: "Review and optimize morning routine",
        description: "Analyze current morning habits and identify areas for improvement to boost daily productivity.",
        priority: "medium",
        category: "Personal Development",
        confidence: 0.92,
        estimatedTime: "30 minutes",
      },
      {
        id: "2",
        title: "Organize digital workspace",
        description: "Clean up desktop files, organize folders, and optimize digital tools for better workflow.",
        priority: "high",
        category: "Productivity",
        confidence: 0.88,
        estimatedTime: "45 minutes",
      },
      {
        id: "3",
        title: "Plan weekly learning goals",
        description: "Set specific learning objectives for the week and identify resources needed.",
        priority: "low",
        category: "Learning",
        confidence: 0.85,
        estimatedTime: "20 minutes",
      },
    ]

    setGeneratedTasks(mockTasks)
    setIsGenerating(false)
  }

  const addTask = (task: AIGeneratedTask) => {
    // Here you would integrate with your task creation logic
    console.log("Adding AI-generated task:", task)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Task Generator
        </CardTitle>
        <CardDescription>Let AI suggest personalized tasks based on your productivity patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateTasks} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating Tasks...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate AI Tasks
            </>
          )}
        </Button>

        {generatedTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">AI Generated Suggestions</h4>
            {generatedTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.category}</Badge>
                        <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                        <span className="text-xs text-green-600">{Math.round(task.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addTask(task)} className="ml-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
