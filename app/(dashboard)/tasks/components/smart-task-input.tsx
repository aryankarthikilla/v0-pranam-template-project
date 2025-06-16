"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Lightbulb } from "lucide-react"
import { createTasksFromAI } from "../actions/ai-task-actions-enhanced"
import { toast } from "sonner"

interface SmartTaskInputProps {
  onTaskCreated: () => void
}

export function SmartTaskInput({ onTaskCreated }: SmartTaskInputProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a description")
      return
    }

    setIsLoading(true)
    try {
      const result = await createTasksFromAI(input)

      if (result.success) {
        toast.success(`Created ${result.tasks?.length || 0} tasks successfully!`)
        setInput("")
        onTaskCreated()
      } else {
        toast.error(result.error || "Failed to generate tasks")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const examplePrompts = [
    "Plan my week for the product launch",
    "Organize my home office workspace",
    "Prepare for the quarterly review meeting",
    "Set up a new fitness routine",
    "Learn React and build a portfolio",
  ]

  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Sparkles className="h-5 w-5" />
          Smart Task Creation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe what you want to accomplish...
Examples:
• Plan a product launch
• Organize a conference  
• Build a mobile app
• Start a fitness routine"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>AI will create multiple related tasks</span>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Tasks
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(prompt)}
              className="text-xs h-auto py-1 px-2 text-green-700 border-green-300 hover:bg-green-50"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
