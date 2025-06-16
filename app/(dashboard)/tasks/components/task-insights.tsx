"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Target, Brain } from "lucide-react"

interface InsightData {
  completionRate: number
  averageTaskTime: string
  mostProductiveTime: string
  topCategory: string
  weeklyTrend: number
  suggestions: string[]
}

export function TaskInsights() {
  // Mock data - in real app, this would come from your analytics
  const insights: InsightData = {
    completionRate: 78,
    averageTaskTime: "32 minutes",
    mostProductiveTime: "10:00 AM - 12:00 PM",
    topCategory: "Development",
    weeklyTrend: 12,
    suggestions: [
      "You complete 23% more tasks in the morning",
      "Breaking large tasks into smaller ones improves completion by 31%",
      "Your productivity peaks on Tuesdays and Wednesdays",
    ],
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Task Insights
        </CardTitle>
        <CardDescription>Personalized analytics and recommendations based on your task patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm text-muted-foreground">{insights.completionRate}%</span>
          </div>
          <Progress value={insights.completionRate} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Avg. Task Time</span>
            </div>
            <p className="text-lg font-semibold">{insights.averageTaskTime}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Top Category</span>
            </div>
            <p className="text-lg font-semibold">{insights.topCategory}</p>
          </div>
        </div>

        {/* Productivity Peak */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Most Productive Time</h4>
          <Badge variant="outline" className="text-sm">
            {insights.mostProductiveTime}
          </Badge>
        </div>

        {/* Weekly Trend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Weekly Trend</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+{insights.weeklyTrend}%</span>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">AI Recommendations</h4>
          <div className="space-y-2">
            {insights.suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-l-blue-500">
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
