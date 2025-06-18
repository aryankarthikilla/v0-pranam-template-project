"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Clock,
  Users,
  TrendingUp,
  Star,
  MessageSquare,
  Download,
  Calendar,
} from "lucide-react";
import type { Subject, Slide } from "@/types/presentation";
import { formatDate } from "@/lib/date-utils";

interface Props {
  subject: Subject;
  slides: Slide[];
  onClose: () => void;
}

// Mock analytics data - replace with real data from your API
const mockAnalytics = {
  totalSessions: 12,
  totalAudience: 340,
  averageRating: 4.6,
  totalDuration: 720, // minutes
  slidePerformance: [
    { slideNumber: 1, timeSpent: 180, engagement: 9, questions: 3 },
    { slideNumber: 2, timeSpent: 240, engagement: 8, questions: 5 },
    { slideNumber: 3, timeSpent: 300, engagement: 7, questions: 8 },
    { slideNumber: 4, timeSpent: 420, engagement: 9, questions: 12 },
    { slideNumber: 5, timeSpent: 200, engagement: 6, questions: 2 },
    { slideNumber: 6, timeSpent: 160, engagement: 8, questions: 4 },
    { slideNumber: 7, timeSpent: 120, engagement: 7, questions: 1 },
  ],
  sessionHistory: [
    { date: "2024-01-15T00:00:00Z", audience: 25, rating: 4.8, duration: 60 },
    { date: "2024-01-10T00:00:00Z", audience: 30, rating: 4.5, duration: 65 },
    { date: "2024-01-05T00:00:00Z", audience: 28, rating: 4.7, duration: 58 },
    { date: "2024-12-20T00:00:00Z", audience: 35, rating: 4.4, duration: 70 },
    { date: "2024-12-15T00:00:00Z", audience: 22, rating: 4.9, duration: 55 },
  ],
  feedback: [
    { rating: 5, count: 180, percentage: 53 },
    { rating: 4, count: 120, percentage: 35 },
    { rating: 3, count: 30, percentage: 9 },
    { rating: 2, count: 8, percentage: 2 },
    { rating: 1, count: 2, percentage: 1 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function PresentationAnalytics({ subject, slides, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const exportAnalytics = () => {
    const data = {
      subject: subject.name,
      exportDate: new Date().toISOString(),
      analytics: mockAnalytics,
      slides: slides.map((slide) => ({
        title: slide.title,
        type: slide.slide_type,
        order: slide.slide_order,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.name}-analytics-${formatDate(
      new Date().toISOString()
    )}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Presentation Analytics</span>
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="slides">Slide Performance</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Total Sessions</div>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {mockAnalytics.totalSessions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Total Audience</div>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {mockAnalytics.totalAudience}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Avg Rating</div>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {mockAnalytics.averageRating}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Total Hours</div>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {Math.round(mockAnalytics.totalDuration / 60)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Trend</CardTitle>
              <CardDescription>
                Audience size and ratings over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalytics.sessionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatDate(value)}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip labelFormatter={(value) => formatDate(value)} />
                  <Bar
                    yAxisId="left"
                    dataKey="audience"
                    fill="#8884d8"
                    name="Audience Size"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rating"
                    stroke="#82ca9d"
                    name="Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{subject.name}</span>
                <Badge variant="secondary">{slides.length} slides</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {subject.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {subject.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Slide Performance Analysis</CardTitle>
              <CardDescription>
                Time spent and engagement per slide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockAnalytics.slidePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="slideNumber" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="timeSpent"
                    fill="#8884d8"
                    name="Time Spent (seconds)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="questions"
                    fill="#82ca9d"
                    name="Questions Asked"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {slides.map((slide, index) => {
              const performance = mockAnalytics.slidePerformance[index];
              return (
                <Card key={slide.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <h4 className="font-medium">{slide.title}</h4>
                          <Badge variant="secondary">{slide.slide_type}</Badge>
                        </div>
                        {slide.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {slide.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {performance
                            ? formatDuration(performance.timeSpent)
                            : "N/A"}
                        </div>
                        <div className="text-sm">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {performance ? performance.questions : 0} questions
                        </div>
                        <div className="text-sm">
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          {performance ? performance.engagement : 0}/10
                          engagement
                        </div>
                      </div>
                    </div>
                    {performance && (
                      <Progress
                        value={performance.engagement * 10}
                        className="mt-2"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Past presentation sessions and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.sessionHistory.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatDate(session.date)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.audience} attendees • {session.duration}{" "}
                        minutes
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{session.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>
                  How audiences rate your presentations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalytics.feedback}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, percentage }) =>
                        `${rating}★ (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockAnalytics.feedback.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Ratings</CardTitle>
                <CardDescription>
                  Breakdown of audience feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAnalytics.feedback.map((item) => (
                  <div key={item.rating} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{item.rating} Stars</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
