"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, ArrowLeft, Loader2, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

const generateRandomSources = () => {
  const sources = []
  const types = ["slack", "email", "board_deck", "notion", "zoom"]
  const topics = [
    "Q4 Budget Review",
    "Strategic Partnership Discussion",
    "Security Audit Planning",
    "Product Launch Strategy",
    "Risk Assessment",
    "Compliance Update",
    "Market Expansion Plans",
    "Engineering Roadmap",
    "Financial Projections",
    "Board Meeting Prep",
    "Vendor Contract Review",
    "Customer Advisory Board",
    "Innovation Workshop",
    "Quarterly Planning",
    "Executive Compensation",
  ]

  const snippets = {
    slack: [
      "Jensen: We need to finalize the AI compute allocation...",
      "Meeting scheduled for tomorrow at 2 PM to discuss timeline...",
      "Board approved $50M investment in new data center...",
      "Risk factors identified in Q3 security review...",
      "Action item: CFO to prepare budget breakdown by Friday...",
    ],
    email: [
      "From: CEO - Regarding strategic priorities for next quarter...",
      "Subject: Board Resolution - Approving acquisition terms...",
      "Re: Partnership diligence - Legal review completed...",
      "FW: Executive compensation adjustments for FY2026...",
      "Action required: Sign off on vendor contract amendments...",
    ],
    board_deck: [
      "Slide 12: Revenue growth projections show 45% YoY increase...",
      "Executive summary highlights key strategic initiatives...",
      "Financial model updated with new market assumptions...",
      "Risk matrix identifies 3 high-priority governance items...",
      "Appendix contains detailed competitive analysis...",
    ],
    notion: [
      "Updated board calendar with Q1 2026 meeting schedule...",
      "Risk register shows 12 active items requiring review...",
      "Strategic initiatives dashboard tracking 8 major projects...",
      "Compliance checklist updated with new SOX requirements...",
      "Partnership pipeline includes 5 potential acquisitions...",
    ],
    zoom: [
      "Transcript: Jensen discussed AI infrastructure roadmap...",
      "Meeting recording: Board approval of budget allocation...",
      "Action items captured: CFO to prepare financial analysis...",
      "Key decisions: Approved partnership with cloud provider...",
      "Follow-up scheduled: Executive team sync next Thursday...",
    ],
  }

  // Generate 20-30 random sources
  const count = Math.floor(Math.random() * 11) + 20
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const topic = topics[Math.floor(Math.random() * topics.length)]
    const snippetArray = snippets[type as keyof typeof snippets]
    const snippet = snippetArray[Math.floor(Math.random() * snippetArray.length)]
    sources.push({
      id: `source-${i}`,
      type,
      topic,
      snippet, // Added snippet to source object
      status: "pending" as const,
    })
  }
  return sources
}

export default function IngestPage() {
  const router = useRouter()
  const [sources, setSources] = useState<
    Array<{ id: string; type: string; topic: string; snippet: string; status: string }>
  >([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [extractedCount, setExtractedCount] = useState({ decisions: 0, commitments: 0, events: 0 })

  useEffect(() => {
    const generatedSources = generateRandomSources()
    setSources(generatedSources)
    setIsProcessing(true)

    // Start processing immediately
    startProcessing(generatedSources)
  }, [])

  const startProcessing = async (sourcesToProcess: typeof sources) => {
    // Process sources very fast (100-200ms each)
    for (let i = 0; i < sourcesToProcess.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 100))

      setSources((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "processing" } : idx < i ? { ...s, status: "complete" } : s)),
      )
      setCurrentIndex(i)

      // Randomly increment extracted items
      setExtractedCount((prev) => ({
        decisions: prev.decisions + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0),
        commitments: prev.commitments + (Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0),
        events: prev.events + Math.floor(Math.random() * 4) + 1,
      }))
    }

    // Mark all complete
    setSources((prev) => prev.map((s) => ({ ...s, status: "complete" })))
    setIsProcessing(false)
    setIsComplete(true)

    // Show success after brief delay
    setTimeout(() => {
      toast.success("Integration complete!", {
        description: `Processed ${sourcesToProcess.length} data sources`,
      })
    }, 500)
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <img src="/images/slack-logo.png" alt="Slack" className="size-5" />
      case "email":
        return <img src="/images/outlook-logo.png" alt="Outlook" className="size-5" />
      case "board_deck":
        return <img src="/images/pdf-logo.png" alt="PDF" className="size-5" />
      case "notion":
        return <img src="/images/notion-logo.png" alt="Notion" className="size-5" />
      case "zoom":
        return <img src="/images/zoom-logo.png" alt="Zoom" className="size-5" />
      default:
        return <FileText className="size-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} disabled={isProcessing}>
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <img src="/images/image-19-removebg-preview.png" alt="Oath Logo" className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Oath Sync</h1>
                  <p className="text-xs text-muted-foreground">AI-powered governance ingestion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Processing Status */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Data Sources</h3>
                {isComplete ? (
                  <Badge variant="default" className="bg-success">
                    <CheckCircle2 className="size-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Loader2 className="size-3 mr-1 animate-spin" />
                    Processing
                  </Badge>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sources.slice(0, Math.max(currentIndex + 5, 10)).map((source, idx) => (
                  <div
                    key={source.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      source.status === "complete"
                        ? "bg-success/5 border-success/30"
                        : source.status === "processing"
                          ? "bg-accent/10 border-accent/30"
                          : "bg-muted/20 border-border"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{getSourceIcon(source.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.topic}</p>
                      <p className="text-xs text-muted-foreground capitalize mb-1">{source.type.replace("_", " ")}</p>
                      {(source.status === "processing" || source.status === "complete") && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">{source.snippet}</p>
                      )}
                    </div>
                    {source.status === "complete" && (
                      <CheckCircle2 className="size-4 text-success flex-shrink-0 mt-1" />
                    )}
                    {source.status === "processing" && (
                      <Loader2 className="size-4 text-accent animate-spin flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium">
                    {Math.min(currentIndex + 1, sources.length)} / {sources.length}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / sources.length) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Extraction Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Extraction Results</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Decisions Extracted</span>
                    <CheckCircle2 className="size-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-semibold">{extractedCount.decisions}</p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Commitments Tracked</span>
                    <CheckCircle2 className="size-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-semibold">{extractedCount.commitments}</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Audit Events Created</span>
                    <CheckCircle2 className="size-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-semibold">{extractedCount.events}</p>
                </div>
              </div>

              {isComplete && (
                <Card className="p-4 bg-success/10 border-success/30 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Integration complete</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        All data has been synced and is now visible across the Control Room, Audit Trail, and Execution
                        Tracking.
                      </p>
                      <Button size="sm" onClick={() => router.push("/")}>
                        View in Control Room
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg mt-6">
                  <Loader2 className="size-5 text-accent animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">AI is analyzing data sources...</p>
                    <p className="text-xs text-muted-foreground">
                      Extracting decisions, commitments, owners, and risks
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
