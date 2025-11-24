export async function generateAuditTrailPDF() {
  const content = `
AUDIT TRAIL & TRACE GRAPH REPORT
Generated: ${new Date().toLocaleString()}

ACTIVITY TIMELINE
================

1. Meeting scheduled: Q4 Strategic Review
   Actor: Google Calendar
   Date: 2025-11-25 09:45 AM
   Type: Meeting
   
2. Approved Q4 Budget Allocation decision
   Actor: Board of Directors
   Date: 2025-11-25 10:15 AM
   Type: Decision
   Status: pending → approved
   Votes: 0-0-0 → 6-1-0

3. Meeting recording and transcript uploaded
   Actor: Zoom
   Date: 2025-11-25 11:30 AM
   Type: Evidence
   
4. Discussion thread linked to decision
   Actor: Slack
   Date: 2025-11-24 3:45 PM
   Type: Decision Comment

5. Updated progress on security audit commitment
   Actor: Colette Kress
   Date: 2025-11-24 2:30 PM
   Type: Commitment Update
   Progress: 65% → 75%

TRACE GRAPH CONNECTIONS
=======================

Decision: Q4 Budget Allocation → 
  - Commitment: Complete security audit
  - Meeting: Q4 Strategic Review
  - Evidence: Security Assessment Report

Commitment: Complete security audit →
  - Evidence: Infrastructure Assessment Report
  - Evidence: Vulnerability Scan Results
  - Update: Progress Update: Security Audit

This audit trail provides complete traceability of all governance activities.
`

  return generatePDFFromText(content)
}

export async function generateExecutionReportPDF(commitment: {
  title: string
  description: string
  owner: string
  status: string
  progress: number
  dueDate: string
}) {
  const content = `
EXECUTION TRACKING REPORT
Generated: ${new Date().toLocaleString()}

COMMITMENT DETAILS
==================

Title: ${commitment.title}
Description: ${commitment.description}
Owner: ${commitment.owner}
Status: ${commitment.status}
Progress: ${commitment.progress}%
Due Date: ${commitment.dueDate}

MILESTONES
==========

1. Infrastructure assessment - COMPLETED (2025-11-23)
2. Application security review - COMPLETED (2025-11-24)
3. Penetration testing - ON TRACK (Due: 2025-11-25)
4. Final report and remediation plan - ON TRACK (Due: 2025-11-25)

EVIDENCE & DOCUMENTATION
=========================

1. Infrastructure Assessment Report
   - Type: document
   - Uploaded: 2025-11-23
   - Status: Verified
   
2. Vulnerability Scan Results
   - Type: data
   - Uploaded: 2025-11-24
   - Status: Verified
   
3. Security Dashboard
   - Type: link
   - Uploaded: 2025-11-24
   - Status: Pending verification

PROGRESS UPDATES
================

2025-11-24 - Colette Kress (+10%)
Penetration testing phase initiated. Engaged external security firm for comprehensive assessment.

2025-11-24 - Colette Kress (+15%)
Application security review completed. Found 3 medium-priority issues, all documented.

This report provides complete tracking of commitment execution and progress.
`

  return generatePDFFromText(content)
}

