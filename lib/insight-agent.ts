import type { ContextSnippet, InsightOutput, InsightPersona, SourceSystem } from "./insight-types"

const FINANCIAL_KEYWORDS = ["churn", "revenue", "runway", "pipeline", "mrr", "arr", "gmv", "renewal", "burn"]
const INCIDENT_KEYWORDS = ["outage", "latency", "incident", "sla", "breach", "downtime"]
const AI_KEYWORDS = ["ai", "model", "governance", "regulator", "compliance", "bias"]
const TRUST_KEYWORDS = ["safety", "audit", "explainability", "security"]

const ACTION_LABELS: Record<InsightPersona, string> = {
  BoardMember: "Keep the board focused on strategic risk and governance guardrails.",
  CFO: "Highlight cash exposure, revenue protection, and upside unlocks.",
  COO: "Drive operational reliability, staffing, and process rigor.",
}

type SignalCounts = {
  financial: number
  incident: number
  ai: number
  trust: number
}

const sourceOrder: SourceSystem[] = ["slack", "gmail", "docs", "incidents"]

export async function getInsightFromContext({
  snippets,
  persona,
}: {
  snippets: ContextSnippet[]
  persona: InsightPersona
}): Promise<InsightOutput> {
  const normalizedSnippets = snippets ?? []
  const sourcesUsed = Array.from(new Set(normalizedSnippets.map((snippet) => snippet.source))).sort(
    (a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b),
  )

  if (normalizedSnippets.length === 0) {
    return {
      summary: ["No context selected yet. Choose at least one stream to brief the agent."],
      risks: [],
      followUps: [],
      questionsForBoard: [],
      urgentActions: [],
      meta: { persona, sourcesUsed },
    }
  }

  const counts = countSignals(normalizedSnippets)
  const personaAngle = ACTION_LABELS[persona]

  const summary = buildSummary({
    snippets: normalizedSnippets,
    sourcesUsed,
    counts,
    personaAngle,
  })

  const risks = buildRisks(counts)
  const followUps = buildFollowUps(counts)
  const questionsForBoard = buildQuestions(persona, counts)
  const urgentActions = buildUrgentActions(counts)

  // Simulate async latency so the UI can show a loading state.
  await new Promise((resolve) => setTimeout(resolve, 650))

  return {
    summary,
    risks,
    followUps,
    questionsForBoard,
    urgentActions,
    meta: { persona, sourcesUsed },
  }
}

function countSignals(snippets: ContextSnippet[]): SignalCounts {
  return snippets.reduce<SignalCounts>(
    (acc, snippet) => {
      const text = `${snippet.title ?? ""} ${snippet.body}`.toLowerCase()
      if (FINANCIAL_KEYWORDS.some((keyword) => text.includes(keyword))) {
        acc.financial += 1
      }
      if (INCIDENT_KEYWORDS.some((keyword) => text.includes(keyword))) {
        acc.incident += 1
      }
      if (AI_KEYWORDS.some((keyword) => text.includes(keyword))) {
        acc.ai += 1
      }
      if (TRUST_KEYWORDS.some((keyword) => text.includes(keyword))) {
        acc.trust += 1
      }
      return acc
    },
    { financial: 0, incident: 0, ai: 0, trust: 0 },
  )
}

function buildSummary({
  snippets,
  sourcesUsed,
  counts,
  personaAngle,
}: {
  snippets: ContextSnippet[]
  sourcesUsed: SourceSystem[]
  counts: SignalCounts
  personaAngle: string
}): string[] {
  const bullets: string[] = [
    `Oath synthesized ${snippets.length} signals across ${sourcesUsed
      .map((source) => sourceLabel(source))
      .join(", ")}.`,
    personaAngle,
  ]

  if (counts.financial > 0) {
    bullets.push("Revenue and renewal pressure is surfacing in multiple threads—investors and enterprise champions expect a plan.")
  }

  if (counts.incident > 0) {
    bullets.push("Reliability incidents are compounding, putting SLAs, trust, and pipeline momentum at risk.")
  }

  if (counts.ai + counts.trust > 0) {
    bullets.push("AI governance and regulator-facing readiness remain gating items for the next board packet.")
  }

  if (bullets.length < 3) {
    bullets.push("Execution focus: clarify ownership, timelines, and how Oath can automate the next steps.")
  }

  return bullets.slice(0, 5)
}

