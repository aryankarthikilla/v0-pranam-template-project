"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, MessageCircle, Star } from "lucide-react"

interface CoachingTip {
  id: string
  category: "motivation" | "technique" | "habit" | "mindset"
  title: string
  message: string
  actionable: boolean
  difficulty: "easy" | "medium" | "hard"
}

interface ProductivityScore {
  overall: number
  focus: number
  completion: number
  consistency: number
  efficiency: number
}

export function ProductivityCoach() {
  const [currentTip, setCurrentTip] = useState<CoachingTip | null>(null)
  const [score, setScore] = useState<ProductivityScore>({
    overall: 78,
    focus: 82,
    completion: 75,
    consistency: 80,
    efficiency: 76,
  })
  const [streak, setStreak] = useState(7)
  const [level, setLevel] = useState(3)

  const tips: CoachingTip[] = [
    {
      id: "1",
      category: "technique",
      title: "Try the Pomodoro Technique",
      message:
        "Work in 25-minute focused sessions followed by 5-minute breaks. This can improve your focus score by up to 30%.",
      actionable: true,
      difficulty: "easy",
    },
    {
      id: "2",
      category: "habit",
      title: "Start with your hardest task",
      message:
        "Tackle your most challenging task when your energy is highest. This builds momentum for the rest of your day.",
      actionable: true,
      difficulty: "medium",
    },
    {
      id: "3",
      category: "mindset",
      title: "Celebrate small wins",
      message: "Acknowledging completed tasks, no matter how small, releases dopamine and motivates you to continue.",
      actionable: false,
      difficulty: "easy",
    },
    {
      id: "4",
      category: "motivation",
      title: "Your consistency is impressive!",
      message: `You've maintained a ${streak}-day streak! Consistency is the key to building lasting productivity habits.`,
      actionable: false,
      difficulty: "easy",
    },
  ]

  useEffect(() => {
    // Simulate getting a personalized tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    setCurrentTip(randomTip)
  }, [])

  const getNextTip = () => {
    const availableTips = tips.filter((tip) => tip.id !== currentTip?.id)
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)]
    setCurrentTip(randomTip)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "motivation":
        return "🔥"
      case "technique":
        return "⚡"
      case "habit":
        return "🎯"
      case "mindset":
        return "🧠"
      default:
        return "💡"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "motivation":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "technique":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "habit":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "mindset":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Productivity Coach
        </CardTitle>
        <CardDescription>Personalized coaching to boost your productivity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Level {level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="font-medium">{streak} day streak</span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Productivity Score</span>
            <span className="text-2xl font-bold text-green-600">{score.overall}</span>
          </div>
          <Progress value={score.overall} className="h-3" />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Focus</span>
            <div className="flex items-center gap-2">
              <Progress value={score.focus} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.focus}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Completion</span>
            <div className="flex items-center gap-2">
              <Progress value={score.completion} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.completion}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Consistency</span>
            <div className="flex items-center gap-2">
              <Progress value={score.consistency} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.consistency}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Efficiency</span>
            <div className="flex items-center gap-2">
              <Progress value={score.efficiency} className="h-2 flex-1" />
              <span className="text-sm font-medium">{score.efficiency}</span>
            </div>
          </div>
        </div>

        {/* Current Tip */}
        {currentTip && (
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(currentTip.category)}</span>
                    <Badge className={getCategoryColor(currentTip.category)}>{currentTip.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentTip.difficulty}
                    </Badge>
                  </div>
                  <h5 className="font-medium mb-1">{currentTip.title}</h5>
                  <p className="text-sm text-muted-foreground">{currentTip.message}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="outline" onClick={getNextTip}>
                  Next Tip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Goal */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">This Week's Goal</h4>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-sm">Complete 25 tasks</span>
              <span className="text-sm font-medium">18/25</span>
            </div>
            <Progress value={72} className="h-2 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
