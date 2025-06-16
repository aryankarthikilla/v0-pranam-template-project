"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  Sparkles,
  Plus,
  Target,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  Wand2,
  BarChart3,
} from "lucide-react"
import {
  createPlanningSession,
  createPlanningBlock,
  updatePlanningBlock,
  generateAIPlanningBlocks,
  getSmartSuggestions,
  analyzePlanningSession,
  createTasksFromPlanningBlocks,
} from "../actions/planning-actions"
import { toast } from "sonner"

interface PlanningBlock {
  id: string
  block_type: string
  content: any
  raw_text: string
  position: number
  ai_generated: boolean
  ai_confidence?: number
  created_at: string
  updated_at: string
}

interface PlanningWorkspaceProps {
  isOpen: boolean
  onClose: () => void
  initialContext?: any
}

export function AIPlanningWorkspace({ isOpen, onClose, initialContext }: PlanningWorkspaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState("AI Planning Session")
  const [blocks, setBlocks] = useState<PlanningBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  // Initialize session
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession()
    }
  }, [isOpen])

  const initializeSession = async () => {
    setIsLoading(true)
    try {
      const result = await createPlanningSession(sessionTitle, "general", initialContext)
      if (result.success) {
        setSessionId(result.session.id)
        // Create initial block
        await addBlock("text", { text: "", placeholder: "Start planning here..." }, 0)
      } else {
        toast.error("Failed to create planning session")
      }
    } catch (error) {
      toast.error("Failed to initialize session")
    } finally {
      setIsLoading(false)
    }
  }

  const addBlock = async (type: string, content: any, position: number) => {
    if (!sessionId) return

    try {
      const result = await createPlanningBlock(sessionId, type, content, position)
      if (result.success) {
        setBlocks((prev) => [...prev, result.block].sort((a, b) => a.position - b.position))
        return result.block
      }
    } catch (error) {
      toast.error("Failed to add block")
    }
  }

  const updateBlock = async (blockId: string, content: any) => {
    try {
      const result = await updatePlanningBlock(blockId, content)
      if (result.success) {
        setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, content } : block)))
      }
    } catch (error) {
      toast.error("Failed to update block")
    }
  }

  const handleTextChange = async (blockId: string, text: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    const newContent = { ...block.content, text }
    await updateBlock(blockId, newContent)

    // Get smart suggestions if text is substantial
    if (text.length > 10 && text.length % 20 === 0) {
      getSuggestions(blockId, text, block.block_type)
    }
  }

  const getSuggestions = async (blockId: string, text: string, blockType: string) => {
    if (!sessionId) return

    try {
      const result = await getSmartSuggestions(sessionId, text, blockType, { activeBlockId: blockId })
      if (result.success) {
        setSuggestions(result.suggestions)
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    }
  }

  const generateAIContent = async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const input = blocks.map((b) => b.raw_text).join(" ")
      const context = { availableTime: 60, ...initialContext }

      const result = await generateAIPlanningBlocks(sessionId, input, context)
      if (result.success) {
        setBlocks((prev) => [...prev, ...result.blocks].sort((a, b) => a.position - b.position))
        toast.success("AI content generated successfully!")
      } else {
        toast.error("Failed to generate AI content")
      }
    } catch (error) {
      toast.error("Failed to generate content")
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeSession = async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const result = await analyzePlanningSession(sessionId)
      if (result.success) {
        setAnalysis(result.analysis)
        setShowAnalysis(true)
        toast.success("Analysis complete!")
      } else {
        toast.error("Failed to analyze session")
      }
    } catch (error) {
      toast.error("Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const createTasksFromBlocks = async () => {
    if (!sessionId) return

    const taskBlocks = blocks.filter((b) => b.block_type === "task" || b.content?.actionable)
    if (taskBlocks.length === 0) {
      toast.error("No actionable blocks found")
      return
    }

    setIsLoading(true)
    try {
      const result = await createTasksFromPlanningBlocks(
        sessionId,
        taskBlocks.map((b) => b.id),
      )
      if (result.success) {
        toast.success(`Created ${result.tasks.length} tasks!`)
      } else {
        toast.error("Failed to create tasks")
      }
    } catch (error) {
      toast.error("Failed to create tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "heading":
        return <Target className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "analysis":
        return <BarChart3 className="h-4 w-4" />
      case "insight":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }

  const getBlockColor = (type: string) => {
    switch (type) {
      case "heading":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
      case "task":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20"
      case "analysis":
        return "border-l-purple-500 bg-purple-50 dark:bg-purple-950/20"
      case "insight":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      default:
        return "border-l-gray-300 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Main Planning Area */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      AI Planning Workspace
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">Advanced AI-powered planning and analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={generateAIContent} disabled={isLoading}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                  <Button variant="outline" size="sm" onClick={analyzeSession} disabled={isLoading}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button variant="outline" size="sm" onClick={createTasksFromBlocks} disabled={isLoading}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Create Tasks
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Planning Blocks */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${getBlockColor(block.block_type)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getBlockIcon(block.block_type)}
                        <Badge variant="secondary" className="text-xs">
                          {block.block_type}
                        </Badge>
                        {block.ai_generated && (
                          <Badge className="text-xs bg-purple-100 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI {block.ai_confidence && `${Math.round(block.ai_confidence * 100)}%`}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(block.updated_at).toLocaleTimeString()}
                      </div>
                    </div>

                    {block.block_type === "heading" ? (
                      <Input
                        value={block.content.text || ""}
                        onChange={(e) => handleTextChange(block.id, e.target.value)}
                        placeholder="Enter heading..."
                        className="font-semibold text-lg border-none bg-transparent p-0 focus-visible:ring-0"
                      />
                    ) : (
                      <Textarea
                        ref={(el) => (textareaRefs.current[block.id] = el)}
                        value={block.content.text || ""}
                        onChange={(e) => handleTextChange(block.id, e.target.value)}
                        placeholder={block.content.placeholder || "Start typing..."}
                        className="min-h-[100px] border-none bg-transparent p-0 resize-none focus-visible:ring-0"
                        onFocus={() => setActiveBlockId(block.id)}
                      />
                    )}

                    {block.content.metadata && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        {block.content.estimated_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {block.content.estimated_minutes}m
                          </div>
                        )}
                        {block.content.priority && (
                          <Badge variant="outline" className="text-xs">
                            {block.content.priority}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Block Button */}
                <Button
                  variant="dashed"
                  className="w-full h-16 border-2 border-dashed border-muted-foreground/30 hover:border-purple-400"
                  onClick={() => addBlock("text", { text: "", placeholder: "Continue planning..." }, blocks.length)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Block
                </Button>
              </div>
            </ScrollArea>
          </div>

          {/* AI Suggestions Sidebar */}
          {(suggestions.length > 0 || showAnalysis) && (
            <div className="w-80 border-l bg-muted/30">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Insights
                </h3>
              </div>

              <ScrollArea className="h-full p-4">
                {/* Smart Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground">Smart Suggestions</h4>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-sm">{suggestion.suggestion}</p>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.reasoning}</p>
                        <Button size="sm" variant="ghost" className="mt-2 h-6 text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analysis Results */}
                {showAnalysis && analysis && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Plan Analysis</h4>

                    {/* Overall Assessment */}
                    <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border">
                      <h5 className="font-medium mb-2">Overall Assessment</h5>
                      <div className="space-y-2">
                        {Object.entries(analysis.overall_assessment || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace("_", " ")}</span>
                            <Badge
                              className={`text-xs ${Number(value) > 0.8 ? "bg-green-100 text-green-700" : Number(value) > 0.6 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                            >
                              {Math.round(Number(value) * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
                    {analysis.insights && (
                      <div className="space-y-2">
                        <h5 className="font-medium">Key Insights</h5>
                        {analysis.insights.map((insight: any, index: number) => (
                          <div key={index} className="p-2 rounded bg-blue-50 dark:bg-blue-950/20 text-sm">
                            <div className="font-medium">{insight.title}</div>
                            <div className="text-muted-foreground">{insight.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations && (
                      <div className="space-y-2">
                        <h5 className="font-medium">Recommendations</h5>
                        {analysis.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="p-2 rounded bg-green-50 dark:bg-green-950/20 text-sm">
                            <div className="font-medium">{rec.action}</div>
                            <div className="text-muted-foreground">{rec.reasoning}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
