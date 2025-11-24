// Shared types and utilities for AI functionality

export interface AnalyzeRequest {
  mode: "decision-review" | "audit-query"
  decision?: {
    id: string
    title: string
    description?: string
    dueDate?: string
    priority?: string
  }
  question?: string
  auditEvents?: Array<any>
}

export interface StreamingResponse {
  text: string
  done: boolean
}

// Demo mode responses for when no API key is available
export const DEMO_RESPONSES = {
  "decision-review": `### Summary

• This decision allocates $2.5M towards Q4 product development initiatives, representing a strategic investment in NVIDIA's core technology roadmap
• The budget approval enables accelerated development cycles and positions the company to maintain competitive advantage in key market segments

### Commitments

**Security Audit Completion**
• Owner: Colette Kress (CFO)
• Due: 2025-12-20
• Deliverable: Comprehensive security assessment and penetration testing results

**Infrastructure Scaling**
• Owner: Debora Shoquist (EVP Operations)
• Due: 2026-01-15
• Deliverable: Cloud infrastructure capacity increased by 40% to support development velocity

**Quarterly Review Checkpoint**
• Owner: Jay Puri (EVP Worldwide Field Operations)
• Due: 2026-02-28
• Deliverable: Progress report on budget utilization and key milestones

### Risks & Questions

**Budget Overrun Risk**: Historical data shows Q4 development projects tend to exceed initial estimates by 15-20%. Recommend establishing a contingency reserve of $375K (15% buffer)

**Resource Allocation Conflict**: The proposed timeline overlaps with existing infrastructure projects. Board should clarify prioritization between initiatives

**Vendor Dependencies**: Success depends on third-party security audit completion. Consider identifying backup vendors to mitigate schedule risk

**Regulatory Compliance**: New data center capacity may trigger additional compliance requirements in EU regions. Legal review recommended before final approval`,

  "audit-query": `Based on the audit trail data, I've identified the following insights:

**High Priority Items:**

1. **Security Audit Commitment** (Owner: Colette Kress)
   - Status: On-track at 75% completion
   - Recent activity: Penetration testing phase initiated (Dec 10)
   - Risk level: Low - progressing as planned

2. **Strategic Partnership Decision** (Owner: Jay Puri)
   - Status: Pending board approval
   - Due: 2025-12-18
   - Risk level: Medium - awaiting final review

**Recent Integration Activity:**

- Google Calendar synced Q4 Strategic Review meeting (Dec 18, 09:45 AM)
- Zoom uploaded meeting recording and transcript (Dec 18, 11:30 AM)
- Notion imported Security Assessment Report (Dec 1)
- Slack linked discussion thread from #board-governance channel

**Recommendations:**

The audit trail shows healthy integration activity with 5 external systems providing automated governance data. All commitments are tracking on schedule with regular progress updates from executive owners.`,
}

// Stream demo response word by word for realistic effect
export async function* streamDemoResponse(mode: "decision-review" | "audit-query"): AsyncGenerator<string> {
  const text = DEMO_RESPONSES[mode]
  const words = text.split(" ")

  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 20))
    yield words[i] + (i < words.length - 1 ? " " : "")
  }
}
