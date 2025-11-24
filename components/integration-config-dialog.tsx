"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { CheckCircle2, Settings, Zap } from 'lucide-react'
import { integrationStore } from "@/lib/integration-store"

interface IntegrationConfigDialogProps {
  integration: {
    id: string
    name: string
    icon: React.ReactNode
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntegrationConfigDialog({ integration, open, onOpenChange }: IntegrationConfigDialogProps) {
  const [syncFrequency, setSyncFrequency] = useState("realtime")
  const [autoLink, setAutoLink] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [config, setConfig] = useState<Record<string, any>>({})

  useEffect(() => {
    if (integration) {
      const backendIntegration = integrationStore.getIntegration(integration.id)
      if (backendIntegration) {
        setConfig(backendIntegration.config)
      }
    }
  }, [integration])

  if (!integration) return null

  const handleSave = () => {
    integrationStore.updateIntegrationConfig(integration.id, {
      syncFrequency,
      autoLink,
      notifications,
      ...config
    })
    toast.success(`${integration.name} settings saved successfully`, {
      description: "Configuration has been updated and will take effect immediately",
    })
    onOpenChange(false)
  }

  const handleTestConnection = async () => {
    toast.info(`Testing connection to ${integration.name}...`)
    const result = await integrationStore.testConnection(integration.id)
    if (result) {
      toast.success("Connection test successful!", {
        description: "All systems operational.",
      })
    } else {
      toast.error("Connection test failed", {
        description: "Please check your configuration.",
      })
    }
  }

  const getIntegrationSpecificConfig = () => {
    switch (integration.id) {
      case "gcal":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Calendar Selection</Label>
              <Select defaultValue={config.calendarSelection || "board"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board Meetings Calendar</SelectItem>
                  <SelectItem value="exec">Executive Committee</SelectItem>
                  <SelectItem value="all">All Calendars</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose which calendars to sync</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-create meeting entries</Label>
                <p className="text-xs text-muted-foreground">Automatically add meetings to audit trail</p>
              </div>
              <Switch checked={config.autoCreateMeetingEntries || true} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync attendee list</Label>
                <p className="text-xs text-muted-foreground">Include meeting participants in records</p>
              </div>
              <Switch checked={config.syncAttendeeList || true} />
            </div>
          </div>
        )
      case "zoom":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Record all board meetings</Label>
                <p className="text-xs text-muted-foreground">Automatically record and save to evidence</p>
              </div>
              <Switch checked={config.recordAllBoardMeetings || true} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Generate transcripts</Label>
                <p className="text-xs text-muted-foreground">AI-powered transcription for all recordings</p>
              </div>
              <Switch checked={config.generateTranscripts || true} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track attendance</Label>
                <p className="text-xs text-muted-foreground">Record join/leave times for governance</p>
              </div>
              <Switch checked={config.trackAttendance || true} />
            </div>
          </div>
        )
      case "slack":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monitored Channels</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">#board-governance</Badge>
                <Badge variant="secondary">#strategic-initiatives</Badge>
                <Badge variant="secondary">#executive-committee</Badge>
                <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                  + Add Channel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Only these channels will be monitored</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Link decision threads</Label>
                <p className="text-xs text-muted-foreground">Auto-detect and link relevant discussions</p>
              </div>
              <Switch checked={config.linkDecisionThreads || true} />
            </div>
          </div>
        )
      case "notion":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace</Label>
              <Select defaultValue={config.workspace || "board"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board Documents</SelectItem>
                  <SelectItem value="exec">Executive Team</SelectItem>
                  <SelectItem value="legal">Legal & Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync attachments</Label>
                <p className="text-xs text-muted-foreground">Include embedded files and images</p>
              </div>
              <Switch checked={config.syncAttachments || true} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track page versions</Label>
                <p className="text-xs text-muted-foreground">Maintain version history for documents</p>
              </div>
              <Switch checked={config.trackPageVersions || true} />
            </div>
          </div>
        )
      case "gdrive":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Synced Folders</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Board Documents</Badge>
                <Badge variant="secondary">Meeting Notes</Badge>
                <Badge variant="secondary">Strategic Plans</Badge>
                <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                  + Add Folder
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>File Types</Label>
              <Select defaultValue={config.fileTypes || "all"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All file types</SelectItem>
                  <SelectItem value="docs">Documents only (PDF, DOCX, etc.)</SelectItem>
                  <SelectItem value="sheets">Spreadsheets only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-time sync</Label>
                <p className="text-xs text-muted-foreground">Sync changes immediately</p>
              </div>
              <Switch checked={config.realTimeSync || true} />
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>No specific configuration available for this integration</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {integration.icon}
            {integration.name} Configuration
          </DialogTitle>
          <DialogDescription>Configure how {integration.name} integrates with your governance system</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-4">
            {/* Connection Status */}
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-5 text-success" />
                <span className="font-medium text-success">Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {integration.name} is successfully connected to your governance system
              </p>
              <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={handleTestConnection}>
                <Zap className="size-4 mr-2" />
                Test Connection
              </Button>
            </div>

            {/* Integration-specific settings */}
            {getIntegrationSpecificConfig()}

            {/* General Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">General Settings</h4>
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-link to decisions</Label>
                  <p className="text-xs text-muted-foreground">Automatically connect data to relevant items</p>
                </div>
                <Switch checked={autoLink} onCheckedChange={setAutoLink} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when new data is synced</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" value="sk_live_••••••••••••••••" disabled />
                <p className="text-xs text-muted-foreground">API credentials are securely stored and encrypted</p>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.webhookUrl || "https://api.oath.governance/webhooks/gcal/abc123"}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(config.webhookUrl || "https://api.oath.governance/webhooks/gcal/abc123")
                      toast.success("Webhook URL copied to clipboard")
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Retention</Label>
                <Select defaultValue={config.dataRetention || "forever"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forever">Keep all data</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="2years">2 years</SelectItem>
                    <SelectItem value="5years">5 years</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">How long to retain synced data</p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm">
                  Disconnect {integration.name}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will stop syncing data but won't delete existing records
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Settings className="size-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
