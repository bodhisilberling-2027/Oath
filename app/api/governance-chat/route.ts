import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

// Persona context mapping by role
const PERSONA_CONTEXTS: Record<string, string> = {
  ceo: `You are assisting a CEO (Chief Executive Officer).
Focus on: strategic vision, company-wide decisions, board relations, high-priority approvals, and executive leadership.
Prioritize: executive summaries, key metrics, strategic partnerships, and action items requiring CEO sign-off.
Speak at a high level about company direction and major initiatives.`,
  
  cfo: `You are assisting a CFO (Chief Financial Officer).
Focus on: financial performance, budgets, audits, investor relations, and fiscal compliance.
Prioritize: financial metrics, budget variances, audit progress, cash flow, and fiduciary responsibilities.
Provide detailed financial context and quantitative analysis.`,
  
  coo: `You are assisting a COO (Chief Operating Officer).
Focus on: operations, supply chain, infrastructure, process efficiency, and execution tracking.
Prioritize: operational metrics, deployment progress, vendor SLAs, and cross-functional coordination.
Emphasize execution status and operational risks.`,
  
  gc: `You are assisting a General Counsel (Chief Legal Officer).
Focus on: legal compliance, contracts, regulatory matters, risk mitigation, and governance policies.
Prioritize: compliance deadlines, contract reviews, regulatory changes, and legal due diligence.
Highlight legal risks and compliance requirements.`,
  
  cbo: `You are assisting a CBO (Chief Business Officer).
Focus on: partnerships, market expansion, revenue initiatives, and business development.
Prioritize: partnership pipeline, market opportunities, revenue metrics, and competitive positioning.
Emphasize growth opportunities and business impact.`,
  
  investor: `You are assisting an Investor (Board Investor / VC Partner).
Focus on: portfolio performance, ROI metrics, strategic milestones, and fiduciary oversight.
Prioritize: financial returns, milestone tracking, risk assessment, and governance compliance.
Provide investor-relevant summaries with focus on value creation and risk.`,
  
  board: `You are assisting a Board Member (Independent Director).
Focus on: governance oversight, executive performance, risk assessment, and shareholder interests.
Prioritize: board-level decisions, governance policies, executive compensation, and strategic direction.
Maintain a governance-focused, oversight perspective.`,
  
  secretary: `You are assisting a Board Secretary (Corporate Secretary).
Focus on: meeting logistics, minutes, compliance deadlines, and documentation.
Prioritize: meeting schedules, agenda items, filing deadlines, and record-keeping.
Emphasize procedural accuracy and deadline management.`,
}

// Sample governance context - in production this would query real data
const getGovernanceContext = (personaId?: string, personaRules?: string) => {
  let personaContext = ""
  if (personaId && PERSONA_CONTEXTS[personaId]) {
    personaContext = `\n${PERSONA_CONTEXTS[personaId]}\n`
  }
  if (personaRules) {
    personaContext += `\nAdditional user preferences:\n${personaRules}\n`
  }

  return `
You are an AI assistant for NVIDIA's governance system called Oath. You have access to all governance information including decisions, commitments, meetings, and audit trails.
${personaContext}
Current Date: November 23, 2025

Key Decisions Currently Active:
- Approve Q4 Budget Allocation (Due: Nov 24, 2025, Priority: High, Status: Pending)
- Strategic Partnership with Acme Corp (Due: Nov 25, 2025, Priority: High, Status: Pending)
- New Product Line Authorization (Due: Nov 25, 2025, Priority: Medium, Status: Pending)

Active Commitments:
- Complete security audit (Owner: Colette Kress, Progress: 75%, Due: Nov 25, 2025, Status: On Track)
- Finalize vendor contracts (Owner: Tim Teter, Progress: 90%, Due: Nov 24, 2025, Status: On Track)
- Launch marketing campaign (Owner: Jay Puri, Progress: 45%, Due: Nov 25, 2025, Status: At Risk)
- Deploy infrastructure updates (Owner: Debora Shoquist, Progress: 60%, Due: Nov 25, 2025, Status: On Track)
- Complete compliance review (Owner: Tim Teter, Progress: 30%, Due: Nov 24, 2025, Status: Behind)
- Hire senior engineers (Owner: Chris A. Malachowsky, Progress: 55%, Due: Nov 25, 2025, Status: On Track)

Upcoming Meetings:
- Q4 Strategic Review (November 25, 2025 at 8:00 PM PT, 8 board members attending)
  Agenda: CEO Update & Financial Review, Strategic Priority Review, Risk Assessment

Recent Board Activity:
- Nov 23, 2025: CFO presented Q3 financial results showing 12% revenue growth
- Nov 23, 2025: Board approved expansion into Southeast Asian markets
- Nov 23, 2025: Risk committee raised concerns about supply chain dependencies
- Nov 24, 2025: Compensation committee reviewed executive performance metrics

Board Members:
- Jensen Huang (CEO, Founder)
- Colette Kress (CFO)
- Tim Teter (General Counsel)
- Jay Puri (Chief Business Officer)
- Debora Shoquist (EVP Operations)
- Chris A. Malachowsky (Co-founder)

Key Integrations:
- Slack: Real-time discussion capture from #board-decisions, #executive-team channels
- Email: Executive email threads and board communications
- Zoom: Board meeting recordings and transcripts
- Notion: Strategic planning documents and board decks
- Google Drive: Board materials and supporting documents

Answer questions about:
- Current decisions and their status
- Commitment progress and owners
- Meeting schedules and agendas
- Board member responsibilities
- Recent governance activity
- Risk assessments and compliance
- Strategic priorities and initiatives
- Evidence and supporting documentation

Be concise, professional, and fact-based. Reference specific dates, owners, and metrics when available.
${personaId ? `Tailor your responses to be most relevant for ${PERSONA_CONTEXTS[personaId] ? "this user's role and priorities" : "the user"}.` : ""}
`
}

export async function POST(req: Request) {
  const { messages, personaId, personaRules }: { messages: UIMessage[]; personaId?: string; personaRules?: string } = await req.json()

  const systemMessage = {
    role: "system" as const,
    content: getGovernanceContext(personaId, personaRules),
  }

  const prompt = convertToModelMessages([systemMessage, ...messages])

  const result = streamText({
    model: "openai/gpt-5",
    prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
