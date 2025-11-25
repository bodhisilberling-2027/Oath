"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, Loader2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMyOathStore, PERSONAS, generatePersonaContext } from "@/lib/my-oath-store"

interface GovernanceChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GovernanceChatDialog({ open, onOpenChange }: GovernanceChatDialogProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { selectedPersona, rules } = useMyOathStore()
  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona)
  const personaRulesContext = selectedPersona ? generatePersonaContext(selectedPersona, rules) : undefined

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ 
      api: "/api/governance-chat",
      body: {
        personaId: selectedPersona,
        personaRules: personaRulesContext,
      },
    }),
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "in_progress") return

    sendMessage({ text: input })
    setInput("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Ask About Governance</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions about decisions, commitments, meetings, and board activity
              </p>
            </div>
            {currentPersona && (
              <Badge variant="outline" className="py-1.5 px-3">
                <User className="size-3 mr-2" />
                {currentPersona.title}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Ask me anything about what's happening at the company</p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 bg-transparent"
                    onClick={() => {
                      setInput("What decisions are pending approval?")
                    }}
                  >
                    What decisions are pending approval?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 bg-transparent"
                    onClick={() => {
                      setInput("Which commitments are at risk or behind schedule?")
                    }}
                  >
                    Which commitments are at risk or behind schedule?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 bg-transparent"
                    onClick={() => {
                      setInput("What's on the agenda for the next board meeting?")
                    }}
                  >
                    What's on the agenda for the next board meeting?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 bg-transparent"
                    onClick={() => {
                      setInput("Who owns the security audit commitment?")
                    }}
                  >
                    Who owns the security audit commitment?
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2.5 max-w-[80%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}

            {status === "in_progress" && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="rounded-lg px-4 py-2.5 bg-muted">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about decisions, commitments, meetings..."
              disabled={status === "in_progress"}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || status === "in_progress"}>
              {status === "in_progress" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
