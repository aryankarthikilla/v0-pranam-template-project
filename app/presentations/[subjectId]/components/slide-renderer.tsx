"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownContent } from "@/components/markdown-content";
import type { Slide } from "@/types/presentation";

interface Props {
  slide: Slide;
  isPreview?: boolean;
  className?: string;
}

export function SlideRenderer({
  slide,
  isPreview = false,
  className = "",
}: Props) {
  const getSlideTemplate = () => {
    switch (slide.template) {
      case "title_slide":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-primary leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <h2 className="text-3xl text-muted-foreground font-light">
                  {slide.subtitle}
                </h2>
              )}
            </div>
            {slide.content && (
              <div className="text-xl text-muted-foreground max-w-3xl">
                <MarkdownContent content={slide.content} />
              </div>
            )}
          </div>
        );

      case "section_slide":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-1 bg-primary rounded-full" />
            <h1 className="text-5xl font-bold text-card-foreground">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <h2 className="text-2xl text-muted-foreground">
                {slide.subtitle}
              </h2>
            )}
            <div className="w-24 h-1 bg-primary rounded-full" />
          </div>
        );

      case "code_slide":
        return (
          <div className="h-full flex flex-col space-y-6 p-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-card-foreground">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <h2 className="text-xl text-muted-foreground">
                  {slide.subtitle}
                </h2>
              )}
            </div>

            {slide.content && (
              <div className="text-lg text-muted-foreground">
                <MarkdownContent content={slide.content} />
              </div>
            )}

            {slide.code_block && (
              <div className="flex-1 min-h-0">
                <SyntaxHighlighter
                  language={slide.code_language || "javascript"}
                  style={oneDark}
                  className="rounded-lg text-sm"
                  customStyle={{
                    margin: 0,
                    height: "100%",
                    fontSize: isPreview ? "14px" : "18px",
                  }}
                >
                  {slide.code_block}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        );

      case "closing_slide":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-primary">{slide.title}</h1>
              {slide.subtitle && (
                <h2 className="text-2xl text-muted-foreground">
                  {slide.subtitle}
                </h2>
              )}
            </div>
            {slide.content && (
              <div className="text-lg text-muted-foreground max-w-3xl">
                <MarkdownContent content={slide.content} />
              </div>
            )}
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="w-16 h-px bg-border" />
              <span className="text-sm">Thank you</span>
              <div className="w-16 h-px bg-border" />
            </div>
          </div>
        );

      default: // 'default' template
        return (
          <div className="h-full flex flex-col space-y-6 p-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-card-foreground leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <h2 className="text-xl text-muted-foreground">
                  {slide.subtitle}
                </h2>
              )}
              <Separator className="w-24" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {slide.content && (
                <div className="text-lg text-muted-foreground leading-relaxed">
                  <MarkdownContent content={slide.content} />
                </div>
              )}

              {slide.code_block && (
                <div className="mt-6">
                  <SyntaxHighlighter
                    language={slide.code_language || "javascript"}
                    style={oneDark}
                    className="rounded-lg"
                    customStyle={{
                      fontSize: isPreview ? "12px" : "16px",
                    }}
                  >
                    {slide.code_block}
                  </SyntaxHighlighter>
                </div>
              )}

              {slide.image_url && (
                <div className="mt-6 flex justify-center">
                  <img
                    src={slide.image_url || "/placeholder.svg"}
                    alt={slide.title}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Card
      className={`aspect-video shadow-lg ${className}`}
      style={{
        backgroundColor: slide.background_color,
        color: slide.text_color,
      }}
    >
      <div className="h-full w-full">{getSlideTemplate()}</div>
    </Card>
  );
}
