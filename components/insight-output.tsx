"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { InsightOutput, InsightPersona, SourceSystem } from "@/lib/insight-types"

interface InsightOutputViewProps {
  insight: InsightOutput | null
  isLoading: boolean
  persona: InsightPersona
  selectedCounts: { source: SourceSystem; count: number }[]
  variant?: "panel" | "lab"
}

const SOURCE_LABELS: Record<SourceSystem, string> = {
  slack: "Slack",
  gmail: "Gmail",
  docs: "Docs",
  incidents: "Incidents",
}

const PERSONA_LABELS: Record<InsightPersona, string> = {
  BoardMember: "Board Member",
  CFO: "CFO",
  COO: "COO",
}

const ACTION_CTAS = {
  intro: "Draft warm intro",
  escalation: "Draft escalation email",
  review: "Schedule review",
  email: "Send briefing email",
  meeting: "Book working session",
}

export function InsightOutputView({
  insight,
  isLoading,
  persona,
  selectedCounts,
  variant = "panel",
}: InsightOutputViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Oath is analyzing your context</p>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!insight) {
    return (
      <Card className="border-dashed bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          Select sources and ask the Insight Agent to generate a board-ready briefing.
        </p>
      </Card>
    )
  }

  const personaLabel = PERSONA_LABELS[insight.meta.persona ?? persona]

  const metaLine = buildMetaLine(selectedCounts, personaLabel)

  return (
    <div className={cn("space-y-6", variant === "lab" && "space-y-8")}>
      <section className="space-y-3">
        <h4 className="text-lg font-semibold">Top risks and red flags</h4>
        <div className="grid gap-3">
          {insight.risks.map((risk, idx) => (
            <div key={idx} className="rounded-xl border bg-muted/10 p-4">
              <p className="font-medium">{risk.title}</p>
              <p className="text-sm text-muted-foreground">{risk.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-lg font-semibold">Key follow-ups</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Follow-up</TableHead>
              <TableHead>Suggested owner</TableHead>
              <TableHead>Suggested due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insight.followUps.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="whitespace-normal">{item.title}</TableCell>
                <TableCell>{item.ownerSuggestion}</TableCell>
                <TableCell>{item.suggestedDue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3">
        <h4 className="text-lg font-semibold">Questions for the board</h4>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {insight.questionsForBoard.map((question, idx) => (
            <li key={idx}>{question}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Urgent action items you can help with</h4>
          <p className="text-sm text-muted-foreground">High-leverage moves that Oath could automate next.</p>
        </div>
        <div className="space-y-3">
          {insight.urgentActions.map((action, idx) => (
            <div
              key={`${action.title}-${idx}`}
              className={cn(
                "flex flex-col gap-4 rounded-xl border bg-card/40 p-4 transition hover:border-primary/40 hover:bg-card/60",
                variant === "lab" ? "md:flex-row md:items-center" : "lg:flex-row lg:items-center",
              )}
            >
              <div className="flex-1">
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">{action.suggestedOwner}</Badge>
                <Badge variant="secondary">{action.suggestedDue}</Badge>
                <Button variant="ghost" size="sm" className="border border-dashed">
                  {ACTION_CTAS[action.suggestedActionType]}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          These are the highest leverage next steps Oath would help you drive.
        </p>
      </section>

      {metaLine && <p className="text-xs text-muted-foreground">{metaLine}</p>}
    </div>
  )
}

function buildMetaLine(counts: { source: SourceSystem; count: number }[], personaLabel: string) {
  const filtered = counts.filter((item) => item.count > 0)
  if (!filtered.length) {
    return `Persona: ${personaLabel}`
  }
  const sourceText = filtered
    .map(({ source, count }) => `${count} ${SOURCE_LABELS[source]}`)
    .join(", ")
  return `Generated from ${sourceText} snippets for persona: ${personaLabel}.`
}