function buildRisks(counts: SignalCounts): { title: string; detail: string }[] {
  const risks: { title: string; detail: string }[] = []

  if (counts.financial > 0) {
    risks.push({
      title: "Revenue and churn exposure",
      detail:
        "Multiple enterprise renewals flag churn risk and investor emails are asking for updated runway math. We need a tighter story on ARR protection and expansion.",
    })
  }

  if (counts.incident > 0) {
    risks.push({
      title: "Reliability and SLA credibility",
      detail:
        "Recent latency spikes and outages triggered credits and security questionnaires. Without a clear remediation narrative, trust will erode with regulated buyers.",
    })
  }

  if (counts.ai > 0 || counts.trust > 0) {
    risks.push({
      title: "AI governance + compliance gap",
      detail:
        "Model cards, regulator requests, and compliance packets remain unfinished. Until governance artifacts are complete, financial services expansion stays blocked.",
    })
  }

  if (!risks.length) {
    risks.push({
      title: "Clarity gap",
      detail: "Context is thin. Encourage teams to route richer snippets so Oath can surface sharper board-level risk.",
    })
  }

  return risks
}

function buildFollowUps(counts: SignalCounts) {
  const followUps: InsightOutput["followUps"] = []

  if (counts.financial > 0) {
    followUps.push({
      title: "Refresh revenue + churn model with latest renewals",
      ownerSuggestion: "CFO",
      suggestedDue: "Before next board prep",
    })
  }

  if (counts.incident > 0) {
    followUps.push({
      title: "Close the inference latency incident review",
      ownerSuggestion: "VP Eng / SRE",
      suggestedDue: "Within 5 days",
    })
  }

  if (counts.ai > 0 || counts.trust > 0) {
    followUps.push({
      title: "Ship AI governance packet to compliance + regulators",
      ownerSuggestion: "Head of AI Risk",
      suggestedDue: "Within 7 days",
    })
  }

  if (!followUps.length) {
    followUps.push({
      title: "Collect richer operating context for the agent",
      ownerSuggestion: "Chief of Staff",
      suggestedDue: "This week",
    })
  }

  return followUps
}

function buildQuestions(persona: InsightPersona, counts: SignalCounts) {
  const baseQuestions: string[] = []
  if (counts.financial > 0) {
    baseQuestions.push("What is the quantified revenue at risk if churn signals persist into Q1?")
  }
  if (counts.incident > 0) {
    baseQuestions.push("Are the reliability incidents systemic or tied to a single cluster / release?")
  }
  if (counts.ai > 0 || counts.trust > 0) {
    baseQuestions.push("When will AI governance artifacts satisfy regulators so enterprise deals can close?")
  }

  if (persona === "CFO") {
    baseQuestions.push("Do we need to reallocate spend from GTM to reliability until SLAs stabilize?")
  } else if (persona === "COO") {
    baseQuestions.push("What operating rituals ensure incidents, compliance, and follow-ups close on time?")
  } else {
    baseQuestions.push("Does leadership have the right owners and cadence to manage these cross-functional risks?")
  }

  if (!baseQuestions.length) {
    baseQuestions.push("What additional context does the board need to feel confident ahead of the next meeting?")
  }

  return baseQuestions.slice(0, 5)
}

function buildUrgentActions(counts: SignalCounts): InsightOutput["urgentActions"] {
  const actions: InsightOutput["urgentActions"] = []

  if (counts.incident > 0) {
    actions.push({
      title: "Escalate reliability fix plan",
      description: "Bundle the incident timeline, remediation owners, and SLA impact for executive review.",
      suggestedOwner: "VP Eng",
      suggestedDue: "Within 72 hours",
      suggestedActionType: "escalation",
    })
  }

  if (counts.financial > 0) {
    actions.push({
      title: "Align on renewal save package",
      description: "Draft the pricing, service credits, and exec outreach plan for the top 3 at-risk accounts.",
      suggestedOwner: "CFO",
      suggestedDue: "Before next board prep",
      suggestedActionType: "meeting",
    })
  }

  if (counts.ai > 0 || counts.trust > 0) {
    actions.push({
      title: "Finalize AI governance dossier",
      description: "Compile model cards, compliance checklists, and regulator talking points into the board packet.",
      suggestedOwner: "Head of AI Risk",
      suggestedDue: "Within 7 days",
      suggestedActionType: "review",
    })
  }

  actions.push({
    title: "Proactive board briefing draft",
    description: "Summarize these signals into a one-pager so directors hear about risks from us first.",
    suggestedOwner: "Chief of Staff",
    suggestedDue: "Before next board call",
    suggestedActionType: "email",
  })

  if (actions.length < 3) {
    actions.push({
      title: "Capture more context",
      description: "Invite GTM, product, and ops leads to feed Oath so the agent can stay ahead of issues.",
      suggestedOwner: "Chief of Staff",
      suggestedDue: "This week",
      suggestedActionType: "intro",
    })
  }

  return actions.slice(0, 5)
}

function sourceLabel(source: SourceSystem) {
  switch (source) {
    case "gmail":
      return "Gmail"
    case "docs":
      return "Docs"
    case "incidents":
      return "Incidents"
    default:
      return "Slack"
  }
}

