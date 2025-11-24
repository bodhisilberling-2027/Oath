"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // H2 headers (##)
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-lg font-semibold mt-6 mb-3 text-foreground first:mt-0">
            {line.replace("## ", "")}
          </h2>,
        )
        i++
        continue
      }

      // H3 headers (###)
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {line.replace("### ", "")}
          </h3>,
        )
        i++
        continue
      }

      // Bullet points with sub-items
      if (line.startsWith("- ")) {
        const bulletItems: React.ReactNode[] = []
        let j = i

        while (j < lines.length && (lines[j].startsWith("- ") || lines[j].startsWith("  - "))) {
          const bulletLine = lines[j]

          if (bulletLine.startsWith("  - ")) {
            // Sub-bullet
            bulletItems.push(
              <li key={j} className="ml-6 text-sm text-muted-foreground">
                {parseInlineFormatting(bulletLine.replace("  - ", ""))}
              </li>,
            )
          } else {
            // Main bullet
            bulletItems.push(
              <li key={j} className="text-sm text-foreground">
                {parseInlineFormatting(bulletLine.replace("- ", ""))}
              </li>,
            )
          }
          j++
        }

        elements.push(
          <ul key={i} className="space-y-1.5 mb-4 list-disc list-inside">
            {bulletItems}
          </ul>,
        )
        i = j
        continue
      }

      // Regular paragraphs
      if (line.trim()) {
        elements.push(
          <p key={i} className="text-sm leading-relaxed mb-3 text-foreground">
            {parseInlineFormatting(line)}
          </p>,
        )
      } else {
        elements.push(<div key={i} className="h-2" />)
      }

      i++
    }

    return elements
  }

  const parseInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = []
    let currentText = ""
    let i = 0

    while (i < text.length) {
      // Bold text (**text**)
      if (text[i] === "*" && text[i + 1] === "*") {
        if (currentText) {
          parts.push(currentText)
          currentText = ""
        }

        const endIndex = text.indexOf("**", i + 2)
        if (endIndex !== -1) {
          const boldText = text.substring(i + 2, endIndex)
          parts.push(
            <strong key={i} className="font-semibold text-foreground">
              {boldText}
            </strong>,
          )
          i = endIndex + 2
          continue
        }
      }

      currentText += text[i]
      i++
    }

    if (currentText) {
      parts.push(currentText)
    }

    return parts.length > 0 ? parts : text
  }

  return <div className={className}>{renderMarkdown(content)}</div>
}
