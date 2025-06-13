import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Database, Layout, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">प्र</span>
            </div>
            <span className="text-xl font-bold text-gray-900">प्रणाम (Pranam)</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">लॉगिन (Login)</Button>
            </Link>
            <Link href="/login">
              <Button>शुरू करें (Get Started)</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            तेज़ी से बनाएं <span className="text-orange-600">प्रणाम</span> के साथ
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            एक आधुनिक Next.js स्टार्टर टेम्प्लेट Supabase प्रमाणीकरण, रेस्पॉन्सिव डिज़ाइन के साथ, और सब कुछ जो आपको तुरंत शिप करने के लिए
            चाहिए।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                शुरू करें (Get Started)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-orange-200 hover:bg-orange-50">
              डेमो देखें (View Demo)
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">सब कुछ जो आपको चाहिए</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            आधुनिक तकनीकों और सर्वोत्तम प्रथाओं के साथ तेज़ विकास के लिए बनाया गया।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>प्रमाणीकरण तैयार</CardTitle>
              <CardDescription>Supabase के साथ पूर्ण auth flow जिसमें लॉगिन, साइनअप, और संरक्षित रूट शामिल हैं।</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Layout className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>रेस्पॉन्सिव डिज़ाइन</CardTitle>
              <CardDescription>
                shadcn/ui और Tailwind CSS का उपयोग करके सुंदर घटकों के साथ मोबाइल-फर्स्ट डिज़ाइन।
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Database className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>डेटाबेस एकीकरण</CardTitle>
              <CardDescription>उपयोगकर्ता प्रबंधन और रीयल-टाइम क्षमताओं के साथ Supabase एकीकरण।</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">प्र</span>
              </div>
              <span className="font-semibold text-gray-900">प्रणाम (Pranam)</span>
            </div>
            <p className="text-gray-600 text-sm">Next.js, Supabase, और Tailwind CSS के साथ बनाया गया</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
