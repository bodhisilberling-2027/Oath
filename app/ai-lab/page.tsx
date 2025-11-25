"use client"

import Link from "next/link"

import { InsightOutputView } from "@/components/insight-output"
import { PERSONA_OPTIONS, SOURCE_OPTIONS } from "@/components/insight-agent/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useInsightAgent } from "@/hooks/use-insight-agent"
import type { InsightPersona, SourceSystem } from "@/lib/insight-types"

export default function AILabPage() {
  const {
    insight,
    isGenerating,
    persona,
    setPersona,
    selectedSources,
    setSourceSelection,
    lastInsightCounts,
    combinedContext,
    generateInsight,
  } = useInsightAgent()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Oath AI Lab</p>
            <h1 className="text-2xl font-semibold">Insight Agent Playground</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">← Back to Control Room</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold">AI Lab</h2>
            <Badge variant="outline" className="uppercase text-[0.65rem] tracking-widest">
              AI
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Drop in noisy context from Slack, Gmail, Docs, and incident streams. Watch the Insight Agent transform it into
            the board-ready briefing you can act on right now.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Persona</p>
                    <p className="text-xs text-muted-foreground">Shape tone for the board, CFO, or COO view.</p>
                  </div>
                  <Select value={persona} onValueChange={(value: InsightPersona) => setPersona(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Source filters</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(SOURCE_OPTIONS).map(([key, value]) => {
                    const source = key as SourceSystem
                    const isActive = selectedSources.includes(source)
                    return (
                      <Button
                        key={source}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSourceSelection(source, !isActive)}
                      >
                        {value.label}
                      </Button>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Combined context</p>
                    <p className="text-xs text-muted-foreground">
                      Raw snippets from {selectedSources.length} stream{selectedSources.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {combinedContext ? "Live feed" : "Awaiting snippets"}
                  </Badge>
                </div>
                <Textarea
                  className="min-h-[360px] font-mono text-xs"
                  value={combinedContext}
                  placeholder="Select one or more sources to see the combined signal Oath will analyze."
                  readOnly
                />
              </section>

              <section className="rounded-xl border border-border/70 bg-muted/10 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold">Generate board insight</p>
                  <p className="text-xs text-muted-foreground">
                    We will use every selected snippet and tailor it for the chosen persona.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => generateInsight()}
                    disabled={isGenerating || !combinedContext}
                  >
                    Generate Insight
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isGenerating || !combinedContext}
                    onClick={() => generateInsight()}
                  >
                    Re-run with current context
                  </Button>
                </div>
              </section>
            </CardContent>
          </Card>

          <div>
            <Card className="h-full">
              <CardContent className="pt-6">
                <ScrollArea className="h-[650px] pr-4">
                  <InsightOutputView
                    variant="lab"
                    insight={insight}
                    isLoading={isGenerating}
                    persona={persona}
                    selectedCounts={lastInsightCounts}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

