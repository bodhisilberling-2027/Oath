"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, UserPlus } from "lucide-react"
import { toast } from "sonner"

interface BoardMember {
  id: string
  name: string
  role: string
  company?: string
  initials: string
  status: "active" | "absent"
}

interface BoardMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BoardMembersDialog({ open, onOpenChange }: BoardMembersDialogProps) {
  const boardMembers: BoardMember[] = [
    {
      id: "1",
      name: "Jensen Huang",
      role: "Co-founder, President and Chief Executive Officer",
      initials: "JH",
      status: "active",
    },
    {
      id: "2",
      name: "Rob Burgess",
      role: "Independent Consultant",
      initials: "RB",
      status: "active",
    },
    {
      id: "3",
      name: "Tench Coxe",
      role: "Former Managing Director, Sutter Hill Ventures",
      initials: "TC",
      status: "active",
    },
    {
      id: "4",
      name: "John O. Dabiri",
      role: "Centennial Professor, California Institute of Technology",
      company: "Aeronautics and Mechanical Engineering",
      initials: "JD",
      status: "active",
    },
    {
      id: "5",
      name: "Persis S. Drell",
      role: "Professor and Former Provost, Stanford University",
      company: "Materials Science and Engineering",
      initials: "PD",
      status: "active",
    },
    {
      id: "6",
      name: "Dawn Hudson",
      role: "Former Chief Marketing Officer, National Football League",
      initials: "DH",
      status: "active",
    },
    {
      id: "7",
      name: "Harvey C. Jones",
      role: "Managing Partner, Square Wave Ventures",
      initials: "HJ",
      status: "active",
    },
    {
      id: "8",
      name: "Melissa B. Lora",
      role: "Former President, Taco Bell International",
      initials: "ML",
      status: "active",
    },
    {
      id: "9",
      name: "Stephen C. Neal",
      role: "Chairman Emeritus and Senior Counsel, Cooley LLP",
      initials: "SN",
      status: "active",
    },
    {
      id: "10",
      name: "A. Brooke Seawell",
      role: "Venture Partner, New Enterprise Associates",
      initials: "BS",
      status: "active",
    },
    {
      id: "11",
      name: "Aarti Shah",
      role: "Former SVP & Chief Information Officer, Eli Lilly",
      initials: "AS",
      status: "active",
    },
    {
      id: "12",
      name: "Mark A. Stevens",
      role: "Managing Partner, S-Cubed Capital",
      initials: "MS",
      status: "active",
    },
  ]

  const activeMembers = boardMembers.filter((m) => m.status === "active")
  const absentMembers = boardMembers.filter((m) => m.status === "absent")

  const handleAddMember = () => {
    toast.success("Opening add member form...", {
      description: "You can invite new board members and assign roles",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Users className="size-5" />
                NVIDIA Board of Directors
              </DialogTitle>
              <DialogDescription>{activeMembers.length} board members</DialogDescription>
            </div>
            <Button size="sm" onClick={handleAddMember}>
              <UserPlus className="size-4 mr-2" />
              Add Member
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Active Members */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{member.name}</h4>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Briefcase className="size-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{member.role}</span>
                        </div>
                        {member.company && <p className="text-xs text-muted-foreground pl-5">{member.company}</p>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
