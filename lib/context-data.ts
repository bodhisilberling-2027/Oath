import type { ContextSnippet, SourceSystem } from "./insight-types"

const now = new Date("2025-11-20T18:00:00.000Z")

const iso = (offsetHours: number) => new Date(now.getTime() - offsetHours * 60 * 60 * 1000).toISOString()

export const mockSlackSnippets: ContextSnippet[] = [
  {
    id: "slack-1",
    source: "slack",
    timestamp: iso(4),
    author: "Priya (VP Eng)",
    title: "Latency spike on GenAI serving",
    body: "Latency on the LLM inference cluster spiked to 240ms for EU traffic, flirting with our SLA and forcing the team to reroute workloads.",
    tags: ["risk", "ai", "reliability"],
  },
  {
    id: "slack-2",
    source: "slack",
    timestamp: iso(9),
    author: "Noah (Head of Product)",
    title: "Enterprise pilot feedback",
    body: "Acme pilot loves the copilots but wants clearer AI governance language before they expand ARR. They cited compliance and regulator readouts.",
    tags: ["product", "ai", "compliance"],
  },
  {
    id: "slack-3",
    source: "slack",
    timestamp: iso(14),
    author: "Maya (RevOps)",
    title: "Renewal risk",
    body: "SoftBank renewal wobbling—the champion flagged rising churn risk because onboarding is still manual and finance has not confirmed updated pricing.",
    tags: ["finance", "risk"],
  },
  {
    id: "slack-4",
    source: "slack",
    timestamp: iso(20),
    author: "Ethan (Security)",
    title: "Model governance backlog",
    body: "We still have 11 AI model cards pending review. Without that, compliance cannot sign off on the regulator packet.",
    tags: ["ai", "governance"],
  },
]

export const mockGmailSnippets: ContextSnippet[] = [
  {
    id: "gmail-1",
    source: "gmail",
    timestamp: iso(6),
    author: "Hannah – CFO, Nimbus Retail",
    title: "Escalation: latency breaching SLA",
    body: "Latency-related outages last week cost us ~$180k in lost GMV. If we cannot show stability before December 1, we will pause the pipeline expansion.",
    tags: ["finance", "latency", "incident"],
  },
  {
    id: "gmail-2",
    source: "gmail",
    timestamp: iso(12),
    author: "Marcus – Lead Investor",
    title: "Board prep question",
    body: "Before the board, we want clarity on cash runway versus AI infra burn and whether churn is improving after the Q3 spike.",
    tags: ["board", "finance"],
  },
  {
    id: "gmail-3",
    source: "gmail",
    timestamp: iso(18),
    author: "Karen – Head of Customer Success",
    title: "Customer signals on compliance",
    body: "Regulators asked Centauri Bank about our AI explainability controls. Need a talking point or else compliance risk will delay the renewal.",
    tags: ["compliance", "ai", "regulator"],
  },
  {
    id: "gmail-4",
    source: "gmail",
    timestamp: iso(24),
    author: "Diego – Enterprise AE",
    title: "Pipeline update",
    body: "Three Fortune 100 prospects are stuck because security questionnaires flagged last month's incident and missing SOC addendum.",
    tags: ["pipeline", "security"],
  },
]

export const mockDocSnippets: ContextSnippet[] = [
  {
    id: "doc-1",
    source: "docs",
    timestamp: iso(30),
    author: "Strategy Wiki",
    title: "Q4 QBR highlight",
    body: "MRR guidance assumes 12% expansion from regulated industries; hinges on shipping the AI compliance checklist and reopening the financial services pipeline.",
    tags: ["finance", "ai", "strategy"],
  },
  {
    id: "doc-2",
    source: "docs",
    timestamp: iso(40),
    author: "Incident Postmortem",
    title: "Root cause summary",
    body: "October outage traced to an untested model update that degraded inference nodes and triggered cascading latency.",
    tags: ["incident", "ai", "reliability"],
  },
  {
    id: "doc-3",
    source: "docs",
    timestamp: iso(48),
    author: "AI Risk Register",
    title: "Regulatory exposure",
    body: "Upcoming EU AI Act assessment could require a regulator-facing briefing on bias monitoring and model governance controls.",
    tags: ["ai", "governance", "regulation"],
  },
]

export const mockIncidentSnippets: ContextSnippet[] = [
  {
    id: "incident-1",
    source: "incidents",
    timestamp: iso(10),
    author: "SRE Pager Rotation",
    title: "Inference outage",
    body: "15-minute outage on west coast cluster triggered four enterprise SLA breaches and forces us to credit $90k in revenue.",
    tags: ["incident", "reliability", "finance"],
  },
  {
    id: "incident-2",
    source: "incidents",
    timestamp: iso(28),
    author: "Trust & Safety",
    title: "Data handling review",
    body: "Regulator sent a notice requesting proof of model audit logs within 7 days; missing report could classify as compliance incident.",
    tags: ["compliance", "regulator", "ai"],
  },
]

export const mockContextBySource: Record<SourceSystem, ContextSnippet[]> = {
  slack: mockSlackSnippets,
  gmail: mockGmailSnippets,
  docs: mockDocSnippets,
  incidents: mockIncidentSnippets,
}

export const allSourceSystems: SourceSystem[] = ["slack", "gmail", "docs", "incidents"]

export const allMockSnippets = Object.values(mockContextBySource).flat()

