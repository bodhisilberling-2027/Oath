"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react'
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { integrationStore } from "@/lib/integration-store"

interface IntegrationLogsDialogProps {
  integration: {
    id: string
    name: string
    icon: React.ReactNode
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface LogEntry {
  id: string
  timestamp: string
  type: "success" | "info" | "warning" | "error"
  action: string
  details: string
  dataCount?: number
}

export function IntegrationLogsDialog({ integration, open, onOpenChange }: IntegrationLogsDialogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (integration && open) {
      loadLogs()
    }
  }, [integration, open])

  const loadLogs = () => {
    if (!integration) return
    const backendLogs = integrationStore.getLogs(integration.id)
    setLogs(backendLogs.map(log => ({
      id: log.id,
      timestamp: new Date(log.timestamp).toLocaleString(),
      type: log.type,
      action: log.action,
      details: log.details,
      dataCount: log.dataCount
    })))
  }

  if (!integration) return null

  const successLogs = logs.filter((l) => l.type === "success")
  const errorLogs = logs.filter((l) => l.type === "error")
  const warningLogs = logs.filter((l) => l.type === "warning")

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="size-4 text-success" />
      case "error":
        return <AlertCircle className="size-4 text-destructive" />
      case "warning":
        return <AlertCircle className="size-4 text-warning" />
      default:
        return <Clock className="size-4 text-muted-foreground" />
    }
  }

  const handleExportLogs = () => {
    const logsText = integrationStore.exportLogs(integration.id)
    const blob = new Blob([logsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${integration.name.replace(/\s+/g, "_")}_logs_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Logs exported successfully", {
      description: `${integration.name} sync logs have been downloaded`,
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    toast.info("Refreshing logs...", {
      description: "Fetching latest sync activity",
    })
    // Trigger manual sync
    integrationStore.manualSync(integration.id)
    setTimeout(() => {
      loadLogs()
      setIsLoading(false)
      toast.success("Logs refreshed")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {integration.icon}
            {integration.name} Sync Logs
          </DialogTitle>
          <DialogDescription>View detailed synchronization history and activity logs</DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-success" />
              <span className="text-xs font-medium text-success">Success</span>
            </div>
            <p className="text-2xl font-semibold">{successLogs.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="size-4 text-warning" />
              <span className="text-xs font-medium text-warning">Warnings</span>
            </div>
            <p className="text-2xl font-semibold">{warningLogs.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="size-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Errors</span>
            </div>
            <p className="text-2xl font-semibold">{errorLogs.length}</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Logs ({logs.length})</TabsTrigger>
              <TabsTrigger value="success">Success ({successLogs.length})</TabsTrigger>
              <TabsTrigger value="errors">Errors ({errorLogs.length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className="size-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="size-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <ScrollArea className="h-[400px] rounded-lg border p-4">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="mt-0.5">{getLogIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.action}</span>
                          <Badge variant="outline" className={cn("text-xs", `bg-${log.type}/5`)}>
                            {log.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      {log.dataCount && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {log.dataCount} items processed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="success">
            <ScrollArea className="h-[400px] rounded-lg border p-4">
              <div className="space-y-4">
                {successLogs.length > 0 ? (
                  successLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <div className="mt-0.5">{getLogIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{log.action}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                        {log.dataCount && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {log.dataCount} items processed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="size-12 mx-auto mb-4 opacity-20" />
                    <p>No successful operations recorded</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors">
            <ScrollArea className="h-[400px] rounded-lg border p-4">
              {errorLogs.length > 0 ? (
                <div className="space-y-4">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <div className="mt-0.5">{getLogIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{log.action}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="size-12 mx-auto mb-4 text-success opacity-20" />
                  <p className="font-medium mb-1">No errors found</p>
                  <p className="text-sm">All sync operations completed successfully</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
