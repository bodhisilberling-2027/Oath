"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronLeft,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  SkipForward,
  Circle,
  CheckCircle,
  Download,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AgendaItem {
  id: string
  title: string
  presenter: string
  duration: number
  status: "pending" | "in-progress" | "completed"
  votingRequired: boolean
  votes?: {
    approve: number
    reject: number
    abstain: number
  }
}

interface Attendee {
  id: string
  name: string
  role: string
  status: "joined" | "away" | "offline"
  hasVoted?: boolean
}

interface MeetingNote {
  id: string
  timestamp: string
  author: string
  content: string
  type: "note" | "action" | "decision"
}

export function LiveMeeting({ onBack }: { onBack: () => void }) {
  const [meetingStatus, setMeetingStatus] = useState<"waiting" | "active" | "paused" | "ended">("active")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [newNote, setNewNote] = useState("")
  const [autoTranscriptEnabled, setAutoTranscriptEnabled] = useState(true)

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    {
      id: "1",
      title: "CEO Update & Financial Review",
      presenter: "Jensen Huang, Chairman & CEO",
      duration: 15,
      status: "completed",
      votingRequired: false,
    },
    {
      id: "2",
      title: "Q4 Budget Allocation Approval",
      presenter: "Colette Kress, CFO",
      duration: 20,
      status: "in-progress",
      votingRequired: true,
      votes: { approve: 5, reject: 1, abstain: 0 },
    },
    {
      id: "3",
      title: "Strategic Partnership Decision",
      presenter: "Jay Puri, EVP Worldwide Field Operations",
      duration: 25,
      status: "pending",
      votingRequired: true,
    },
    {
      id: "4",
      title: "Risk Assessment Review",
      presenter: "Tim Teter, General Counsel",
      duration: 15,
      status: "pending",
      votingRequired: false,
    },
  ])

  const attendees: Attendee[] = [
    { id: "1", name: "Jensen Huang", role: "Chairman & CEO", status: "joined", hasVoted: true },
    { id: "2", name: "Colette Kress", role: "CFO", status: "joined", hasVoted: true },
    { id: "3", name: "Tench Coxe", role: "Lead Independent Director", status: "joined", hasVoted: false },
    { id: "4", name: "Mark A. Stevens", role: "Board Member", status: "joined", hasVoted: true },
    { id: "5", name: "Harvey C. Jones", role: "Board Member", status: "joined", hasVoted: true },
    { id: "6", name: "Dawn Hudson", role: "Board Member", status: "away", hasVoted: false },
    { id: "7", name: "Aarti Shah", role: "Board Member", status: "joined", hasVoted: true },
    { id: "8", name: "A. Brooke Seawell", role: "Board Member", status: "joined", hasVoted: true },
  ]

  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    {
      id: "1",
      timestamp: "8:05 PM",
      author: "Jensen Huang",
      content: "Q4 revenue exceeded projections by 12%. Key driver: Enterprise segment growth.",
      type: "note",
    },
    {
      id: "2",
      timestamp: "8:12 PM",
      author: "Colette Kress",
      content: "Motion to approve Q4 budget allocation of $2.5M for product development.",
      type: "decision",
    },
    {
      id: "3",
      timestamp: "8:15 PM",
      author: "Auto-generated",
      content: "Action Item: Tim Teter to review vendor contracts by Dec 5th.",
      type: "action",
    },
  ])

  const autoSummary = {
    keyPoints: [
      "Q4 revenue exceeded projections by 12%",
      "Budget allocation of $2.5M proposed for product development",
      "Strategic partnership with Acme Corp under discussion",
      "Risk assessment shows moderate exposure in supply chain",
    ],
    decisions: [
      {
        title: "Q4 Budget Allocation",
        status: "approved",
        votes: "6-1-0",
      },
    ],
    actionItems: [
      {
        owner: "Tim Teter",
        task: "Review vendor contracts",
        deadline: "Dec 5th",
      },
      {
        owner: "Debora Shoquist",
        task: "Complete risk mitigation plan",
        deadline: "Dec 15th",
      },
    ],
  }

  const handleVote = (agendaId: string, voteType: "approve" | "reject" | "abstain") => {
    setAgendaItems(
      agendaItems.map((item) => {
        if (item.id === agendaId && item.votes) {
          return {
            ...item,
            votes: {
              ...item.votes,
              [voteType]: item.votes[voteType] + 1,
            },
          }
        }
        return item
      }),
    )
    toast.success(`Vote recorded: ${voteType}`)
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: MeetingNote = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      author: "You",
      content: newNote,
      type: "note",
    }

    setMeetingNotes([...meetingNotes, note])
    setNewNote("")
    toast.success("Note added to meeting minutes")
  }

  const handleNextAgenda = () => {
    const currentIndex = agendaItems.findIndex((item) => item.status === "in-progress")
    if (currentIndex !== -1) {
      setAgendaItems(
        agendaItems.map((item, index) => {
          if (index === currentIndex) {
            return { ...item, status: "completed" as const }
          }
          if (index === currentIndex + 1) {
            return { ...item, status: "in-progress" as const }
          }
          return item
        }),
      )
      toast.success("Moved to next agenda item")
    }
  }

  const attendeesJoined = attendees.filter((a) => a.status === "joined").length
  const totalAttendees = attendees.length
  const currentAgenda = agendaItems.find((item) => item.status === "in-progress")
  const completedItems = agendaItems.filter((item) => item.status === "completed").length

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
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">Q4 Strategic Review</h1>
                    <Badge variant="destructive" className="animate-pulse">
                      <Circle className="size-2 fill-current mr-1.5" />
                      LIVE
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">November 10, 2025 • Started at 8:00 PM PT</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Users className="size-3" />
                {attendeesJoined}/{totalAttendees} joined
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Meeting recording saved and exported")
                }}
              >
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setMeetingStatus("ended")
                  toast.success("Meeting ended. Recording and transcript saved to audit trail.")
                  setTimeout(() => onBack(), 1500)
                }}
              >
                End Meeting
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Grid */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {attendees.slice(0, 6).map((attendee) => (
                    <div
                      key={attendee.id}
                      className={cn(
                        "relative aspect-video rounded-lg bg-muted overflow-hidden border-2 transition-all",
                        attendee.status === "joined" ? "border-success/30" : "border-border",
                      )}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Avatar className="size-16">
                          <AvatarFallback className="text-lg">
                            {attendee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={attendee.status === "joined" ? "default" : "secondary"} className="text-xs">
                            {attendee.name.split(" ")[0]}
                          </Badge>
                          {attendee.status !== "joined" && (
                            <Badge variant="outline" className="text-xs">
                              {attendee.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meeting Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </Button>
                  <Button
                    variant={isVideoOff ? "destructive" : "outline"}
                    size="icon"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Agenda & Voting */}
            {currentAgenda && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Current: {currentAgenda.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Presented by {currentAgenda.presenter} • {currentAgenda.duration} min
                      </CardDescription>
                    </div>
                    <Button onClick={handleNextAgenda}>
                      <SkipForward className="size-4 mr-2" />
                      Next Item
                    </Button>
                  </div>
                </CardHeader>
                {currentAgenda.votingRequired && currentAgenda.votes && (
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Live Voting</p>
                          <Badge variant="outline">
                            {currentAgenda.votes.approve + currentAgenda.votes.reject + currentAgenda.votes.abstain} /{" "}
                            {attendeesJoined} votes
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-success">Approve</span>
                                <span className="font-mono">{currentAgenda.votes.approve}</span>
                              </div>
                              <Progress value={(currentAgenda.votes.approve / attendeesJoined) * 100} className="h-2" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-destructive">Reject</span>
                                <span className="font-mono">{currentAgenda.votes.reject}</span>
                              </div>
                              <Progress
                                value={(currentAgenda.votes.reject / attendeesJoined) * 100}
                                className="h-2 [&>div]:bg-destructive"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Abstain</span>
                                <span className="font-mono">{currentAgenda.votes.abstain}</span>
                              </div>
                              <Progress
                                value={(currentAgenda.votes.abstain / attendeesJoined) * 100}
                                className="h-2 [&>div]:bg-muted-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-success/30 hover:bg-success/10 bg-transparent"
                          onClick={() => handleVote(currentAgenda.id, "approve")}
                        >
                          <ThumbsUp className="size-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-destructive/30 hover:bg-destructive/10 bg-transparent"
                          onClick={() => handleVote(currentAgenda.id, "reject")}
                        >
                          <ThumbsDown className="size-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleVote(currentAgenda.id, "abstain")}
                        >
                          Abstain
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Meeting Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meeting Minutes</CardTitle>
                    <CardDescription className="mt-1">
                      {autoTranscriptEnabled && (
                        <span className="flex items-center gap-1.5">Auto-transcription active</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAutoTranscriptEnabled(!autoTranscriptEnabled)}>
                    {autoTranscriptEnabled ? "Disable" : "Enable"} Auto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {meetingNotes.map((note) => (
                      <div key={note.id} className="flex gap-3">
                        <Badge
                          variant={
                            note.type === "decision" ? "default" : note.type === "action" ? "secondary" : "outline"
                          }
                          className="h-fit"
                        >
                          {note.type}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{note.author}</span>
                            <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note to the minutes..."
                      className="min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleAddNote()
                        }
                      }}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <MessageSquare className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agenda Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agenda</CardTitle>
                <CardDescription>
                  {completedItems} of {agendaItems.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agendaItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                        item.status === "in-progress" && "bg-accent/10 border-accent/30",
                        item.status === "completed" && "bg-success/5 border-success/30",
                        item.status === "pending" && "bg-card border-border",
                      )}
                    >
                      <div className="mt-0.5">
                        {item.status === "completed" && <CheckCircle className="size-5 text-success" />}
                        {item.status === "in-progress" && <Circle className="size-5 text-accent fill-accent" />}
                        {item.status === "pending" && <Circle className="size-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight mb-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.presenter}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="size-3 mr-1" />
                            {item.duration}m
                          </Badge>
                          {item.votingRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Vote Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendees</CardTitle>
                <CardDescription>
                  {attendeesJoined} joined • {attendees.filter((a) => a.status === "away").length} away
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            attendee.status === "joined" && "bg-success",
                            attendee.status === "away" && "bg-warning",
                            attendee.status === "offline" && "bg-muted-foreground",
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground">{attendee.role}</p>
                        </div>
                      </div>
                      {attendee.hasVoted !== undefined && currentAgenda?.votingRequired && (
                        <Badge variant={attendee.hasVoted ? "default" : "outline"} className="text-xs">
                          {attendee.hasVoted ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Transcription */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Transcription</CardTitle>
                    <CardDescription>
                      {autoTranscriptEnabled && (
                        <span className="flex items-center gap-1.5">Auto-transcription active</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAutoTranscriptEnabled(!autoTranscriptEnabled)}>
                    {autoTranscriptEnabled ? "Disable" : "Enable"} Auto
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Meeting Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Meeting Summary</CardTitle>
                <CardDescription>Real-time insights and key takeaways</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMeeting
