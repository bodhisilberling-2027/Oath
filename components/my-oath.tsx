"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  ArrowLeft,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Filter,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useMyOathStore,
  PERSONAS,
  type PersonaId,
  type ContextRule,
  type ActionItem,
  type Update,
} from "@/lib/my-oath-store"

interface MyOathProps {
  onBack: () => void
}

// Generate sample action items based on persona
function generateSampleActionItems(personaId: PersonaId): ActionItem[] {
  const items: Record<PersonaId, ActionItem[]> = {
    ceo: [
      {
        id: "ai-1",
        title: "Review Q4 Budget Allocation",
        description: "Final approval needed before board meeting",
        type: "decision",
        priority: "high",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-2",
        title: "Strategic Partnership Decision",
        description: "Acme Corp partnership requires CEO sign-off",
        type: "decision",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-3",
        title: "Prepare CEO Update for Board",
        description: "Q4 Strategic Review meeting on Nov 25",
        type: "meeting",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    cfo: [
      {
        id: "ai-4",
        title: "Complete Security Audit",
        description: "Finance-owned commitment - currently at 75%",
        type: "commitment",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-5",
        title: "Present Financial Review",
        description: "Prepare Q3 results for board meeting",
        type: "meeting",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-15",
        title: "Review Budget Variance Report",
        description: "Q3 actuals vs forecast analysis needed",
        type: "decision",
        priority: "medium",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    coo: [
      {
        id: "ai-11",
        title: "Deploy Infrastructure Updates",
        description: "60% complete - on track",
        type: "commitment",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-12",
        title: "Supply Chain Risk Assessment",
        description: "Risk committee raised concerns",
        type: "risk",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-16",
        title: "Review Operational Metrics",
        description: "Weekly ops dashboard needs sign-off",
        type: "commitment",
        priority: "medium",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    gc: [
      {
        id: "ai-6",
        title: "Complete Compliance Review",
        description: "Behind schedule at 30% - due tomorrow",
        type: "commitment",
        priority: "high",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-7",
        title: "Finalize Vendor Contracts",
        description: "90% complete - final review needed",
        type: "commitment",
        priority: "medium",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-8",
        title: "Review Partnership Legal Terms",
        description: "Acme Corp due diligence documentation",
        type: "decision",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    cbo: [
      {
        id: "ai-9",
        title: "Launch Marketing Campaign",
        description: "At risk - currently at 45%",
        type: "commitment",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-10",
        title: "New Product Line Authorization",
        description: "Provide business case for board review",
        type: "decision",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-17",
        title: "Partnership Pipeline Review",
        description: "5 potential acquisitions need evaluation",
        type: "decision",
        priority: "high",
        dueDate: "2025-11-26",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    investor: [
      {
        id: "ai-18",
        title: "Review Portfolio Performance",
        description: "Q3 returns and projections summary",
        type: "decision",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-19",
        title: "Strategic Milestone Check",
        description: "Series B commitments progress review",
        type: "commitment",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-20",
        title: "Board Meeting Preparation",
        description: "Review materials for Q4 Strategic Review",
        type: "meeting",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    board: [
      {
        id: "ai-21",
        title: "Review Executive Compensation",
        description: "Compensation committee recommendations",
        type: "decision",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-22",
        title: "Governance Policy Update",
        description: "Annual policy review due",
        type: "commitment",
        priority: "medium",
        dueDate: "2025-11-26",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-23",
        title: "Risk Committee Findings",
        description: "Supply chain concerns require board attention",
        type: "risk",
        priority: "high",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    secretary: [
      {
        id: "ai-24",
        title: "Finalize Board Meeting Agenda",
        description: "Q4 Strategic Review agenda needs approval",
        type: "meeting",
        priority: "high",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-25",
        title: "Distribute Board Materials",
        description: "Send packets to all directors",
        type: "commitment",
        priority: "high",
        dueDate: "2025-11-24",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ai-26",
        title: "Compliance Deadline Tracking",
        description: "3 regulatory filings due this week",
        type: "commitment",
        priority: "medium",
        dueDate: "2025-11-25",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
  }
  return items[personaId] || []
}

// Generate sample updates based on persona
function generateSampleUpdates(personaId: PersonaId): Update[] {
  const baseUpdates: Update[] = [
    {
      id: "u-1",
      title: "Board approved SE Asia expansion",
      summary: "The board has approved the strategic expansion into Southeast Asian markets.",
      source: "Board Meeting",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: "decision",
      read: false,
    },
    {
      id: "u-2",
      title: "Q3 Financial Results Published",
      summary: "CFO presented results showing 12% revenue growth year-over-year.",
      source: "Finance",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      category: "general",
      read: false,
    },
    {
      id: "u-3",
      title: "Risk Committee Alert",
      summary: "Supply chain dependencies flagged as high priority concern.",
      source: "Risk Committee",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      category: "risk",
      read: false,
    },
  ]

  const personaUpdates: Record<PersonaId, Update[]> = {
    ceo: [
      {
        id: "u-ceo1",
        title: "AI Compute Allocation Discussion",
        summary: "Engineering requests additional $50M for data center expansion.",
        source: "Slack #executive-team",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        category: "decision",
        read: false,
      },
      {
        id: "u-ceo2",
        title: "Strategic Partnership Update",
        summary: "Acme Corp due diligence completed. Ready for final decision.",
        source: "M&A Team",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: "decision",
        read: false,
      },
    ],
    cfo: [
      {
        id: "u-cfo1",
        title: "Security Audit Progress",
        summary: "Audit is 75% complete. Final phase begins next week.",
        source: "Commitment Tracker",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
      {
        id: "u-cfo2",
        title: "Budget Variance Alert",
        summary: "Q3 marketing spend exceeded forecast by 8%.",
        source: "Finance Dashboard",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "risk",
        read: false,
      },
    ],
    coo: [
      {
        id: "u-coo1",
        title: "Infrastructure Update On Track",
        summary: "Deployment is 60% complete and proceeding as planned.",
        source: "Ops Dashboard",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
      {
        id: "u-coo2",
        title: "Vendor SLA Breach",
        summary: "Cloud provider missed uptime target. Escalation in progress.",
        source: "Ops Alerts",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        category: "risk",
        read: false,
      },
    ],
    gc: [
      {
        id: "u-gc1",
        title: "Compliance Review Behind Schedule",
        summary: "Compliance review is at 30% with deadline tomorrow.",
        source: "Commitment Tracker",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
      {
        id: "u-gc2",
        title: "New Regulatory Requirement",
        summary: "SEC issued new disclosure guidelines effective Q1 2026.",
        source: "Legal Alerts",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: "risk",
        read: false,
      },
    ],
    cbo: [
      {
        id: "u-cbo1",
        title: "Marketing Campaign At Risk",
        summary: "Campaign launch is at 45% - may miss deadline without intervention.",
        source: "Commitment Tracker",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
      {
        id: "u-cbo2",
        title: "New Partnership Opportunity",
        summary: "Inbound interest from major cloud provider for integration.",
        source: "BD Team",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: "decision",
        read: false,
      },
    ],
    investor: [
      {
        id: "u-inv1",
        title: "Portfolio Company Update",
        summary: "NVIDIA Q3 results exceeded expectations. 12% YoY growth.",
        source: "Investor Relations",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        category: "general",
        read: false,
      },
      {
        id: "u-inv2",
        title: "Board Materials Available",
        summary: "Q4 Strategic Review packet ready for download.",
        source: "Board Portal",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "meeting",
        read: false,
      },
    ],
    board: [
      {
        id: "u-board1",
        title: "Executive Compensation Review",
        summary: "Compensation committee completed annual review. Ready for approval.",
        source: "Comp Committee",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: "decision",
        read: false,
      },
      {
        id: "u-board2",
        title: "Governance Policy Update",
        summary: "Annual policy review scheduled for next board meeting.",
        source: "Corporate Secretary",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
    ],
    secretary: [
      {
        id: "u-sec1",
        title: "Board Meeting Confirmed",
        summary: "All 8 directors confirmed attendance for Nov 25 meeting.",
        source: "Calendar",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        category: "meeting",
        read: false,
      },
      {
        id: "u-sec2",
        title: "Filing Deadline Reminder",
        summary: "10-Q filing due in 5 business days.",
        source: "Compliance Calendar",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "commitment",
        read: false,
      },
    ],
  }

  return [...(personaUpdates[personaId] || []), ...baseUpdates]
}

export default function MyOath({ onBack }: MyOathProps) {
  const {
    selectedPersona,
    setPersona,
    rules,
    addRule,
    removeRule,
    toggleRule,
    actionItems,
    addActionItem,
    completeActionItem,
    dismissActionItem,
    updates,
    addUpdate,
    markUpdateRead,
    markAllUpdatesRead,
    getPendingActionItems,
    getUnreadUpdates,
  } = useMyOathStore()

  const [newRuleCategory, setNewRuleCategory] = useState<ContextRule["category"]>("decisions")
  const [newRuleType, setNewRuleType] = useState<"include" | "exclude">("include")
  const [newRuleKeyword, setNewRuleKeyword] = useState("")
  const [activeTab, setActiveTab] = useState<"actions" | "updates" | "rules">("actions")

  // Load sample data when persona changes
  useEffect(() => {
    if (selectedPersona) {
      // Clear existing and load persona-specific items
      const sampleActions = generateSampleActionItems(selectedPersona)
      const sampleUpdates = generateSampleUpdates(selectedPersona)

      // Only add if not already present
      sampleActions.forEach((item) => {
        if (!actionItems.find((a) => a.id === item.id)) {
          addActionItem(item)
        }
      })

      sampleUpdates.forEach((update) => {
        if (!updates.find((u) => u.id === update.id)) {
          addUpdate(update)
        }
      })

      const persona = PERSONAS.find((p) => p.id === selectedPersona)
      toast.success(`Welcome, ${persona?.title}`, {
        description: "Your personalized dashboard is ready",
      })
    }
  }, [selectedPersona])

  const handleAddRule = () => {
    const rule: ContextRule = {
      id: `rule-${Date.now()}`,
      type: newRuleType,
      category: newRuleCategory,
      keyword: newRuleKeyword || undefined,
      enabled: true,
    }
    addRule(rule)
    setNewRuleKeyword("")
    toast.success("Rule added", {
      description: `AI will ${newRuleType === "include" ? "focus on" : "de-prioritize"} ${newRuleCategory}`,
    })
  }

  const pendingActions = getPendingActionItems()
  const unreadUpdates = getUnreadUpdates()
  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona)

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/image-19-removebg-preview.png" alt="Oath Logo" className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">My Oath</h1>
                  <p className="text-xs text-muted-foreground">Personalized governance assistant</p>
                </div>
              </div>
            </div>
            {currentPersona && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="py-1.5 px-3">
                  <User className="size-3 mr-2" />
                  {currentPersona.title}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Persona Selection */}
        {!selectedPersona ? (
          <Card className="p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <User className="size-8 text-violet-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">What's your role?</h2>
              <p className="text-muted-foreground">
                Select your role to get personalized action items, updates, and AI assistance tailored to your responsibilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setPersona(persona.id)}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:bg-accent/10 hover:border-violet-500/50 hover:shadow-lg transition-all text-left group"
                >
                  <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-violet-500/30 group-hover:to-indigo-500/20 transition-all">
                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                      {persona.title.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{persona.title}</p>
                    <p className="text-sm text-muted-foreground mb-2">{persona.description}</p>
                    <p className="text-xs text-muted-foreground/70 line-clamp-2">{persona.focus}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  activeTab === "actions" && "ring-2 ring-primary"
                )}
                onClick={() => setActiveTab("actions")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Action Items</p>
                    <p className="text-3xl font-semibold">{pendingActions.length}</p>
                  </div>
                  <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-blue-500" />
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  activeTab === "updates" && "ring-2 ring-primary"
                )}
                onClick={() => setActiveTab("updates")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unread Updates</p>
                    <p className="text-3xl font-semibold">{unreadUpdates.length}</p>
                  </div>
                  <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Bell className="size-6 text-amber-500" />
                  </div>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  activeTab === "rules" && "ring-2 ring-primary"
                )}
                onClick={() => setActiveTab("rules")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Rules</p>
                    <p className="text-3xl font-semibold">{rules.filter((r) => r.enabled).length}</p>
                  </div>
                  <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Filter className="size-6 text-purple-500" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Action Items or Updates */}
              <div className="lg:col-span-2">
                {activeTab === "actions" && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">Your Action Items</h3>
                        <p className="text-sm text-muted-foreground">
                          Personalized tasks based on your role and rules
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Sparkles className="size-3 mr-1" />
                        AI Generated
                      </Badge>
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {pendingActions.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <CheckCircle2 className="size-12 mx-auto mb-4 opacity-20" />
                            <p>All caught up! No pending action items.</p>
                          </div>
                        ) : (
                          pendingActions.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "p-4 rounded-lg border transition-all",
                                item.priority === "high"
                                  ? "border-destructive/30 bg-destructive/5"
                                  : item.priority === "medium"
                                    ? "border-amber-500/30 bg-amber-500/5"
                                    : "border-border bg-card"
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{item.title}</p>
                                    <Badge
                                      variant={
                                        item.priority === "high"
                                          ? "destructive"
                                          : item.priority === "medium"
                                            ? "default"
                                            : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {item.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {item.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                  {item.dueDate && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="size-3" />
                                      Due {item.dueDate}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => dismissActionItem(item.id)}
                                  >
                                    <X className="size-3" />
                                  </Button>
                                  <Button size="sm" onClick={() => completeActionItem(item.id)}>
                                    <CheckCircle2 className="size-3 mr-1" />
                                    Done
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                )}

                {activeTab === "updates" && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">Updates Feed</h3>
                        <p className="text-sm text-muted-foreground">
                          Latest activity relevant to you
                        </p>
                      </div>
                      {unreadUpdates.length > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllUpdatesRead}>
                          Mark all read
                        </Button>
                      )}
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {updates.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Bell className="size-12 mx-auto mb-4 opacity-20" />
                            <p>No updates yet</p>
                          </div>
                        ) : (
                          updates.map((update) => (
                            <div
                              key={update.id}
                              className={cn(
                                "p-4 rounded-lg border transition-all cursor-pointer",
                                !update.read
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-border bg-card opacity-60"
                              )}
                              onClick={() => markUpdateRead(update.id)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {!update.read && (
                                      <div className="size-2 rounded-full bg-primary" />
                                    )}
                                    <p className="font-medium">{update.title}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {update.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {update.summary}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {update.source} • {formatTimeAgo(update.timestamp)}
                                  </p>
                                </div>
                                <ChevronRight className="size-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                )}

                {activeTab === "rules" && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">Context Rules</h3>
                        <p className="text-sm text-muted-foreground">
                          Tell the AI what to focus on or ignore
                        </p>
                      </div>
                    </div>

                    {/* Add Rule Form */}
                    <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                      <Select
                        value={newRuleType}
                        onValueChange={(v) => setNewRuleType(v as "include" | "exclude")}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="include">Focus on</SelectItem>
                          <SelectItem value="exclude">Ignore</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={newRuleCategory}
                        onValueChange={(v) => setNewRuleCategory(v as ContextRule["category"])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="decisions">Decisions</SelectItem>
                          <SelectItem value="commitments">Commitments</SelectItem>
                          <SelectItem value="meetings">Meetings</SelectItem>
                          <SelectItem value="risks">Risks</SelectItem>
                          <SelectItem value="integrations">Integrations</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Keyword (optional)"
                        value={newRuleKeyword}
                        onChange={(e) => setNewRuleKeyword(e.target.value)}
                        className="w-[180px]"
                      />

                      <Button onClick={handleAddRule}>
                        <Plus className="size-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>

                    {/* Rules List */}
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2 pr-4">
                        {rules.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Filter className="size-12 mx-auto mb-4 opacity-20" />
                            <p>No rules yet. Add rules to customize AI behavior.</p>
                          </div>
                        ) : (
                          rules.map((rule) => (
                            <div
                              key={rule.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all",
                                rule.enabled
                                  ? "border-border bg-card"
                                  : "border-border/50 bg-muted/30 opacity-50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={() => toggleRule(rule.id)}
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {rule.type === "include" ? "Focus on" : "Ignore"}{" "}
                                    <span className="text-primary">{rule.category}</span>
                                    {rule.keyword && (
                                      <span className="text-muted-foreground">
                                        {" "}
                                        containing "{rule.keyword}"
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRule(rule.id)}
                              >
                                <Trash2 className="size-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                )}
              </div>

              {/* Right Column: Persona Card */}
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="text-center mb-4">
                    <div className="size-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {currentPersona?.title.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{currentPersona?.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentPersona?.description}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending Actions</span>
                      <Badge variant={pendingActions.length > 0 ? "default" : "secondary"}>
                        {pendingActions.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unread Updates</span>
                      <Badge variant={unreadUpdates.length > 0 ? "default" : "secondary"}>
                        {unreadUpdates.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Rules</span>
                      <Badge variant="secondary">{rules.filter((r) => r.enabled).length}</Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setPersona(null)}
                  >
                    Switch Role
                  </Button>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="size-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">AI-Powered</p>
                      <p className="text-xs text-muted-foreground">
                        Your rules shape how the AI assistant filters information and generates
                        action items tailored to your role.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

