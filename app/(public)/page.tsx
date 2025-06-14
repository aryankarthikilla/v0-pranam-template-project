import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to the SaaS Starter</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Secure user authentication with NextAuth.js.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Implement robust authentication flows, including social logins and password management.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Integration</CardTitle>
              <CardDescription>Connect to your database of choice with Prisma.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Easily manage your data models and interact with your database using Prisma's intuitive API.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>Beautifully designed UI components with Shadcn UI.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Build stunning user interfaces quickly with a comprehensive library of pre-built components.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Installation</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5">
                <li>Clone the repository.</li>
                <li>Install dependencies: `npm install`</li>
                <li>Configure your environment variables.</li>
                <li>Run the development server: `npm run dev`</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Configuration</AccordionTrigger>
            <AccordionContent>
              <p>
                Refer to the documentation for detailed instructions on configuring authentication, database
                connections, and other settings.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Deployment</AccordionTrigger>
            <AccordionContent>
              <p>
                Deploy your application to your preferred hosting platform. Consider using platforms like Vercel or
                Netlify for seamless deployment.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Navigation</h2>
        <div className="flex flex-col space-y-2">
          <Link href="/theme-builder">
            <Button variant="outline" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Theme Builder
            </Button>
          </Link>
          <Link href="/theme-showcase">
            <Button variant="outline" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Theme Showcase
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
