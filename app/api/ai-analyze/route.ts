import type { NextRequest } from "next/server"
import { type AnalyzeRequest, streamDemoResponse } from "@/lib/ai"

export const runtime = "edge"

const SYSTEM_PROMPTS = {
  "decision-review": `You are Oath AI, an intelligent governance assistant helping corporate boards and executives make better decisions.

When reviewing a decision, provide your analysis in the following markdown format:

### Summary
• Brief 1-2 bullet points summarizing the decision and its strategic implications

### Commitments
List 3-6 concrete commitments that should result from this decision. For each commitment include:
**[Commitment Title]**
• Owner: [Executive name and title]
• Due: [Realistic date based on decision timeline]
• Deliverable: [Specific, measurable outcome]

### Risks & Questions
Identify 2-4 risks or questions the board should track:
**[Risk Title]**: [Detailed explanation of the risk and recommended mitigation]

Be specific, actionable, and focused on governance best practices. Reference the decision details provided.`,

  "audit-query": `You are Oath AI, an intelligent governance assistant with access to the complete audit trail of decisions, commitments, meetings, and evidence.

When answering questions about the audit trail:
1. First analyze the provided audit events and their relationships
2. Identify relevant items based on the user's question
3. Provide a clear, structured response with specific details (dates, owners, statuses)
4. Include recommendations when appropriate

Format your response clearly with headers and bullet points. Be specific and reference actual events from the audit trail.`,

  ingestion: `You are Oath AI, a governance extraction system that analyzes unstructured communication and extracts structured governance data.

Given source content (Slack threads, emails, or board deck summaries), extract and format the following:

### Extracted Decisions
List all decisions that require or have received approval:
**[Decision Title]**
• Priority: [high/medium/low]
• Due Date: [YYYY-MM-DD]
• Owner: [Name and title]
• Context: [Brief explanation]

### Extracted Commitments
List all commitments, action items, or deliverables mentioned:
**[Commitment Title]**
• Owner: [Name and title]
• Due Date: [YYYY-MM-DD]
• Status: [on-track/at-risk/behind based on context]
• Progress: [estimate 0-100%]
• Description: [What needs to be delivered]

### Extracted Owners & Responsibilities
• [Name]: [List of their responsibilities mentioned]

### Identified Risks
List risks, concerns, or blockers mentioned:
**[Risk Title]**: [Description and potential impact]

Be specific, extract actual names and dates from the content, and maintain the hierarchical structure.`,
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { mode, decision, question, auditEvents, content, sourceType } = body

    console.log("[v0] AI Analyze API called", {
      mode,
      decision: decision?.title,
      question: !!question,
      content: !!content,
    })

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Demo mode - stream a canned response
      console.log("[v0] No API key found, using demo mode")

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          if (mode === "ingestion") {
            const demoResponse = `### Extracted Decisions

**Partnership Due Diligence Review**
• Priority: high
• Due Date: 2025-11-25
• Owner: Tim Teter, General Counsel
• Context: Legal and financial review required for Acme Corp partnership deal

**Q1 2026 Strategic Initiatives Approval**
• Priority: high  
• Due Date: 2025-11-24
• Owner: Jensen Huang, CEO
• Context: Board approval needed for AI infrastructure expansion, healthcare market entry, and sustainability initiative

**Next-Gen GPU Architecture R&D Investment**
• Priority: high
• Due Date: 2025-11-24
• Owner: Jensen Huang & Chris Malachowsky
• Context: $2.5B investment approval for Blackwell successor development

### Extracted Commitments

**Legal Assessment for Partnership**
• Owner: Tim Teter, General Counsel
• Due Date: 2025-11-23
• Status: on-track
• Progress: 65%
• Description: Deliver legal assessment covering IP ownership and data privacy compliance

**Financial Due Diligence**
• Owner: Colette Kress, CFO  
• Due Date: 2025-11-23
• Status: at-risk
• Progress: 40%
• Description: Review partner's financial projections and burn rate analysis with risk assessment

**Security Audit Completion**
• Owner: Colette Kress, CFO
• Due Date: 2025-11-25
• Status: on-track
• Progress: 75%
• Description: Complete comprehensive security audit as committed in previous board meeting

**AI Infrastructure Expansion Launch**
• Owner: Chris Malachowsky, NVIDIA Fellow
• Due Date: 2025-11-25
• Status: on-track
• Progress: 20%
• Description: Launch $50M AI infrastructure expansion project

**Healthcare AI Partnership Execution**
• Owner: Colette Kress (business) & Tim Teter (legal)
• Due Date: 2025-11-25
• Status: on-track
• Progress: 10%
• Description: Establish partnerships with 3 major hospital systems and obtain FDA compliance

### Extracted Owners & Responsibilities

• **Jensen Huang (CEO)**: Strategic priorities approval, AI infrastructure expansion, next-gen GPU investment decision
• **Tim Teter (General Counsel)**: Partnership legal review, IP ownership analysis, healthcare AI legal compliance
• **Colette Kress (CFO)**: Financial due diligence, security audit, healthcare AI business development
• **Jay Puri (EVP Field Ops)**: Market assessment for partnership, strategic AI partnerships authorization ($500M)
• **Debora Shoquist (EVP Operations)**: Sustainability initiative ($25M green infrastructure), operations integration support
• **Chris Malachowsky (NVIDIA Fellow)**: AI infrastructure expansion, next-gen GPU architecture development

### Identified Risks

**High Partner Burn Rate**: Acme Corp showing 300% YoY growth but concerning burn rate. If partner fails, impacts NVIDIA Q1 pipeline with potential loss of 15 enterprise accounts.

**Integration Timeline Pressure**: 60-day integration timeline for partnership may be aggressive given complexity of operations alignment.

**Competitive AI Compute Pressure**: Risk of competitors catching up in AI compute performance if R&D investment delayed or insufficient.

**Regulatory Compliance Complexity**: Healthcare AI initiative requires FDA approval with 6-9 month timeline - regulatory hurdles could delay market entry and partnership activation.

**Supply Chain Constraints**: Asia-Pacific supply chain constraints identified as ongoing risk factor for operations.

**EU Regulatory Scrutiny**: Increased regulatory attention in European markets may impact expansion plans and partnership structures.`

            // Stream the demo response word by word
            const words = demoResponse.split(" ")
            for (let i = 0; i < words.length; i++) {
              controller.enqueue(encoder.encode(words[i] + " "))
              await new Promise((resolve) => setTimeout(resolve, 30))
            }
          } else {
            // Existing demo mode logic for other modes
            controller.enqueue(encoder.encode("🔮 **Demo Mode** - Using simulated AI response\n\n"))
            for await (const chunk of streamDemoResponse(mode)) {
              controller.enqueue(encoder.encode(chunk))
            }
          }

          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      })
    }

    // Real OpenAI API call
    console.log("[v0] Using OpenAI API")

    let userMessage = ""

    if (mode === "decision-review" && decision) {
      userMessage = `Please review the following decision:

**Title:** ${decision.title}
**Due Date:** ${decision.dueDate}
**Priority:** ${decision.priority}
${decision.description ? `**Description:** ${decision.description}` : ""}

**Context:** This decision is part of NVIDIA Corporation's board governance process. The decision has supporting documents including budget analysis and financial projections.

Provide your analysis following the required format.`
    } else if (mode === "audit-query" && question) {
      userMessage = `The user asks: "${question}"

Here is the current audit trail data (${auditEvents?.length || 0} events):

${JSON.stringify(auditEvents, null, 2)}

Please analyze this data and answer the user's question.`
    } else if (mode === "ingestion" && content) {
      userMessage = `Please extract governance data from the following ${sourceType} content:

${content}

Extract all decisions, commitments, owners, and risks following the required format. Be specific and use actual names, dates, and details from the content.`
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[mode] },
          { role: "user", content: userMessage },
        ],
        temperature: 0,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    // Stream the response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const json = JSON.parse(data)
                  const content = json.choices[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  // Skip parsing errors
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("[v0] AI Analyze error:", error)
    return new Response(JSON.stringify({ error: "Failed to analyze" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
