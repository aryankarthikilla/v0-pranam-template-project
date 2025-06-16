"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { createTasksFromAI } from "../actions/ai-task-actions"
import { toast } from "sonner"

export function SmartTaskInput() {
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a description")
      return
    }

    setIsGenerating(true)
    try {
      const result = await createTasksFromAI(input)

      if (result.success) {
        toast.success(`Created ${result.tasks?.length || 0} tasks successfully!`)
        setInput("")
      } else {
        toast.error(result.error || "Failed to generate tasks")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold">AI Task Generator</h3>
          </div>

          <Textarea
            placeholder="Describe what you want to accomplish... 
Examples:
• Plan my wedding
• Launch my online store  
• Organize a team retreat
• Learn React development"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] resize-none border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
            disabled={isGenerating}
          />

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !input.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Tasks...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Tasks with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
