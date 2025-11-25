export type SourceSystem = "slack" | "gmail" | "docs" | "incidents"

export interface ContextSnippet {
  id: string
  source: SourceSystem
  timestamp: string
  author: string
  title?: string
  body: string
  tags: string[]
}

export type InsightPersona = "BoardMember" | "CFO" | "COO"

export interface InsightOutput {
  summary: string[]
  risks: { title: string; detail: string }[]
  followUps: { title: string; ownerSuggestion: string; suggestedDue: string }[]
  questionsForBoard: string[]
  urgentActions: {
    title: string
    description: string
    suggestedOwner: string
    suggestedDue: string
    suggestedActionType: "intro" | "escalation" | "review" | "email" | "meeting"
  }[]
  meta: { persona: InsightPersona; sourcesUsed: SourceSystem[] }
}

