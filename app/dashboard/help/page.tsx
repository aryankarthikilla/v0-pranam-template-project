"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Book, Video, ExternalLink } from "lucide-react"

const helpCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of using Pranam",
    articles: 12,
    icon: Book,
  },
  {
    title: "User Management",
    description: "How to manage users and permissions",
    articles: 8,
    icon: MessageCircle,
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    articles: 15,
    icon: Book,
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    articles: 6,
    icon: Video,
  },
]

const popularArticles = [
  {
    title: "How to set up your first project",
    category: "Getting Started",
    views: "2.3k views",
  },
  {
    title: "Managing user roles and permissions",
    category: "User Management",
    views: "1.8k views",
  },
  {
    title: "API authentication guide",
    category: "API Documentation",
    views: "1.5k views",
  },
  {
    title: "Customizing your dashboard",
    category: "Getting Started",
    views: "1.2k views",
  },
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers to your questions and learn how to use Pranam</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for help articles..." className="pl-10 h-12 text-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {helpCategories.map((category) => (
            <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{category.articles} articles</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Articles</CardTitle>
          <CardDescription>Most viewed help articles this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <div>
                  <h3 className="font-medium">{article.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <span>{article.views}</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>Can't find what you're looking for? Get in touch with our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Schedule a Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
