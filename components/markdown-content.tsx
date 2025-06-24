"use client";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  // Parse markdown
  const parseMarkdown = (text: string) => {
    if (!text) return "";

    // Replace markdown patterns with HTML
    let html = text
      // Bold: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

      // Italic: *text* -> <em>text</em> (but not if it's part of a bold pattern)
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")

      // Strikethrough: ~~text~~ -> <del>text</del>
      .replace(/~~(.*?)~~/g, "<del>$1</del>")

      // Inline code: `text` -> <code>text</code>
      .replace(
        /`([^`]+)`/g,
        "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>"
      )

      // Lists: Convert markdown lists to HTML lists
      .replace(/^\s*[-*+]\s+(.*?)$/gm, "<li>$1</li>")

      // Line breaks: \n -> <br>
      .replace(/\n/g, "<br />");

    // Wrap lists in <ul> tags
    if (html.includes("<li>")) {
      html = html.replace(
        /<li>.*?<\/li>/gs,
        (match) => `<ul class="list-disc pl-6 space-y-1">${match}</ul>`
      );
      // Remove nested lists
      html = html.replace(
        /<ul class="list-disc pl-6 space-y-1">(<ul class="list-disc pl-6 space-y-1">.*?<\/ul>)<\/ul>/gs,
        "$1"
      );
    }

    return html;
  };

  const parsedContent = parseMarkdown(content);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
}
