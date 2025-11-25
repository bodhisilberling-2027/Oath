import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getInsightFromContext } from "@/lib/insight-agent"
import type { InsightOutput, InsightPersona, SourceSystem } from "@/lib/insight-types"
import { allSourceSystems, mockContextBySource } from "@/lib/context-data"

const sourceOrder = allSourceSystems.reduce<Record<SourceSystem, number>>((acc, source, index) => {
  acc[source] = index
  return acc
}, {} as Record<SourceSystem, number>)

const normalizeSources = (sources: SourceSystem[]) =>
  [...sources].sort((a, b) => sourceOrder[a] - sourceOrder[b])

interface UseInsightAgentOptions {
  defaultSources?: SourceSystem[]
}

export function useInsightAgent({ defaultSources = allSourceSystems }: UseInsightAgentOptions = {}) {
  const persona: InsightPersona = "BoardMember"
  const [selectedSources, setSelectedSources] = useState<SourceSystem[]>(normalizeSources(defaultSources))
  const [insight, setInsight] = useState<InsightOutput | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const hasBootstrapped = useRef(false)

  const selectedSnippets = useMemo(
    () => selectedSources.flatMap((source) => mockContextBySource[source] ?? []),
    [selectedSources],
  )

  const selectedCounts = useMemo(
    () => selectedSources.map((source) => ({ source, count: mockContextBySource[source]?.length ?? 0 })),
    [selectedSources],
  )

  const [lastInsightCounts, setLastInsightCounts] = useState(selectedCounts)

  const combinedContext = useMemo(() => {
    if (!selectedSnippets.length) {
      return ""
    }
    return selectedSnippets
      .map(
        (snippet) =>
          `[${snippet.source.toUpperCase()}] ${snippet.author} — ${snippet.title ?? "Update"}\n${snippet.body}`,
      )
      .join("\n\n")
  }, [selectedSnippets])

  const toggleSource = useCallback((source: SourceSystem) => {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        return prev.filter((existing) => existing !== source)
      }
      return normalizeSources([...prev, source])
    })
  }, [])

  const setSourceSelection = useCallback((source: SourceSystem, isChecked: boolean) => {
    setSelectedSources((prev) => {
      if (isChecked) {
        if (prev.includes(source)) {
          return prev
        }
        return normalizeSources([...prev, source])
      }
      return prev.filter((existing) => existing !== source)
    })
  }, [])

  const setAllSources = useCallback(
    () => setSelectedSources(normalizeSources(allSourceSystems)),
    [],
  )

  const generateInsight = useCallback(async () => {
    setIsGenerating(true)
    try {
      const result = await getInsightFromContext({ snippets: selectedSnippets, persona })
      setInsight(result)
      setLastInsightCounts(selectedCounts)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedSnippets, persona, selectedCounts])

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }
    hasBootstrapped.current = true
    void generateInsight()
  }, [generateInsight])

  return {
    insight,
    isGenerating,
    selectedSources,
    toggleSource,
    setSourceSelection,
    setAllSources,
    selectedSnippets,
    selectedCounts,
    lastInsightCounts,
    combinedContext,
    generateInsight,
    persona,
  }
}

