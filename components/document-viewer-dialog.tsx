"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface DocumentViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: {
    filename: string
    size: string
    uploadDate: string
    type: "pdf" | "xlsx" | "docx" | "other"
  } | null
}

export function DocumentViewerDialog({ open, onOpenChange, document }: DocumentViewerDialogProps) {
  if (!document) return null

  const handleDownload = () => {
    const content = generateFakeDocumentContent(document.type, document.filename)
    const blob = new Blob([content], { type: getMimeType(document.type) })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = document.filename
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${document.filename}`)
  }

  const handleOpenInNewTab = () => {
    const content = generateFakeDocumentContent(document.type, document.filename)
    const blob = new Blob([content], { type: getMimeType(document.type) })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
    toast.success(`Opened ${document.filename} in new tab`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg">{document.filename}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="size-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg bg-muted/30 p-6">
          {document.type === "pdf" && <PDFPreview filename={document.filename} />}
          {document.type === "xlsx" && <SpreadsheetPreview filename={document.filename} />}
          {document.type === "docx" && <DocumentPreview filename={document.filename} />}
        </div>

        <div className="text-xs text-muted-foreground">
          {document.size} • Uploaded {document.uploadDate}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PDFPreview({ filename }: { filename: string }) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded shadow-sm text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">{filename.replace(".pdf", "")}</h1>
        <div className="space-y-3 text-sm leading-relaxed text-gray-900">
          <p className="font-semibold text-gray-900">Executive Summary</p>
          <p className="text-gray-900">
            This budget analysis report provides a comprehensive overview of Q4 2025 financial performance and
            projections for the upcoming fiscal year. Our analysis indicates strong revenue growth across all major
            product lines, with particular strength in the data center and AI computing segments.
          </p>
          <p className="font-semibold mt-6 text-gray-900">Key Findings</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-900">
            <li>Total revenue projected at $35.1B, representing 94% year-over-year growth</li>
            <li>Data center segment revenue: $30.8B (up 112% YoY)</li>
            <li>Gaming revenue: $3.3B (up 15% YoY)</li>
            <li>Professional visualization: $486M (up 17% YoY)</li>
            <li>Automotive segment: $449M (up 72% YoY)</li>
          </ul>
          <p className="font-semibold mt-6 text-gray-900">Budget Allocation Recommendations</p>
          <p className="text-gray-900">
            Based on current market conditions and growth trajectories, we recommend increasing R&D investments by 25%
            to maintain competitive advantage in AI infrastructure. Marketing budgets should be increased by 18% to
            support new product launches in Q1 2026.
          </p>
          <p className="mt-4 text-gray-900">
            Operating expenses are projected at $9.2B for Q4, with gross margins expected to remain strong at 75.5%.
            This performance supports our recommendation to proceed with the new product line authorization.
          </p>
        </div>
      </div>
    </div>
  )
}

function SpreadsheetPreview({ filename }: { filename: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow-sm overflow-hidden text-gray-900">
        <div className="bg-gray-100 p-2 border-b font-semibold text-sm text-gray-900">
          {filename.replace(".xlsx", "")}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Quarter</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Revenue ($B)</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Gross Margin %</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Operating Income ($B)</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-900">Net Income ($B)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 text-gray-900">Q1 2025</td>
                <td className="px-4 py-2 text-right text-gray-900">26.0</td>
                <td className="px-4 py-2 text-right text-gray-900">78.4%</td>
                <td className="px-4 py-2 text-right text-gray-900">16.9</td>
                <td className="px-4 py-2 text-right text-gray-900">14.9</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-900">Q2 2025</td>
                <td className="px-4 py-2 text-right text-gray-900">30.0</td>
                <td className="px-4 py-2 text-right text-gray-900">78.9%</td>
                <td className="px-4 py-2 text-right text-gray-900">19.1</td>
                <td className="px-4 py-2 text-right text-gray-900">16.6</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-gray-900">Q3 2025</td>
                <td className="px-4 py-2 text-right text-gray-900">33.1</td>
                <td className="px-4 py-2 text-right text-gray-900">77.2%</td>
                <td className="px-4 py-2 text-right text-gray-900">20.4</td>
                <td className="px-4 py-2 text-right text-gray-900">17.7</td>
              </tr>
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-2 text-gray-900">Q4 2025 (Projected)</td>
                <td className="px-4 py-2 text-right text-gray-900">35.1</td>
                <td className="px-4 py-2 text-right text-gray-900">75.5%</td>
                <td className="px-4 py-2 text-right text-gray-900">21.2</td>
                <td className="px-4 py-2 text-right text-gray-900">18.4</td>
              </tr>
              <tr className="bg-green-50 font-semibold">
                <td className="px-4 py-2 text-gray-900">Q1 2026 (Forecast)</td>
                <td className="px-4 py-2 text-right text-gray-900">38.5</td>
                <td className="px-4 py-2 text-right text-gray-900">76.0%</td>
                <td className="px-4 py-2 text-right text-gray-900">23.8</td>
                <td className="px-4 py-2 text-right text-gray-900">20.5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t text-xs text-gray-700">
          Note: All figures in billions USD. Q4 2025 and Q1 2026 are projections based on current market trends and
          pipeline analysis.
        </div>
      </div>
    </div>
  )
}

function DocumentPreview({ filename }: { filename: string }) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded shadow-sm text-gray-900">
        <h1 className="text-xl font-bold mb-4 text-gray-900">{filename.replace(".docx", "")}</h1>
        <div className="space-y-3 text-sm leading-relaxed text-gray-900">
          <p>This document contains important information related to the decision under review.</p>
        </div>
      </div>
    </div>
  )
}

function generateFakeDocumentContent(type: string, filename: string): string {
  if (type === "pdf") {
    return `Budget Analysis Report
    
Executive Summary
This budget analysis report provides a comprehensive overview of Q4 2025 financial performance and projections for the upcoming fiscal year.

Key Findings:
- Total revenue projected at $35.1B, representing 94% year-over-year growth
- Data center segment revenue: $30.8B (up 112% YoY)
- Gaming revenue: $3.3B (up 15% YoY)
- Professional visualization: $486M (up 17% YoY)
- Automotive segment: $449M (up 72% YoY)

Budget Allocation Recommendations
Based on current market conditions and growth trajectories, we recommend increasing R&D investments by 25% to maintain competitive advantage in AI infrastructure.`
  } else if (type === "xlsx") {
    return `Quarter,Revenue ($B),Gross Margin %,Operating Income ($B),Net Income ($B)
Q1 2025,26.0,78.4%,16.9,14.9
Q2 2025,30.0,78.9%,19.1,16.6
Q3 2025,33.1,77.2%,20.4,17.7
Q4 2025 (Projected),35.1,75.5%,21.2,18.4
Q1 2026 (Forecast),38.5,76.0%,23.8,20.5`
  }
  return `Document: ${filename}\n\nThis is a sample document preview.`
}

function getMimeType(type: string): string {
  switch (type) {
    case "pdf":
      return "application/pdf"
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    default:
      return "text/plain"
  }
}
