import { create } from "zustand"

interface Decision {
  id: string
  title: string
  status: "pending" | "approved" | "rejected"
  priority: "low" | "medium" | "high"
  dueDate: string
  description?: string
  category?: string
}

interface Commitment {
  id: string
  title: string
  owner: string
  status: "on-track" | "at-risk" | "completed" | "overdue"
  dueDate: string
  decisionId?: string
}

interface AuditEvent {
  id: string
  type: string
  title: string
  timestamp: string
  actor: string
  source: string
  details?: any
}

interface GovernanceStore {
  decisions: Decision[]
  commitments: Commitment[]
  events: AuditEvent[]
  addDecision: (decision: Decision) => void
  addCommitment: (commitment: Commitment) => void
  addEvent: (event: AuditEvent) => void
  updateDecision: (id: string, updates: Partial<Decision>) => void
  updateCommitment: (id: string, updates: Partial<Commitment>) => void
}

export const useGovernanceStore = create<GovernanceStore>((set) => ({
  decisions: [],
  commitments: [],
  events: [],

  addDecision: (decision) =>
    set((state) => ({
      decisions: [...state.decisions, decision],
    })),

  addCommitment: (commitment) =>
    set((state) => ({
      commitments: [...state.commitments, commitment],
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),

  updateDecision: (id, updates) =>
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),

  updateCommitment: (id, updates) =>
    set((state) => ({
      commitments: state.commitments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
}))
