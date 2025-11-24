"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { MarkdownRenderer } from "./markdown-renderer"
import {
  ChevronLeft,
  Network,
  FileText,
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Share2,
  GitBranch,
  ArrowRight,
  Eye,
  Activity,
  Calendar,
  Video,
  Database,
  Zap,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAuditTrailPDF, downloadBlob } from "@/lib/pdf-generator"
import { generateShareLink, copyToClipboard } from "@/lib/share-generator"

interface TraceNode {
  id: string
  type: "decision" | "commitment" | "meeting" | "evidence" | "update"
  title: string
  description: string
  date: string
  author: string
  status?: string
  connections: string[]
  source?: "integration" | "manual"
  integrationName?: string
}

interface AuditEvent {
  id: string
  timestamp: string
  type: "created" | "updated" | "approved" | "rejected" | "completed" | "commented"
  entity: string
  entityId: string
  actor: string
  description: string
  source?: "integration" | "manual"
  integrationIcon?: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

export function AuditTrail({ onBack }: { onBack: () => void }) {
  const [activeView, setActiveView] = useState<"timeline" | "graph">("timeline")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterActor, setFilterActor] = useState<string>("all")

  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false)

  const traceNodes: TraceNode[] = [
    {
      id: "d1",
      type: "decision",
      title: "Q4 Budget Allocation",
      description: "Approve $2.5M budget for product development",
      date: "2025-11-24",
      author: "Colette Kress",
      status: "approved",
      connections: ["c1", "m1", "e1"],
    },
    {
      id: "c1",
      type: "commitment",
      title: "Complete security audit",
      description: "Comprehensive security audit resulting from budget decision",
      date: "2025-11-23",
      author: "Colette Kress",
      status: "on-track",
      connections: ["d1", "e1", "e2", "u1"],
    },
    {
      id: "m1",
      type: "meeting",
      title: "Q4 Strategic Review",
      description: "Board meeting where budget was discussed and approved",
      date: "2025-11-25",
      author: "Board",
      connections: ["d1", "d2"],
      source: "integration",
      integrationName: "Google Calendar",
    },
    {
      id: "e1",
      type: "evidence",
      title: "Security Assessment Report",
      description: "Infrastructure assessment supporting budget request",
      date: "2025-11-23",
      author: "Colette Kress",
      connections: ["c1", "d1"],
      source: "integration",
      integrationName: "Notion",
    },
    {
      id: "e2",
      type: "evidence",
      title: "Vulnerability Scan Results",
      description: "Detailed vulnerability analysis",
      date: "2025-11-24",
      author: "Colette Kress",
      connections: ["c1"],
      source: "integration",
      integrationName: "Google Drive",
    },
    {
      id: "u1",
      type: "update",
      title: "Progress Update: Security Audit",
      description: "Penetration testing phase initiated",
      date: "2025-11-24",
      author: "Colette Kress",
      connections: ["c1"],
    },
    {
      id: "d2",
      type: "decision",
      title: "Strategic Partnership with Acme Corp",
      description: "Evaluate and approve partnership agreement",
      date: "2025-11-25",
      author: "Jay Puri",
      status: "pending",
      connections: ["m1", "c2"],
    },
    {
      id: "c2",
      type: "commitment",
      title: "Partnership Due Diligence",
      description: "Complete legal and financial review",
      date: "2025-11-24",
      author: "Tim Teter",
      status: "on-track",
      connections: ["d2"],
    },
  ]

  const auditEvents: AuditEvent[] = [
    {
      id: "ae_gcal_1",
      timestamp: "2025-11-25 09:45 AM",
      type: "created",
      entity: "Meeting",
      entityId: "m1",
      actor: "Google Calendar",
      description: "Meeting scheduled: Q4 Strategic Review",
      source: "integration",
      integrationIcon: "calendar",
    },
    {
      id: "ae1",
      timestamp: "2025-11-25 10:15 AM",
      type: "approved",
      entity: "Decision",
      entityId: "d1",
      actor: "Board of Directors",
      description: "Approved Q4 Budget Allocation decision",
      changes: [
        { field: "status", oldValue: "pending", newValue: "approved" },
        { field: "votes", oldValue: "0-0-0", newValue: "6-1-0" },
      ],
    },
    {
      id: "ae_zoom_1",
      timestamp: "2025-11-25 11:30 AM",
      type: "created",
      entity: "Evidence",
      entityId: "e_zoom_1",
      actor: "Zoom",
      description: "Meeting recording and transcript uploaded",
      source: "integration",
      integrationIcon: "video",
    },
    {
      id: "ae_slack_1",
      timestamp: "2025-11-24 3:45 PM",
      type: "commented",
      entity: "Decision",
      entityId: "d1",
      actor: "Slack",
      description: "Discussion thread from #board-governance linked to decision",
      source: "integration",
      integrationIcon: "message",
    },
    {
      id: "ae2",
      timestamp: "2025-11-24 2:30 PM",
      type: "updated",
      entity: "Commitment",
      entityId: "c1",
      actor: "Colette Kress",
      description: "Updated progress on security audit commitment",
      changes: [{ field: "progress", oldValue: "65%", newValue: "75%" }],
    },
    {
      id: "ae3",
      timestamp: "2025-11-24 2:25 PM",
      type: "commented",
      entity: "Commitment",
      entityId: "c1",
      actor: "Colette Kress",
      description: "Added progress update: Penetration testing phase initiated",
    },
    {
      id: "ae_notion_1",
      timestamp: "2025-11-23 10:15 AM",
      type: "created",
      entity: "Evidence",
      entityId: "e1",
      actor: "Notion",
      description: "Security Assessment Report imported from Notion workspace",
      source: "integration",
      integrationIcon: "file",
    },
    {
      id: "ae4",
      timestamp: "2025-11-24 4:45 PM",
      type: "created",
      entity: "Evidence",
      entityId: "e2",
      actor: "Colette Kress",
      description: "Uploaded Vulnerability Scan Results",
    },
    {
      id: "ae_gdrive_1",
      timestamp: "2025-11-24 4:40 PM",
      type: "created",
      entity: "Evidence",
      entityId: "e_gdrive_1",
      actor: "Google Drive",
      description: "Vulnerability Scan Results.pdf synced from Board Documents folder",
      source: "integration",
      integrationIcon: "database",
    },
    {
      id: "ae5",
      timestamp: "2025-11-24 11:20 AM",
      type: "updated",
      entity: "Commitment",
      entityId: "c1",
      actor: "Colette Kress",
      description: "Updated progress on security audit commitment",
      changes: [{ field: "progress", oldValue: "50%", newValue: "65%" }],
    },
    {
      id: "ae6",
      timestamp: "2025-11-23 3:10 PM",
      type: "created",
      entity: "Evidence",
      entityId: "e1",
      actor: "Colette Kress",
      description: "Uploaded Security Assessment Report",
    },
    {
      id: "ae7",
      timestamp: "2025-11-23 9:00 AM",
      type: "created",
      entity: "Commitment",
      entityId: "c1",
      actor: "Colette Kress",
      description: "Created commitment: Complete security audit",
    },
    {
      id: "ae8",
      timestamp: "2025-11-25 10:05 AM",
      type: "created",
      entity: "Meeting",
      entityId: "m1",
      actor: "System",
      description: "Board meeting started: Q4 Strategic Review",
    },
    {
      id: "ae9",
      timestamp: "2025-11-24 1:20 PM",
      type: "created",
      entity: "Commitment",
      entityId: "c2",
      actor: "Tim Teter",
      description: "Created commitment: Partnership Due Diligence",
    },
    {
      id: "ae10",
      timestamp: "2025-11-24 10:30 AM",
      type: "updated",
      entity: "Commitment",
      entityId: "c2",
      actor: "Jay Puri",
      description: "Updated marketing campaign status to at-risk",
      changes: [{ field: "status", oldValue: "on-track", newValue: "at-risk" }],
    },
  ]

  const filteredEvents = auditEvents.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.entity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    const matchesActor = filterActor === "all" || event.actor === filterActor
    return matchesSearch && matchesType && matchesActor
  })

  const actors = Array.from(new Set(auditEvents.map((e) => e.actor)))
  const selectedNodeData = traceNodes.find((n) => n.id === selectedNode)

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "decision":
        return <CheckCircle2 className="size-4" />
      case "commitment":
        return <Activity className="size-4" />
      case "meeting":
        return <Users className="size-4" />
      case "evidence":
        return <FileText className="size-4" />
      case "update":
        return <MessageSquare className="size-4" />
      default:
        return <Network className="size-4" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "decision":
        return "bg-primary/10 border-primary/30 text-primary"
      case "commitment":
        return "bg-success/10 border-success/30 text-success"
      case "meeting":
        return "bg-accent/10 border-accent/30 text-accent"
      case "evidence":
        return "bg-warning/10 border-warning/30 text-warning"
      case "update":
        return "bg-muted border-border text-muted-foreground"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "created":
        return "bg-success/10 text-success"
      case "updated":
        return "bg-primary/10 text-primary"
      case "approved":
        return "bg-accent/10 text-accent"
      case "rejected":
        return "bg-destructive/10 text-destructive"
      case "completed":
        return "bg-success/10 text-success"
      case "commented":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getIntegrationIcon = (iconType?: string) => {
    switch (iconType) {
      case "calendar":
        return <Calendar className="size-3" />
      case "video":
        return <Video className="size-3" />
      case "message":
        return <MessageSquare className="size-3" />
      case "file":
        return <FileText className="size-3" />
      case "database":
        return <Database className="size-3" />
      default:
        return null
    }
  }

  const handleExport = async () => {
    console.log("[v0] Export button clicked in Audit Trail")
    toast.info("Generating audit trail PDF...")
    try {
      console.log("[v0] Calling generateAuditTrailPDF...")
      const pdf = await generateAuditTrailPDF()
      console.log("[v0] PDF generated, size:", pdf.size, "bytes")
      downloadBlob(pdf, `Audit_Trail_${new Date().toISOString().split("T")[0]}.pdf`)
      console.log("[v0] Download triggered")
      toast.success("Audit trail exported successfully", {
        description: "PDF report has been downloaded",
      })
    } catch (error) {
      console.error("[v0] Export failed:", error)
      toast.error("Failed to export audit trail")
    }
  }

  const handleShare = async () => {
    console.log("[v0] Share button clicked in Audit Trail")
    try {
      const shareLink = generateShareLink("audit-trail", "current")
      console.log("[v0] Generated share link:", shareLink)
      await copyToClipboard(shareLink)
      console.log("[v0] Copied to clipboard successfully")
      toast.success("Share link copied to clipboard", {
        description: "Anyone with the link can view this audit trail",
      })
    } catch (error) {
      console.error("[v0] Share failed:", error)
      toast.error("Failed to copy share link")
    }
  }

  const askOathAi = async () => {
    if (!aiQuestion.trim()) {
      toast.error("Please enter a question")
      return
    }

    setIsAiLoading(true)
    setAiResponse("")
    setHasAskedQuestion(true)

    try {
      const response = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "audit-query",
          question: aiQuestion,
          auditEvents: auditEvents,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to query Oath AI")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setAiResponse((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("[v0] AI query error:", error)
      toast.error("Failed to query Oath AI")
      setAiResponse("Error: Unable to generate response. Please try again.")
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src="/images/image-19-removebg-preview.png" alt="Oath Logo" className="h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Audit Trail & Trace Graph</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="size-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ask Oath AI</CardTitle>
            <CardDescription>Query your governance data using natural language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Show me all decisions at risk this quarter"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAiLoading) {
                    askOathAi()
                  }
                }}
                disabled={isAiLoading}
              />
              <Button onClick={askOathAi} disabled={isAiLoading || !aiQuestion.trim()}>
                {isAiLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>

            {hasAskedQuestion && (
              <div className="rounded-lg border bg-muted/30 p-4">
                {isAiLoading && aiResponse === "" ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Oath AI is analyzing your query...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={aiResponse} />
                    {isAiLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
          <TabsList>
            <TabsTrigger value="timeline">
              <Clock className="size-4 mr-2" />
              Audit Timeline
            </TabsTrigger>
            <TabsTrigger value="graph">
              <Network className="size-4 mr-2" />
              Trace Graph
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activity Timeline</CardTitle>
                    <CardDescription>{filteredEvents.length} events tracked</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px]"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="commented">Commented</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterActor} onValueChange={setFilterActor}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actors</SelectItem>
                        {actors.map((actor) => (
                          <SelectItem key={actor} value={actor}>
                            {actor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="relative">
                        <div
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center border-2",
                            getEventIcon(event.type),
                          )}
                        >
                          {getNodeIcon(event.entity.toLowerCase())}
                        </div>
                        {index < filteredEvents.length - 1 && (
                          <div className="absolute left-1/2 top-10 -translate-x-1/2 w-0.5 h-12 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{event.description}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.type}
                              </Badge>
                              {event.source === "integration" && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  {getIntegrationIcon(event.integrationIcon)}
                                  <Zap className="size-3" />
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {event.actor}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {event.timestamp}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="size-3" />
                                {event.entity}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast.success(`Viewing details for: ${event.description}`, {
                                description: `Event ID: ${event.id} • Actor: ${event.actor}`,
                              })
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                        {event.changes && event.changes.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                            <p className="text-xs font-medium mb-2">Changes:</p>
                            <div className="space-y-1">
                              {event.changes.map((change, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground font-mono">
                                  <span className="font-semibold">{change.field}:</span>{" "}
                                  <span className="text-destructive">{change.oldValue}</span>
                                  {" → "}
                                  <span className="text-success">{change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trace Graph View */}
          <TabsContent value="graph" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graph Visualization */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Relationship Graph</CardTitle>
                  <CardDescription>Visual mapping of decisions, commitments, meetings, and evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[600px] bg-muted/20 rounded-lg border border-border p-6 overflow-auto">
                    {/* Simple node visualization */}
                    <div className="space-y-8">
                      {/* Row 1: Decisions */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3">Decisions</p>
                        <div className="flex gap-4 flex-wrap">
                          {traceNodes
                            .filter((n) => n.type === "decision")
                            .map((node) => (
                              <div
                                key={node.id}
                                onClick={() => setSelectedNode(node.id)}
                                className={cn(
                                  "p-3 rounded-lg border-2 cursor-pointer transition-all min-w-[180px]",
                                  getNodeColor(node.type),
                                  selectedNode === node.id ? "ring-2 ring-primary ring-offset-2" : "",
                                )}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {getNodeIcon(node.type)}
                                  <p className="font-medium text-xs">{node.title}</p>
                                </div>
                                <p className="text-xs opacity-70">{node.date}</p>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Connection indicator */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="h-0.5 w-12 bg-border" />
                          <GitBranch className="size-4" />
                          <div className="h-0.5 w-12 bg-border" />
                        </div>
                      </div>

                      {/* Row 2: Commitments & Meetings */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-3">Commitments</p>
                          <div className="space-y-2">
                            {traceNodes
                              .filter((n) => n.type === "commitment")
                              .map((node) => (
                                <div
                                  key={node.id}
                                  onClick={() => setSelectedNode(node.id)}
                                  className={cn(
                                    "p-3 rounded-lg border-2 cursor-pointer transition-all",
                                    getNodeColor(node.type),
                                    selectedNode === node.id ? "ring-2 ring-primary ring-offset-2" : "",
                                  )}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {getNodeIcon(node.type)}
                                    <p className="font-medium text-xs">{node.title}</p>
                                  </div>
                                  <p className="text-xs opacity-70">{node.author}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-3">Meetings</p>
                          <div className="space-y-2">
                            {traceNodes
                              .filter((n) => n.type === "meeting")
                              .map((node) => (
                                <div
                                  key={node.id}
                                  onClick={() => setSelectedNode(node.id)}
                                  className={cn(
                                    "p-3 rounded-lg border-2 cursor-pointer transition-all relative",
                                    getNodeColor(node.type),
                                    selectedNode === node.id ? "ring-2 ring-primary ring-offset-2" : "",
                                  )}
                                >
                                  {node.source === "integration" && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute -top-2 -right-2 text-xs flex items-center gap-1 px-1.5 py-0.5"
                                    >
                                      <Zap className="size-3" />
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-2 mb-1">
                                    {getNodeIcon(node.type)}
                                    <p className="font-medium text-xs">{node.title}</p>
                                  </div>
                                  <p className="text-xs opacity-70">{node.date}</p>
                                  {node.integrationName && (
                                    <p className="text-xs opacity-60 mt-1">via {node.integrationName}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Connection indicator */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="h-0.5 w-12 bg-border" />
                          <GitBranch className="size-4" />
                          <div className="h-0.5 w-12 bg-border" />
                        </div>
                      </div>

                      {/* Row 3: Evidence & Updates */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3">Evidence & Updates</p>
                        <div className="flex gap-4 flex-wrap">
                          {traceNodes
                            .filter((n) => n.type === "evidence" || n.type === "update")
                            .map((node) => (
                              <div
                                key={node.id}
                                onClick={() => setSelectedNode(node.id)}
                                className={cn(
                                  "p-3 rounded-lg border-2 cursor-pointer transition-all min-w-[180px] relative",
                                  getNodeColor(node.type),
                                  selectedNode === node.id ? "ring-2 ring-primary ring-offset-2" : "",
                                )}
                              >
                                {node.source === "integration" && (
                                  <Badge
                                    variant="secondary"
                                    className="absolute -top-2 -right-2 text-xs flex items-center gap-1 px-1.5 py-0.5"
                                  >
                                    <Zap className="size-3" />
                                  </Badge>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                  {getNodeIcon(node.type)}
                                  <p className="font-medium text-xs">{node.title}</p>
                                </div>
                                <p className="text-xs opacity-70">{node.author}</p>
                                {node.integrationName && (
                                  <p className="text-xs opacity-60 mt-1">via {node.integrationName}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Node Details */}
              <div>
                {selectedNodeData ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg border", getNodeColor(selectedNodeData.type))}>
                          {getNodeIcon(selectedNodeData.type)}
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1 text-xs capitalize">
                            {selectedNodeData.type}
                          </Badge>
                          <CardTitle className="text-lg">{selectedNodeData.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedNodeData.source === "integration" && (
                          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="size-4 text-accent" />
                              <span className="font-medium">Synced from {selectedNodeData.integrationName}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Automatically imported from external integration
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium mb-1">Description</p>
                          <p className="text-sm text-muted-foreground">{selectedNodeData.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Date</p>
                            <p className="text-sm font-mono">{selectedNodeData.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Author</p>
                            <p className="text-sm">{selectedNodeData.author}</p>
                          </div>
                        </div>
                        {selectedNodeData.status && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <Badge variant="default" className="capitalize">
                              {selectedNodeData.status}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Connected Nodes ({selectedNodeData.connections.length})
                          </p>
                          <div className="space-y-2">
                            {selectedNodeData.connections.map((connId) => {
                              const connNode = traceNodes.find((n) => n.id === connId)
                              if (!connNode) return null
                              return (
                                <div
                                  key={connId}
                                  onClick={() => setSelectedNode(connId)}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors",
                                    getNodeColor(connNode.type),
                                  )}
                                >
                                  {getNodeIcon(connNode.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{connNode.title}</p>
                                    <p className="text-xs opacity-70 capitalize">{connNode.type}</p>
                                  </div>
                                  <ArrowRight className="size-3" />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Network className="size-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Node Selected</h3>
                      <p className="text-sm text-muted-foreground">Click on any node to view details and connections</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Graph Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg border", getNodeColor("decision"))}>
                      {getNodeIcon("decision")}
                    </div>
                    <span className="text-sm">Decisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg border", getNodeColor("commitment"))}>
                      {getNodeIcon("commitment")}
                    </div>
                    <span className="text-sm">Commitments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg border", getNodeColor("meeting"))}>{getNodeIcon("meeting")}</div>
                    <span className="text-sm">Meetings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg border", getNodeColor("evidence"))}>
                      {getNodeIcon("evidence")}
                    </div>
                    <span className="text-sm">Evidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg border", getNodeColor("update"))}>{getNodeIcon("update")}</div>
                    <span className="text-sm">Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs flex items-center gap-1 px-2 py-1">
                      <Zap className="size-3" />
                    </Badge>
                    <span className="text-sm">Integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
