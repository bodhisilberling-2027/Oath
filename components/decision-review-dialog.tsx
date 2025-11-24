"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, FileText, Clock, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { DocumentViewerDialog } from "@/components/document-viewer-dialog"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface DecisionReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  decision: {
    id: string
    title: string
    description?: string
    dueDate: string
    priority: string
  } | null
}

export function DecisionReviewDialog({ open, onOpenChange, decision }: DecisionReviewDialogProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<{
    filename: string
    size: string
    uploadDate: string
    type: "pdf" | "xlsx" | "docx" | "other"
  } | null>(null)

  const [aiOutput, setAiOutput] = useState<string>("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [hasRunAiReview, setHasRunAiReview] = useState(false)

  if (!decision) return null

  const runAiReview = async () => {
    setIsAiLoading(true)
    setAiOutput("")
    setHasRunAiReview(true)

    try {
      const response = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "decision-review",
          decision: {
            id: decision.id,
            title: decision.title,
            description: decision.description,
            dueDate: decision.dueDate,
            priority: decision.priority,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze decision")
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
        setAiOutput((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("[v0] AI review error:", error)
      toast.error("Failed to run AI review")
      setAiOutput("Error: Unable to generate AI review. Please try again.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success(`Decision "${decision.title}" approved successfully`)
    onOpenChange(false)
    setIsSubmitting(false)
    setComments("")
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.error(`Decision "${decision.title}" rejected`)
    onOpenChange(false)
    setIsSubmitting(false)
    setComments("")
  }

  const handleViewDocument = (filename: string, size: string, uploadDate: string, type: "pdf" | "xlsx") => {
    setSelectedDocument({ filename, size, uploadDate, type })
    setViewerOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Decision</DialogTitle>
            <DialogDescription>Review and approve or reject this decision</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Decision Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{decision.title}</h3>
                {decision.description && <p className="text-sm text-muted-foreground">{decision.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">{decision.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge variant={decision.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                      {decision.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Supporting Documents</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Budget Analysis Report.pdf</p>
                      <p className="text-xs text-muted-foreground">2.4 MB • Uploaded Nov 23</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDocument("Budget Analysis Report.pdf", "2.4 MB", "Nov 23", "pdf")}
                  >
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Financial Projections Q4.xlsx</p>
                      <p className="text-xs text-muted-foreground">1.8 MB • Uploaded Nov 24</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDocument("Financial Projections Q4.xlsx", "1.8 MB", "Nov 24", "xlsx")}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-medium">
                Comments (Optional)
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your comments or feedback..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Oath AI Review</Label>
                {!hasRunAiReview && (
                  <Button variant="outline" size="sm" onClick={runAiReview} disabled={isAiLoading}>
                    {isAiLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>Run AI Review</>
                    )}
                  </Button>
                )}
              </div>

              {hasRunAiReview && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  {isAiLoading && aiOutput === "" ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Oath AI is reviewing this decision...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownRenderer content={aiOutput} />
                      {isAiLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting || isAiLoading}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <CheckCircle2 className="size-4 mr-2" />
                Approve Decision
              </Button>
              <Button
                onClick={handleReject}
                disabled={isSubmitting || isAiLoading}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="size-4 mr-2" />
                Reject Decision
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <DocumentViewerDialog open={viewerOpen} onOpenChange={setViewerOpen} document={selectedDocument} />
    </>
  )
}