export async function generateBoardPacketPDF(packetTitle: string) {
  const content = `
BOARD PACKET
${packetTitle}
Generated: ${new Date().toLocaleString()}

==================================================
EXECUTIVE SUMMARY
==================================================

Q4 2024 Performance Overview

NVIDIA delivered exceptional results this quarter with 94% revenue growth YoY reaching $35.1B. Our data center segment continues to drive growth with accelerated adoption of AI computing infrastructure across cloud service providers and enterprises.

Key Highlights:
• Data center revenue: $30.8B (up 112% YoY)
• Gaming revenue: $3.3B (up 15% YoY)  
• Professional visualization: $486M (up 17% YoY)
• Automotive: $449M (up 72% YoY)

Strategic Initiatives Progress:
• Blackwell GPU architecture on track for Q1 2025 launch
• 5 new strategic partnerships signed with hyperscalers
• Expanded AI Enterprise software customer base by 340%

==================================================
FINANCIAL PERFORMANCE
==================================================

Detailed Financial Analysis - Q4 2024

Revenue Breakdown:
• Total Revenue: $35.1B (up 94% YoY, up 17% QoQ)
• Gross Margin: 75.0% (GAAP) / 76.4% (non-GAAP)
• Operating Income: $21.9B (up 147% YoY)
• Net Income: $19.3B (up 109% YoY)
• Diluted EPS: $0.78 (up 111% YoY)

Geographic Revenue:
• United States: 47% of total revenue
• China (including Hong Kong): 14%
• Taiwan: 12%
• Other Asia Pacific: 17%
• Europe: 10%

==================================================
STRATEGIC INITIATIVES UPDATE
==================================================

Key Strategic Initiatives - Status Report

1. Blackwell GPU Platform Launch (Status: On Track)
   • Engineering validation complete
   • Production ramp scheduled for Q1 2025
   • Pre-orders from major cloud providers secured

2. AI Software Expansion (Status: Ahead of Schedule)
   • NVIDIA AI Enterprise customer base grew 340%
   • 18 new ISV partnerships signed
   • AI Workbench downloads exceeded 500K

3. Automotive AI Platform (Status: On Track) 
   • DRIVE Thor SoC development progressing
   • 12 automotive OEM partnerships active
   • Q4 automotive revenue: $449M (up 72% YoY)

==================================================
RISK ASSESSMENT
==================================================

Enterprise Risk Overview - Q4 2024

Supply Chain Risks:
• CoWoS packaging capacity constraints being addressed
• Secured additional capacity with TSMC and external partners
• Mitigation: Diversifying packaging suppliers

Competitive Landscape:
• Increased competition in AI accelerator market
• Market leadership position remains strong
• Mitigation: Accelerated Blackwell launch, software differentiation

Regulatory Considerations:
• Export control regulations continue to evolve
• China restrictions impact ~20-25% of data center TAM
• Mitigation: Geographic diversification, alternative products

This board packet was automatically generated from integrated governance data.
`

  return generatePDFFromText(content)
}

function generatePDFFromText(text: string): Blob {
  // Create a minimal valid PDF structure
  const lines = text.split("\n")
  const pageHeight = 792 // Letter size in points
  const pageWidth = 612
  const margin = 50
  const lineHeight = 12
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight)

  let pdfContent = "%PDF-1.4\n"
  let objectId = 1
  const objects: string[] = []

  // Calculate number of pages needed
  const totalPages = Math.ceil(lines.length / maxLinesPerPage)
  const pageObjectIds: number[] = []
  const contentObjectIds: number[] = []

  // Create content and page objects for each page
  for (let page = 0; page < totalPages; page++) {
    const startLine = page * maxLinesPerPage
    const endLine = Math.min((page + 1) * maxLinesPerPage, lines.length)
    const pageLines = lines.slice(startLine, endLine)

    // Content stream object
    const contentObjectId = objectId++
    contentObjectIds.push(contentObjectId)
    let contentStream = "BT\n"
    contentStream += "/F1 10 Tf\n"
    contentStream += `${margin} ${pageHeight - margin} Td\n`
    contentStream += `${lineHeight} TL\n`

    pageLines.forEach((line) => {
      // Escape special PDF characters
      const escapedLine = line
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[\r\n]+/g, "")
      contentStream += `(${escapedLine}) Tj T*\n`
    })

    contentStream += "ET\n"

    const contentLength = contentStream.length
    objects.push(
      `${contentObjectId} 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}endstream\nendobj\n`,
    )

    // Page object
    const pageObjectId = objectId++
    pageObjectIds.push(pageObjectId)
    objects.push(
      `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectId} 0 R >>\nendobj\n`,
    )
  }

  // Pages object
  const pagesObjectId = 2
  const pagesKids = pageObjectIds.map((id) => `${id} 0 R`).join(" ")
  objects.unshift(`${pagesObjectId} 0 obj\n<< /Type /Pages /Kids [${pagesKids}] /Count ${totalPages} >>\nendobj\n`)

  // Catalog object
  const catalogObjectId = 1
  objects.unshift(`${catalogObjectId} 0 obj\n<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>\nendobj\n`)

  // Build xref table
  const xrefOffsets: number[] = [0]
  let currentOffset = pdfContent.length

  objects.forEach((obj) => {
    xrefOffsets.push(currentOffset)
    pdfContent += obj
    currentOffset += obj.length
  })

  // Add xref table
  const xrefStart = currentOffset
  pdfContent += "xref\n"
  pdfContent += `0 ${xrefOffsets.length}\n`
  xrefOffsets.forEach((offset, i) => {
    if (i === 0) {
      pdfContent += "0000000000 65535 f \n"
    } else {
      pdfContent += offset.toString().padStart(10, "0") + " 00000 n \n"
    }
  })

  // Add trailer
  pdfContent += "trailer\n"
  pdfContent += `<< /Size ${xrefOffsets.length} /Root 1 0 R >>\n`
  pdfContent += "startxref\n"
  pdfContent += `${xrefStart}\n`
  pdfContent += "%%EOF\n"

  return new Blob([pdfContent], { type: "application/pdf" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
