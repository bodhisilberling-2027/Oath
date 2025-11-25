"use client"

import { formatDistanceToNow } from "date-fns"
import { useMemo } from "react"

import { InsightOutputView } from "@/components/insight-output"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useInsightAgent } from "@/hooks/use-insight-agent"
import type { SourceSystem } from "@/lib/insight-types"
import { mockContextBySource } from "@/lib/context-data"
import { SOURCE_OPTIONS } from "@/components/insight-agent/config"

export function InsightAgentPanel() {
  const {
    insight,
    isGenerating,
    persona,
    selectedSources,
    setSourceSelection,
    selectedSnippets,
    lastInsightCounts,
    generateInsight,
  } = useInsightAgent()

  const groupedSnippets = useMemo(() => {
    return selectedSources.map((source) => ({
      source,
      snippets: mockContextBySource[source] ?? [],
    }))
  }, [selectedSources])

  return (
    <Card className="p-0">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-2xl">Insight Agent</CardTitle>
          <Badge variant="outline" className="uppercase text-[0.65rem] tracking-widest">
            AI
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ingest context from your systems, then have Oath synthesize a board-ready narrative.
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Context streams</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedSources.length === 0 && (
                    <p className="text-xs text-muted-foreground">Select at least one source to brief the agent.</p>
                  )}
                  {Object.entries(SOURCE_OPTIONS).map(([key, config]) => {
                    const source = key as SourceSystem
                    const Icon = config.icon
                    const isChecked = selectedSources.includes(source)
                    return (
                      <label
                        key={source}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition hover:border-primary/40",
                          isChecked && "border-primary/50 bg-primary/5",
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => setSourceSelection(source, Boolean(checked))}
                        />
                        <div className="flex items-center gap-3">
                          <span className={cn("rounded-full bg-card p-2", config.accent)}>
                            <Icon className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Raw context preview</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSnippets.length} snippet{selectedSnippets.length === 1 ? "" : "s"} selected
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={() => generateInsight()}
                >
                  Refresh insight
                </Button>
              </div>
              <ScrollArea className="h-[360px] rounded-xl border border-dashed border-border/70 p-3">
                <div className="space-y-5 pr-2">
                  {groupedSnippets.map(({ source, snippets }) => {
                    if (!snippets.length) return null
                    const { label, icon: Icon } = SOURCE_OPTIONS[source]
                    return (
                      <div key={source} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                        </div>
                        <div className="space-y-3">
                          {snippets.map((snippet) => (
                            <div key={snippet.id} className="rounded-lg border bg-card/60 p-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{snippet.author}</span>
                                <span>{formatDistanceToNow(new Date(snippet.timestamp), { addSuffix: true })}</span>
                              </div>
                              {snippet.title && <p className="text-sm font-medium">{snippet.title}</p>}
                              <p
                                className="text-sm text-muted-foreground"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {snippet.body}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {snippet.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[0.65rem] uppercase tracking-wide">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {selectedSnippets.length === 0 && (
                    <p className="text-sm text-muted-foreground">Pick a source above to preview snippets.</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-semibold mb-1">Generate Insight</p>
              <p className="text-xs text-muted-foreground mb-3">When you are ready, use every snippet selected.</p>
              <Button
                className="w-full"
                size="lg"
                disabled={isGenerating || selectedSnippets.length === 0}
                onClick={() => generateInsight()}
              >
                Use all selected snippets
              </Button>
            </div>
          </div>

          <div className="border-l border-border/60 pl-0 lg:pl-6">
            <InsightOutputView
              insight={insight}
              isLoading={isGenerating}
              persona={persona}
              selectedCounts={lastInsightCounts}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

