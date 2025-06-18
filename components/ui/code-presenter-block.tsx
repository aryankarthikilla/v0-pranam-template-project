// components/ui/code-presenter-block.tsx

import { ReactNode } from "react";
import { CodeBlock } from "./code-block";

interface CodePresenterBlockProps {
  title?: string;
  description?: string;
  code: string;
  language?: string;
  children?: ReactNode;
  theme?: "dark" | "light";
}

export function CodePresenterBlock({
  title,
  description,
  code,
  language = "javascript",
  children,
  theme = "dark",
}: CodePresenterBlockProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-sm">
      {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {children && <div className="mb-2">{children}</div>}
      <CodeBlock code={code} language={language} theme={theme} />
    </div>
  );
}
