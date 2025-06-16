import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pranam Task Manager",
    short_name: "Pranam Tasks",
    description: "AI-powered task management system with smart productivity features",
    start_url: "/dashboard/tasks",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["productivity", "business"],
    shortcuts: [
      {
        name: "Quick Task",
        short_name: "Quick Task",
        description: "Add a quick task",
        url: "/dashboard/tasks/manage?quick=true",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Active Tasks",
        short_name: "Active",
        description: "View active tasks",
        url: "/dashboard/tasks?view=active",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  }
}
