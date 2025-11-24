"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, CheckCircle2, FileText, LinkIcon, ImageIcon, Database } from "lucide-react"
import { downloadBlob } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface Evidence {
  id: string
  title: string
  type: "document" | "link" | "data" | "screenshot"
  uploadedBy: string
  uploadedDate: string
  verified: boolean
  url?: string
}

interface EvidenceViewerDialogProps {
  evidence: Evidence | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EvidenceViewerDialog({ evidence, open, onOpenChange }: EvidenceViewerDialogProps) {
  if (!evidence) return null

  const handleDownload = async () => {
    // Generate fake evidence file
    const content = `
${evidence.title}
===============

Type: ${evidence.type}
Uploaded by: ${evidence.uploadedBy}
Upload date: ${evidence.uploadedDate}
Verification status: ${evidence.verified ? "Verified" : "Pending"}

DOCUMENT CONTENT
================

This is a sample ${evidence.type} that demonstrates evidence tracking in the governance system.

${
  evidence.type === "document"
    ? `
EXECUTIVE SUMMARY
This document provides comprehensive analysis and documentation to support governance decisions.

KEY FINDINGS
1. All compliance requirements have been met
2. Security protocols are properly implemented
3. Risk mitigation strategies are in place
4. Stakeholder approval obtained

RECOMMENDATIONS
• Continue monitoring implementation progress
• Schedule quarterly review sessions
• Update documentation as needed
`
    : evidence.type === "data"
      ? `
DATA ANALYSIS RESULTS
=====================

Metric 1: 95% compliance rate
Metric 2: 12% improvement over baseline
Metric 3: 0 critical issues found
Metric 4: 3 recommendations for optimization

DETAILED BREAKDOWN
- Category A: 87 items processed
- Category B: 124 items processed  
- Category C: 56 items processed

Total items analyzed: 267
`
      : evidence.type === "link"
        ? `
EXTERNAL RESOURCE REFERENCE
============================

URL: ${evidence.url || "https://example.com/resource"}
Access Level: Board members only
Last Updated: ${evidence.uploadedDate}

This link provides access to external systems and dashboards for real-time monitoring and analysis.
`
        : `
SCREENSHOT DOCUMENTATION
========================

Screenshot captured: ${evidence.uploadedDate}
Source: Internal dashboard
Purpose: Visual evidence of system state

[Image would be displayed here in actual implementation]
`
}

Document ID: ${evidence.id}
Generated: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: "text/plain" })
    downloadBlob(blob, `${evidence.title.replace(/\s+/g, "_")}.txt`)

    toast.success(`Downloaded ${evidence.title}`, {
      description: `${evidence.type} file saved successfully`,
    })
  }

  const getTypeIcon = () => {
    switch (evidence.type) {
      case "document":
        return <FileText className="size-8 text-primary" />
      case "link":
        return <LinkIcon className="size-8 text-accent" />
      case "data":
        return <Database className="size-8 text-success" />
      case "screenshot":
        return <ImageIcon className="size-8 text-warning" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-muted">{getTypeIcon()}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="text-xl">{evidence.title}</DialogTitle>
                {evidence.verified && (
                  <Badge variant="default" className="shrink-0">
                    <CheckCircle2 className="size-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-2">
                {evidence.type} • Uploaded by {evidence.uploadedBy} on {evidence.uploadedDate}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Evidence Preview */}
          <div className="p-6 rounded-lg border bg-muted/30">
            <h4 className="font-semibold mb-3">Document Preview</h4>
            <div className="prose prose-sm max-w-none">
              {evidence.type === "document" && (
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-foreground">Executive Summary</p>
                  <p className="text-muted-foreground">
                    This document provides comprehensive analysis and documentation to support governance decisions and
                    strategic planning initiatives. All findings have been reviewed and verified by the appropriate
                    stakeholders.
                  </p>
                  <p className="font-semibold text-foreground mt-4">Key Findings</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All compliance requirements have been met</li>
                    <li>Security protocols are properly implemented</li>
                    <li>Risk mitigation strategies are in place</li>
                    <li>Stakeholder approval obtained</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Full document available for download. This preview shows a summary of the contents.
                  </p>
                </div>
              )}
              {evidence.type === "data" && (
                <div className="space-y-3">
                  <p className="font-semibold text-sm text-foreground">Data Analysis Results</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded bg-background border">
                      <p className="text-muted-foreground text-xs">Compliance Rate</p>
                      <p className="text-2xl font-semibold text-foreground">95%</p>
                    </div>
                    <div className="p-3 rounded bg-background border">
                      <p className="text-muted-foreground text-xs">Improvement</p>
                      <p className="text-2xl font-semibold text-success">+12%</p>
                    </div>
                    <div className="p-3 rounded bg-background border">
                      <p className="text-muted-foreground text-xs">Critical Issues</p>
                      <p className="text-2xl font-semibold text-foreground">0</p>
                    </div>
                    <div className="p-3 rounded bg-background border">
                      <p className="text-muted-foreground text-xs">Items Analyzed</p>
                      <p className="text-2xl font-semibold text-foreground">267</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Complete dataset available for download with detailed breakdowns and analysis.
                  </p>
                </div>
              )}
              {evidence.type === "link" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This evidence item links to an external resource for real-time monitoring and analysis.
                  </p>
                  <div className="p-4 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground mb-2">Resource URL</p>
                    <p className="font-mono text-sm break-all text-foreground">
                      {evidence.url || "https://security-dashboard.example.com/board-view"}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={evidence.url || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4 mr-2" />
                      Open External Resource
                    </a>
                  </Button>
                </div>
              )}
              {evidence.type === "screenshot" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Screenshot documentation captured on {evidence.uploadedDate}
                  </p>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted/50 border flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="size-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Screenshot preview</p>
                      <p className="text-xs text-muted-foreground">Dashboard visualization captured</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Full resolution image available for download</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Document ID</p>
              <p className="font-mono text-xs">{evidence.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Type</p>
              <p className="capitalize">{evidence.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Uploaded By</p>
              <p>{evidence.uploadedBy}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Upload Date</p>
              <p>{evidence.uploadedDate}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="size-4 mr-2" />
              Download {evidence.type === "link" ? "Reference" : "Document"}
            </Button>
            {evidence.type === "link" && evidence.url && (
              <Button variant="outline" asChild>
                <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4 mr-2" />
                  Open Link
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
