"use client"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  ChevronRight,
  Network,
  Settings,
  RefreshCw,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import PacketDrafting from "@/components/packet-drafting"
import LiveMeeting from "@/components/live-meeting"
import ExecutionTracking from "@/components/execution-tracking"
import { AuditTrail } from "@/components/audit-trail"
import Integrations from "@/components/integrations"
import SettingsPage from "@/components/settings-page"
import { BoardMembersDialog } from "@/components/board-members-dialog"
import { DecisionReviewDialog } from "@/components/decision-review-dialog"
import { GovernanceChatDialog } from "@/components/governance-chat-dialog"
import { InsightAgentPanel } from "@/components/insight-agent-panel"

interface Decision {
  id: string
  title: string
  status: "pending" | "approved" | "rejected"
  dueDate: string
  priority: "high" | "medium" | "low"
}

interface Commitment {
  id: string
  title: string
  owner: string
  status: "on-track" | "at-risk" | "behind"
  progress: number
  dueDate: string
}

export function ControlRoom() {
  const [activeView, setActiveView] = useState<
    "overview" | "packet" | "meeting" | "execution" | "audit" | "integrations" | "settings" | "ingest"
  >("overview")
  const [showBoardMembers, setShowBoardMembers] = useState(false)
  const [reviewingDecision, setReviewingDecision] = useState<Decision | null>(null)
  const [showGovernanceChat, setShowGovernanceChat] = useState(false)

  const decisions: Decision[] = [
    { id: "1", title: "Approve Q4 Budget Allocation", status: "pending", dueDate: "2025-11-24", priority: "high" },
    {
      id: "2",
      title: "Strategic Partnership with Acme Corp",
      status: "pending",
      dueDate: "2025-11-25",
      priority: "high",
    },
    { id: "3", title: "New Product Line Authorization", status: "pending", dueDate: "2025-11-25", priority: "medium" },
  ]

  const commitments: Commitment[] = [
    {
      id: "1",
      title: "Complete security audit",
      owner: "Colette Kress",
      status: "on-track",
      progress: 75,
      dueDate: "2025-11-25",
    },
    {
      id: "2",
      title: "Finalize vendor contracts",
      owner: "Tim Teter",
      status: "on-track",
      progress: 90,
      dueDate: "2025-11-24",
    },
    {
      id: "3",
      title: "Launch marketing campaign",
      owner: "Jay Puri",
      status: "at-risk",
      progress: 45,
      dueDate: "2025-11-25",
    },
    {
      id: "4",
      title: "Deploy infrastructure updates",
      owner: "Debora Shoquist",
      status: "on-track",
      progress: 60,
      dueDate: "2025-11-25",
    },
    {
      id: "5",
      title: "Complete compliance review",
      owner: "Tim Teter",
      status: "behind",
      progress: 30,
      dueDate: "2025-11-24",
    },
    {
      id: "6",
      title: "Hire senior engineers",
      owner: "Chris A. Malachowsky",
      status: "on-track",
      progress: 55,
      dueDate: "2025-11-25",
    },
  ]

  const handleManageMembers = () => {
    toast.success("Opening board member management...", {
      description: "You can add, edit, or remove board members from this interface",
    })
    setShowBoardMembers(true)
  }

  if (activeView === "packet") {
    return <PacketDrafting onBack={() => setActiveView("overview")} />
  }

  if (activeView === "meeting") {
    return <LiveMeeting onBack={() => setActiveView("overview")} />
  }

  if (activeView === "execution") {
    return <ExecutionTracking onBack={() => setActiveView("overview")} />
  }

  if (activeView === "audit") {
    return <AuditTrail onBack={() => setActiveView("overview")} />
  }

  if (activeView === "integrations") {
    return <Integrations onBack={() => setActiveView("overview")} />
  }

  if (activeView === "settings") {
    return <SettingsPage onBack={() => setActiveView("overview")} />
  }

  if (activeView === "ingest") {
    // Navigate to /ingest page
    if (typeof window !== "undefined") {
      window.location.href = "/ingest"
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/images/image-19-removebg-preview.png" alt="Oath Logo" className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Oath</h1>
                  <p className="text-xs text-muted-foreground">NVIDIA Corporation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => setShowGovernanceChat(true)}>
                <MessageSquare className="size-4 mr-2" />
                Ask
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveView("ingest")}>
                <RefreshCw className="size-4 mr-2" />
                Sync
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ai-lab">AI Lab</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveView("integrations")}>
                Integrations
              </Button>
              <Button variant="ghost" size="sm" onClick={handleManageMembers}>
                <Users className="size-4 mr-2" />
                Board Members
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveView("settings")}>
                <Settings className="size-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-balance">Control Room</h2>
        </div>

        <div className="mb-8">
          <InsightAgentPanel />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Decisions Requiring Approval */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">Decisions Requiring Approval</h3>
                <p className="text-sm text-muted-foreground">{decisions.length} pending decisions</p>
              </div>
              <Button onClick={() => setActiveView("packet")}>
                View All
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        "size-2 rounded-full mt-2",
                        decision.priority === "high"
                          ? "bg-destructive"
                          : decision.priority === "medium"
                            ? "bg-warning"
                            : "bg-muted-foreground",
                      )}
                    />
                    <div>
                      <p className="font-medium mb-1">{decision.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Due {decision.dueDate}
                        </span>
                        <Badge variant={decision.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                          {decision.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setReviewingDecision(decision)}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Meeting */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Upcoming Meeting</h3>
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent-foreground">Next Board Meeting</span>
                </div>
                <p className="font-semibold text-lg mb-2">Q4 Strategic Review</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    November 10, 2025 • 8:00 PM PT
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="size-4" />8 board members attending
                  </p>
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveView("meeting")}>
                  Start Meeting
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Agenda Items:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <FileText className="size-3" />
                    CEO Update & Financial Review
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-3" />
                    Strategic Priority Review
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="size-3" />
                    Risk Assessment
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Commitments Heatmap */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">Commitment Status Heatmap</h3>
              <p className="text-sm text-muted-foreground">Track execution across all initiatives</p>
            </div>
            <Button variant="outline" onClick={() => setActiveView("execution")}>
              View Details
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commitments.map((commitment) => (
              <div
                key={commitment.id}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-[1.02]",
                  commitment.status === "on-track" && "bg-success/5 border-success/30",
                  commitment.status === "at-risk" && "bg-warning/5 border-warning/30",
                  commitment.status === "behind" && "bg-destructive/5 border-destructive/30",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "size-3 rounded-full mt-1",
                      commitment.status === "on-track" && "bg-success",
                      commitment.status === "at-risk" && "bg-warning",
                      commitment.status === "behind" && "bg-destructive",
                    )}
                  />
                  {commitment.status === "on-track" && <CheckCircle2 className="size-5 text-success" />}
                  {commitment.status === "at-risk" && <AlertCircle className="size-5 text-warning" />}
                  {commitment.status === "behind" && <AlertCircle className="size-5 text-destructive" />}
                </div>
                <p className="font-medium mb-2 text-sm">{commitment.title}</p>
                <p className="text-xs text-muted-foreground mb-3">Owner: {commitment.owner}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-medium">{commitment.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        commitment.status === "on-track" && "bg-success",
                        commitment.status === "at-risk" && "bg-warning",
                        commitment.status === "behind" && "bg-destructive",
                      )}
                      style={{ width: `${commitment.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Due: {commitment.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats & Trace Graph Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => setActiveView("packet")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Active Decisions</p>
              <TrendingUp className="size-4 text-accent" />
            </div>
            <p className="text-3xl font-semibold">12</p>
            <p className="text-xs text-muted-foreground mt-1">3 require approval</p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => setActiveView("execution")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Commitments</p>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-3xl font-semibold">24</p>
            <p className="text-xs text-muted-foreground mt-1">18 on track, 6 at risk</p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => setActiveView("execution")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Evidence Items</p>
              <FileText className="size-4 text-primary" />
            </div>
            <p className="text-3xl font-semibold">156</p>
            <p className="text-xs text-muted-foreground mt-1">All verified</p>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => setActiveView("audit")}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Trace Graph</p>
              <Network className="size-4 text-accent" />
            </div>
            <p className="text-3xl font-semibold">342</p>
            <p className="text-xs text-muted-foreground mt-1">Linked nodes • View trail →</p>
          </Card>
        </div>
      </div>

      <BoardMembersDialog open={showBoardMembers} onOpenChange={setShowBoardMembers} />
      <DecisionReviewDialog
        open={!!reviewingDecision}
        onOpenChange={(open) => !open && setReviewingDecision(null)}
        decision={reviewingDecision}
      />
      <GovernanceChatDialog open={showGovernanceChat} onOpenChange={setShowGovernanceChat} />
    </div>
  )
}
