import { create } from "zustand"
import { persist } from "zustand/middleware"

// Executive personas available
export const PERSONAS = [
  { 
    id: "ceo", 
    title: "CEO", 
    description: "Chief Executive Officer",
    focus: "Strategic vision, company-wide decisions, board relations, and high-priority approvals"
  },
  { 
    id: "cfo", 
    title: "CFO", 
    description: "Chief Financial Officer",
    focus: "Financial performance, budgets, audits, investor relations, and fiscal compliance"
  },
  { 
    id: "coo", 
    title: "COO", 
    description: "Chief Operating Officer",
    focus: "Operations, supply chain, infrastructure, process efficiency, and execution tracking"
  },
  { 
    id: "gc", 
    title: "General Counsel", 
    description: "Chief Legal Officer",
    focus: "Legal compliance, contracts, regulatory matters, risk mitigation, and governance policies"
  },
  { 
    id: "cbo", 
    title: "CBO", 
    description: "Chief Business Officer",
    focus: "Partnerships, market expansion, revenue initiatives, and business development"
  },
  { 
    id: "investor", 
    title: "Investor", 
    description: "Board Investor / VC Partner",
    focus: "Portfolio performance, ROI metrics, strategic milestones, and fiduciary oversight"
  },
  { 
    id: "board", 
    title: "Board Member", 
    description: "Independent Director",
    focus: "Governance oversight, executive performance, risk assessment, and shareholder interests"
  },
  { 
    id: "secretary", 
    title: "Board Secretary", 
    description: "Corporate Secretary",
    focus: "Meeting logistics, minutes, compliance deadlines, and documentation"
  },
] as const

export type PersonaId = (typeof PERSONAS)[number]["id"]

// Rule types for filtering AI context
export interface ContextRule {
  id: string
  type: "include" | "exclude"
  category: "decisions" | "commitments" | "meetings" | "risks" | "integrations"
  keyword?: string
  priority?: "low" | "medium" | "high"
  enabled: boolean
}

// Action items surfaced to the user
export interface ActionItem {
  id: string
  title: string
  description: string
  type: "decision" | "commitment" | "meeting" | "risk"
  priority: "low" | "medium" | "high"
  dueDate?: string
  relatedEntityId?: string
  status: "pending" | "done" | "dismissed"
  createdAt: string
}

// Updates feed
export interface Update {
  id: string
  title: string
  summary: string
  source: string
  timestamp: string
  category: "decision" | "commitment" | "meeting" | "risk" | "general"
  read: boolean
}

interface MyOathStore {
  // Selected persona
  selectedPersona: PersonaId | null
  setPersona: (id: PersonaId | null) => void

  // Context rules
  rules: ContextRule[]
  addRule: (rule: ContextRule) => void
  updateRule: (id: string, updates: Partial<ContextRule>) => void
  removeRule: (id: string) => void
  toggleRule: (id: string) => void

  // Action items
  actionItems: ActionItem[]
  addActionItem: (item: ActionItem) => void
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void
  dismissActionItem: (id: string) => void
  completeActionItem: (id: string) => void

  // Updates feed
  updates: Update[]
  addUpdate: (update: Update) => void
  markUpdateRead: (id: string) => void
  markAllUpdatesRead: () => void

  // Helpers
  getActiveRules: () => ContextRule[]
  getPendingActionItems: () => ActionItem[]
  getUnreadUpdates: () => Update[]
}

export const useMyOathStore = create<MyOathStore>()(
  persist(
    (set, get) => ({
      selectedPersona: null,
      rules: [],
      actionItems: [],
      updates: [],

      setPersona: (id) => set({ selectedPersona: id }),

      addRule: (rule) =>
        set((state) => ({
          rules: [...state.rules, rule],
        })),

      updateRule: (id, updates) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      removeRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),

      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
        })),

      addActionItem: (item) =>
        set((state) => ({
          actionItems: [item, ...state.actionItems],
        })),

      updateActionItem: (id, updates) =>
        set((state) => ({
          actionItems: state.actionItems.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      dismissActionItem: (id) =>
        set((state) => ({
          actionItems: state.actionItems.map((a) => (a.id === id ? { ...a, status: "dismissed" } : a)),
        })),

      completeActionItem: (id) =>
        set((state) => ({
          actionItems: state.actionItems.map((a) => (a.id === id ? { ...a, status: "done" } : a)),
        })),

      addUpdate: (update) =>
        set((state) => ({
          updates: [update, ...state.updates],
        })),

      markUpdateRead: (id) =>
        set((state) => ({
          updates: state.updates.map((u) => (u.id === id ? { ...u, read: true } : u)),
        })),

      markAllUpdatesRead: () =>
        set((state) => ({
          updates: state.updates.map((u) => ({ ...u, read: true })),
        })),

      getActiveRules: () => get().rules.filter((r) => r.enabled),

      getPendingActionItems: () => get().actionItems.filter((a) => a.status === "pending"),

      getUnreadUpdates: () => get().updates.filter((u) => !u.read),
    }),
    {
      name: "my-oath-storage",
    }
  )
)

// Helper to generate AI context based on persona and rules
export function generatePersonaContext(persona: PersonaId | null, rules: ContextRule[]): string {
  const selectedPersona = PERSONAS.find((p) => p.id === persona)
  if (!selectedPersona) {
    return "The user has not selected a persona. Provide general governance information."
  }

  const activeRules = rules.filter((r) => r.enabled)
  const includeRules = activeRules.filter((r) => r.type === "include")
  const excludeRules = activeRules.filter((r) => r.type === "exclude")

  let context = `
You are assisting a ${selectedPersona.title} (${selectedPersona.description}).
Their primary focus areas: ${selectedPersona.focus}
Tailor all responses to their perspective and responsibilities.
`

  if (includeRules.length > 0) {
    context += `\nFocus especially on:\n`
    includeRules.forEach((r) => {
      context += `- ${r.category}${r.keyword ? ` related to "${r.keyword}"` : ""}${r.priority ? ` with ${r.priority} priority` : ""}\n`
    })
  }

  if (excludeRules.length > 0) {
    context += `\nDe-prioritize or exclude:\n`
    excludeRules.forEach((r) => {
      context += `- ${r.category}${r.keyword ? ` related to "${r.keyword}"` : ""}\n`
    })
  }

  return context
}

