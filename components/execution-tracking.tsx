"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Download,
  Search,
  FileDown,
  FilePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { generateExecutionReportPDF, downloadBlob } from "@/lib/pdf-generator"
import { EvidenceViewerDialog } from "@/components/evidence-viewer-dialog"

interface Milestone {
  id: string
  title: string
  dueDate: string
  status: "completed" | "on-track" | "at-risk" | "blocked"
  completedDate?: string
}

interface Evidence {
  id: string
  title: string
  type: "document" | "link" | "data" | "screenshot"
  uploadedBy: string
  uploadedDate: string
  verified: boolean
  url?: string
}

interface Commitment {
  id: string
  title: string
  description: string
  owner: string
  category: string
  status: "on-track" | "at-risk" | "behind" | "completed"
  progress: number
  startDate: string
  dueDate: string
  milestones: Milestone[]
  evidence: Evidence[]
  updates: {
    id: string
    date: string
    author: string
    content: string
    progressChange: number
  }[]
}

export function ExecutionTracking({ onBack }: { onBack: () => void }) {
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingEvidence, setIsAddingEvidence] = useState(false)
  const [viewingEvidence, setViewingEvidence] = useState<Evidence | null>(null)

  const [commitments, setCommitments] = useState<Commitment[]>([
    {
      id: "security-audit",
      title: "Complete security audit",
      description: "Comprehensive security assessment of all infrastructure and applications",
      owner: "Colette Kress",
      category: "Security",
      status: "on-track",
      progress: 75,
      startDate: "2025-11-23",
      dueDate: "2025-11-25",
      milestones: [
        {
          id: "m1",
          title: "Infrastructure assessment",
          dueDate: "2025-11-23",
          status: "completed",
          completedDate: "2025-11-23",
        },
        {
          id: "m2",
          title: "Application security review",
          dueDate: "2025-11-24",
          status: "completed",
          completedDate: "2025-11-24",
        },
        {
          id: "m3",
          title: "Penetration testing",
          dueDate: "2025-11-25",
          status: "on-track",
        },
        {
          id: "m4",
          title: "Final report and remediation plan",
          dueDate: "2025-11-25",
          status: "on-track",
        },
      ],
      evidence: [
        {
          id: "e1",
          title: "Infrastructure Assessment Report",
          type: "document",
          uploadedBy: "Colette Kress",
          uploadedDate: "2025-11-23",
          verified: true,
        },
        {
          id: "e2",
          title: "Vulnerability Scan Results",
          type: "data",
          uploadedBy: "Security Team",
          uploadedDate: "2025-11-24",
          verified: true,
        },
        {
          id: "e3",
          title: "Security Dashboard",
          type: "link",
          uploadedBy: "Colette Kress",
          uploadedDate: "2025-11-24",
          verified: false,
          url: "https://security.nvidia.com/dashboard",
        },
      ],
      updates: [
        {
          id: "u1",
          date: "2025-11-24",
          author: "Colette Kress",
          content: "Penetration testing phase initiated. Engaged external security firm for comprehensive assessment.",
          progressChange: 10,
        },
        {
          id: "u2",
          date: "2025-11-24",
          author: "Colette Kress",
          content: "Application security review completed. Found 3 medium-priority issues, all documented.",
          progressChange: 15,
        },
      ],
    },
    {
      id: "vendor-contracts",
      title: "Finalize vendor contracts",
      description: "Complete negotiation and signing of key vendor agreements for Q1",
      owner: "Tim Teter",
      category: "Legal",
      status: "on-track",
      progress: 90,
      startDate: "2025-11-23",
      dueDate: "2025-11-25",
      milestones: [
        {
          id: "m1",
          title: "Draft contract reviews",
          dueDate: "2025-11-23",
          status: "completed",
          completedDate: "2025-11-23",
        },
        {
          id: "m2",
          title: "Vendor negotiations",
          dueDate: "2025-11-25",
          status: "on-track",
        },
        {
          id: "m3",
          title: "Legal approval",
          dueDate: "2025-11-25",
          status: "on-track",
        },
        {
          id: "m4",
          title: "Contract execution",
          dueDate: "2025-11-25",
          status: "on-track",
        },
      ],
      evidence: [
        {
          id: "e1",
          title: "Vendor Contract Template",
          type: "document",
          uploadedBy: "Tim Teter",
          uploadedDate: "2025-11-23",
          verified: true,
        },
        {
          id: "e2",
          title: "Negotiation Terms",
          type: "document",
          uploadedBy: "Legal Team",
          uploadedDate: "2025-11-23",
          verified: true,
        },
      ],
      updates: [
        {
          id: "u1",
          date: "2025-11-24",
          author: "Tim Teter",
          content: "All vendor negotiations progressing well. Two contracts ready for final signature.",
          progressChange: 0,
        },
      ],
    },
    {
      id: "marketing-campaign",
      title: "Launch marketing campaign",
      description: "Q1 product launch marketing initiative across digital and traditional channels",
      owner: "Jay Puri",
      category: "Marketing",
      status: "on-track",
      progress: 60,
      startDate: "2025-11-23",
      dueDate: "2025-11-25",
      milestones: [
        {
          id: "m1",
          title: "Campaign strategy approval",
          dueDate: "2025-11-23",
          status: "completed",
          completedDate: "2025-11-23",
        },
        {
          id: "m2",
          title: "Creative asset development",
          dueDate: "2025-11-24",
          status: "completed",
          completedDate: "2025-11-24",
        },
        {
          id: "m3",
          title: "Media buying and placement",
          dueDate: "2025-11-25",
          status: "on-track",
        },
        {
          id: "m4",
          title: "Campaign launch",
          dueDate: "2025-11-25",
          status: "on-track",
        },
      ],
      evidence: [
        {
          id: "e1",
          title: "Campaign Strategy Document",
          type: "document",
          uploadedBy: "Jay Puri",
          uploadedDate: "2025-11-23",
          verified: true,
        },
        {
          id: "e2",
          title: "Creative Assets Package",
          type: "document",
          uploadedBy: "Marketing Team",
          uploadedDate: "2025-11-24",
          verified: true,
        },
      ],
      updates: [
        {
          id: "u1",
          date: "2025-11-24",
          author: "Jay Puri",
          content: "Creative assets approved. Media placements being finalized.",
          progressChange: 0,
        },
      ],
    },
    {
      id: "compliance-review",
      title: "Complete compliance review",
      description: "Annual compliance audit and regulatory review",
      owner: "Tim Teter",
      category: "Compliance",
      status: "on-track",
      progress: 55,
      startDate: "2025-11-23",
      dueDate: "2025-11-24",
      milestones: [
        {
          id: "m1",
          title: "Documentation review",
          dueDate: "2025-11-23",
          status: "completed",
          completedDate: "2025-11-23",
        },
        {
          id: "m2",
          title: "Process audit",
          dueDate: "2025-11-24",
          status: "completed",
          completedDate: "2025-11-24",
        },
        {
          id: "m3",
          title: "Remediation planning",
          dueDate: "2025-11-24",
          status: "on-track",
        },
        {
          id: "m4",
          title: "Final report",
          dueDate: "2025-11-24",
          status: "on-track",
        },
      ],
      evidence: [
        {
          id: "e1",
          title: "Compliance Checklist",
          type: "document",
          uploadedBy: "Tim Teter",
          uploadedDate: "2025-11-23",
          verified: true,
        },
      ],
      updates: [
        {
          id: "u1",
          date: "2025-11-24",
          author: "Tim Teter",
          content: "Process audit completed. Minor issues identified and documented.",
          progressChange: 0,
        },
      ],
    },
  ])

  const filteredCommitments = commitments.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus
    const matchesOwner = filterOwner === "all" || c.owner === filterOwner
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesOwner && matchesSearch
  })

  const selectedCommitmentData = commitments.find((c) => c.id === selectedCommitment)

  const statusCounts = {
    total: commitments.length,
    "on-track": commitments.filter((c) => c.status === "on-track").length,
    "at-risk": commitments.filter((c) => c.status === "at-risk").length,
    behind: commitments.filter((c) => c.status === "behind").length,
    completed: commitments.filter((c) => c.status === "completed").length,
  }

  const owners = Array.from(new Set(commitments.map((c) => c.owner)))

  const handleExportReport = async () => {
    console.log("[v0] Export Report button clicked in Execution Tracking")
    toast.info("Generating execution report...")
    try {
      const pdf = await generateExecutionReportPDF({
        title: "All Commitments Report",
        description: "Comprehensive tracking of all commitments and execution status",
        owner: "System Generated",
        status: "Active",
        progress: 65,
        dueDate: new Date().toISOString().split("T")[0],
      })
      console.log("[v0] PDF generated, size:", pdf.size, "bytes")
      downloadBlob(pdf, `Execution_Report_${new Date().toISOString().split("T")[0]}.pdf`)
      console.log("[v0] Download triggered")
      toast.success("Execution report exported successfully", {
        description: "PDF report has been downloaded",
      })
    } catch (error) {
      console.error("[v0] Export failed:", error)
      toast.error("Failed to export report")
    }
  }

  const handleDownloadEvidence = async (evidence: Evidence) => {
    console.log("[v0] Download Evidence button clicked for:", evidence.title)
    toast.info(`Preparing ${evidence.title} for download...`)
    try {
      const content = `${evidence.title}\n\nType: ${evidence.type}\nUploaded: ${evidence.uploadedDate}\nBy: ${evidence.uploadedBy}\n\nThis is a sample evidence file.`
      const blob = new Blob([content], { type: "text/plain" })
      console.log("[v0] Evidence blob created, size:", blob.size, "bytes")
      downloadBlob(blob, `${evidence.title.replace(/\s+/g, "_")}.txt`)
      console.log("[v0] Download triggered")
      toast.success(`Downloaded ${evidence.title}`, {
        description: `${evidence.type} file saved successfully`,
      })
    } catch (error) {
      console.error("[v0] Download evidence failed:", error)
      toast.error("Failed to download evidence")
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
                <h1 className="text-2xl font-semibold tracking-tight">Execution Tracking</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <FileDown className="size-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" onClick={() => toast.success("Opening new commitment form...")}>
                <Plus className="size-4 mr-2" />
                New Commitment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total</p>
              <Target className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold">{statusCounts.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">On Track</p>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-2xl font-semibold">{statusCounts["on-track"]}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">At Risk</p>
              <AlertCircle className="size-4 text-warning" />
            </div>
            <p className="text-2xl font-semibold">{statusCounts["at-risk"]}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Behind</p>
              <AlertCircle className="size-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold">{statusCounts.behind}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold">{statusCounts.completed}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commitments List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commitments</CardTitle>
                <CardDescription>Filter and select to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search commitments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="on-track">On Track</SelectItem>
                        <SelectItem value="at-risk">At Risk</SelectItem>
                        <SelectItem value="behind">Behind</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterOwner} onValueChange={setFilterOwner}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {owners.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredCommitments.map((commitment) => (
                    <div
                      key={commitment.id}
                      onClick={() => setSelectedCommitment(commitment.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        selectedCommitment === commitment.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30",
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm leading-tight">{commitment.title}</p>
                        <Badge
                          variant={
                            commitment.status === "on-track"
                              ? "default"
                              : commitment.status === "at-risk"
                                ? "secondary"
                                : commitment.status === "behind"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="ml-2 shrink-0"
                        >
                          {commitment.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono font-medium">{commitment.progress}%</span>
                        </div>
                        <Progress value={commitment.progress} className="h-1.5" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{commitment.owner}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {commitment.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedCommitmentData ? (
              <div className="space-y-6">
                {/* Commitment Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedCommitmentData.title}</CardTitle>
                        <CardDescription className="mt-2">{selectedCommitmentData.description}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          selectedCommitmentData.status === "on-track"
                            ? "default"
                            : selectedCommitmentData.status === "at-risk"
                              ? "secondary"
                              : selectedCommitmentData.status === "behind"
                                ? "destructive"
                                : "outline"
                        }
                        className="text-sm"
                      >
                        {selectedCommitmentData.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Owner</p>
                        <p className="font-medium">{selectedCommitmentData.owner}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Category</p>
                        <Badge variant="outline">{selectedCommitmentData.category}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                        <p className="font-mono text-sm">{selectedCommitmentData.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                        <p className="font-mono text-sm">{selectedCommitmentData.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Overall Progress</p>
                        <span className="text-2xl font-semibold">{selectedCommitmentData.progress}%</span>
                      </div>
                      <Progress value={selectedCommitmentData.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Milestones</CardTitle>
                    <CardDescription>{selectedCommitmentData.milestones.length} milestones tracked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCommitmentData.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex items-start gap-3">
                          <div className="relative">
                            {milestone.status === "completed" && <CheckCircle2 className="size-5 text-success" />}
                            {milestone.status === "on-track" && <Clock className="size-5 text-primary" />}
                            {milestone.status === "at-risk" && <AlertCircle className="size-5 text-warning" />}
                            {milestone.status === "blocked" && <AlertCircle className="size-5 text-destructive" />}
                            {index < selectedCommitmentData.milestones.length - 1 && (
                              <div className="absolute left-1/2 top-6 -translate-x-1/2 w-0.5 h-8 bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{milestone.title}</p>
                              <Badge
                                variant={
                                  milestone.status === "completed"
                                    ? "default"
                                    : milestone.status === "on-track"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Due: {milestone.dueDate}
                              {milestone.completedDate && ` • Completed: ${milestone.completedDate}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="evidence">
                  <TabsList>
                    <TabsTrigger value="evidence">
                      <FileText className="size-4 mr-2" />
                      Evidence ({selectedCommitmentData.evidence.length})
                    </TabsTrigger>
                    <TabsTrigger value="updates">
                      <TrendingUp className="size-4 mr-2" />
                      Updates ({selectedCommitmentData.updates.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Evidence Tab */}
                  <TabsContent value="evidence">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Evidence & Documentation</CardTitle>
                            <CardDescription>
                              {selectedCommitmentData.evidence.filter((e) => e.verified).length} verified items
                            </CardDescription>
                          </div>
                          <Dialog open={isAddingEvidence} onOpenChange={setIsAddingEvidence}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <FilePlus className="size-4 mr-2" />
                                Add Evidence
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Evidence</DialogTitle>
                                <DialogDescription>Upload or link supporting documentation</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Evidence Title</label>
                                  <Input placeholder="Enter evidence title..." />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Type</label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="document">Document</SelectItem>
                                      <SelectItem value="link">Link</SelectItem>
                                      <SelectItem value="data">Data</SelectItem>
                                      <SelectItem value="screenshot">Screenshot</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">URL or Upload</label>
                                  <Input placeholder="https://..." />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    toast.success("Evidence added successfully")
                                    setIsAddingEvidence(false)
                                  }}
                                >
                                  Add Evidence
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedCommitmentData.evidence.map((evidence) => (
                            <div key={evidence.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                  <FileText className="size-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm">{evidence.title}</p>
                                    {evidence.verified && (
                                      <Badge variant="default" className="text-xs">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {evidence.type} • {evidence.uploadedBy} • {evidence.uploadedDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setViewingEvidence(evidence)}>
                                  <Eye className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDownloadEvidence(evidence)}>
                                  <Download className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Updates Tab */}
                  <TabsContent value="updates">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Progress Updates</CardTitle>
                        <CardDescription>Timeline of changes and status updates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedCommitmentData.updates.map((update) => (
                            <div key={update.id} className="flex gap-3">
                              <div className="relative">
                                <div
                                  className={cn(
                                    "size-8 rounded-full flex items-center justify-center",
                                    update.progressChange > 0 && "bg-success/10",
                                    update.progressChange < 0 && "bg-destructive/10",
                                    update.progressChange === 0 && "bg-muted",
                                  )}
                                >
                                  {update.progressChange > 0 && <TrendingUp className="size-4 text-success" />}
                                  {update.progressChange < 0 && <TrendingDown className="size-4 text-destructive" />}
                                  {update.progressChange === 0 && <Minus className="size-4 text-muted-foreground" />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm">{update.author}</p>
                                  <span className="text-xs text-muted-foreground">{update.date}</span>
                                  <Badge
                                    variant={update.progressChange > 0 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {update.progressChange > 0 ? "+" : ""}
                                    {update.progressChange}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{update.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-20">
                  <Target className="size-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Commitment Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a commitment from the list to view details, milestones, and evidence
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Viewer Dialog */}
      <EvidenceViewerDialog
        evidence={viewingEvidence}
        open={!!viewingEvidence}
        onOpenChange={(open) => !open && setViewingEvidence(null)}
      />
    </div>
  )
}

export default ExecutionTracking
