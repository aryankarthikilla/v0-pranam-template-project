// components/ui/code-block.tsx

"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: "dark" | "light";
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "javascript",
  theme = "dark",
  showLineNumbers = true,
}: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={theme === "dark" ? vscDarkPlus : oneLight}
      showLineNumbers={showLineNumbers}
      customStyle={{
        padding: "1rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        lineHeight: 1.5,
      }}
    >
      {code.trim()}
    </SyntaxHighlighter>
  );
}
