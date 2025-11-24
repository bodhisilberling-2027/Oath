interface Integration {
  id: string
  name: string
  status: "connected" | "disconnected" | "error"
  lastSync?: string
  dataPoints: number
  config: Record<string, any>
}

interface IntegrationData {
  id: string
  integrationId: string
  type: string
  data: any
  timestamp: string
  linkedTo?: string
}

interface SyncLog {
  id: string
  integrationId: string
  timestamp: string
  type: "success" | "info" | "warning" | "error"
  action: string
  details: string
  dataCount?: number
}

class IntegrationStore {
  private integrations: Map<string, Integration> = new Map()
  private data: IntegrationData[] = []
  private logs: SyncLog[] = []
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.initializeIntegrations()
    this.startAutoSync()
  }

  private initializeIntegrations() {
    const defaultIntegrations: Integration[] = [
      {
        id: "gcal",
        name: "Google Calendar",
        status: "connected",
        lastSync: new Date().toISOString(),
        dataPoints: 24,
        config: { calendar: "board", autoCreate: true, syncAttendees: true },
      },
      {
        id: "zoom",
        name: "Zoom",
        status: "connected",
        lastSync: new Date().toISOString(),
        dataPoints: 12,
        config: { autoRecord: true, generateTranscripts: true, trackAttendance: true },
      },
      {
        id: "slack",
        name: "Slack",
        status: "connected",
        lastSync: new Date().toISOString(),
        dataPoints: 156,
        config: { channels: ["board-governance", "strategic-initiatives"], autoLink: true },
      },
      {
        id: "notion",
        name: "Notion",
        status: "connected",
        lastSync: new Date().toISOString(),
        dataPoints: 48,
        config: { workspace: "board", syncAttachments: true, trackVersions: true },
      },
      {
        id: "gmail",
        name: "Gmail",
        status: "disconnected",
        dataPoints: 0,
        config: {},
      },
      {
        id: "gdrive",
        name: "Google Drive",
        status: "connected",
        lastSync: new Date().toISOString(),
        dataPoints: 89,
        config: { folders: ["Board Documents", "Meeting Notes"], fileTypes: "all", realTimeSync: true },
      },
    ]

    defaultIntegrations.forEach((integration) => {
      this.integrations.set(integration.id, integration)
    })
  }

  private startAutoSync() {
    this.integrations.forEach((integration, id) => {
      if (integration.status === "connected") {
        // Random interval between 15-20 seconds for more realistic demo
        const randomInterval = 15000 + Math.random() * 5000
        const interval = setInterval(() => this.syncIntegration(id), randomInterval)
        this.syncIntervals.set(id, interval)
        // Initial sync
        this.syncIntegration(id)
      }
    })
  }

  private async syncIntegration(integrationId: string) {
    const integration = this.integrations.get(integrationId)
    if (!integration || integration.status !== "connected") return

    console.log(`[v0] Syncing ${integration.name}...`)

    try {
      // Simulate API call to sync data
      const newData = await this.fetchIntegrationData(integrationId)

      // Add new data to store
      newData.forEach((item) => this.data.push(item))

      // Update integration status
      integration.lastSync = new Date().toISOString()
      integration.dataPoints += newData.length

      // Add success log
      this.addLog({
        id: `log_${Date.now()}_${Math.random()}`,
        integrationId,
        timestamp: new Date().toISOString(),
        type: "success",
        action: "Sync Complete",
        details: `Successfully synced ${newData.length} items from ${integration.name}`,
        dataCount: newData.length,
      })

      console.log(`[v0] ${integration.name} sync complete: ${newData.length} items`)
    } catch (error) {
      console.error(`[v0] ${integration.name} sync failed:`, error)
      
      integration.status = "error"
      this.addLog({
        id: `log_${Date.now()}_${Math.random()}`,
        integrationId,
        timestamp: new Date().toISOString(),
        type: "error",
        action: "Sync Failed",
        details: `Failed to sync ${integration.name}: ${error}`,
      })
    }
  }

  private async fetchIntegrationData(integrationId: string): Promise<IntegrationData[]> {
    // Simulate different types of data for each integration
    const mockData: Record<string, () => IntegrationData[]> = {
      gcal: () => [
        {
          id: `gcal_${Date.now()}`,
          integrationId: "gcal",
          type: "meeting",
          data: {
            title: "Q4 Strategic Review",
            date: "2025-11-10",
            attendees: ["Colette Kress", "Jensen Huang", "Jay Puri"],
          },
          timestamp: new Date().toISOString(),
        },
      ],
      zoom: () => [
        {
          id: `zoom_${Date.now()}`,
          integrationId: "zoom",
          type: "recording",
          data: {
            title: "Board Meeting Recording",
            duration: "45 minutes",
            transcript: "Meeting transcript...",
          },
          timestamp: new Date().toISOString(),
          linkedTo: "meeting_q4_review",
        },
      ],
      slack: () => [
        {
          id: `slack_${Date.now()}`,
          integrationId: "slack",
          type: "message",
          data: {
            channel: "#board-governance",
            author: "Colette Kress",
            text: "Security audit update...",
          },
          timestamp: new Date().toISOString(),
          linkedTo: "commitment_security_audit",
        },
      ],
      notion: () => [
        {
          id: `notion_${Date.now()}`,
          integrationId: "notion",
          type: "document",
          data: {
            title: "Security Assessment Report",
            workspace: "Board Documents",
            pages: 15,
          },
          timestamp: new Date().toISOString(),
        },
      ],
      gdrive: () => [
        {
          id: `gdrive_${Date.now()}`,
          integrationId: "gdrive",
          type: "file",
          data: {
            title: "Vulnerability_Scan_Results.pdf",
            folder: "Board Documents",
            size: "2.4 MB",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const generator = mockData[integrationId]
    return generator ? generator() : []
  }

  private addLog(log: SyncLog) {
    this.logs.unshift(log) // Add to beginning
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100)
    }
  }

  // Public API
  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id)
  }

  getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values())
  }

  updateIntegrationConfig(id: string, config: Record<string, any>) {
    const integration = this.integrations.get(id)
    if (integration) {
      integration.config = { ...integration.config, ...config }
      console.log(`[v0] Updated ${integration.name} config:`, config)
      
      this.addLog({
        id: `log_${Date.now()}_${Math.random()}`,
        integrationId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        action: "Configuration Updated",
        details: `Integration settings updated for ${integration.name}`,
      })
    }
  }

  toggleIntegration(id: string, enabled: boolean) {
    const integration = this.integrations.get(id)
    if (!integration) return

    if (enabled) {
      integration.status = "connected"
      integration.lastSync = new Date().toISOString()
      
      const randomInterval = 15000 + Math.random() * 5000
      const interval = setInterval(() => this.syncIntegration(id), randomInterval)
      this.syncIntervals.set(id, interval)
      this.syncIntegration(id) // Immediate sync
      
      console.log(`[v0] ${integration.name} enabled and syncing every 15-20 seconds`)
    } else {
      integration.status = "disconnected"
      
      // Stop auto-sync
      const interval = this.syncIntervals.get(id)
      if (interval) {
        clearInterval(interval)
        this.syncIntervals.delete(id)
      }
      
      console.log(`[v0] ${integration.name} disabled`)
    }

    this.addLog({
      id: `log_${Date.now()}_${Math.random()}`,
      integrationId: id,
      timestamp: new Date().toISOString(),
      type: "info",
      action: enabled ? "Integration Enabled" : "Integration Disabled",
      details: `${integration.name} has been ${enabled ? "connected" : "disconnected"}`,
    })
  }

  async testConnection(id: string): Promise<boolean> {
    console.log(`[v0] Testing connection for integration: ${id}`)
    
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const integration = this.integrations.get(id)
    if (integration) {
      this.addLog({
        id: `log_${Date.now()}_${Math.random()}`,
        integrationId: id,
        timestamp: new Date().toISOString(),
        type: "success",
        action: "Connection Test",
        details: `Connection test successful for ${integration.name}`,
      })
    }
    
    return true
  }

  getData(integrationId?: string): IntegrationData[] {
    if (integrationId) {
      return this.data.filter((d) => d.integrationId === integrationId)
    }
    return this.data
  }

  getLogs(integrationId?: string): SyncLog[] {
    if (integrationId) {
      return this.logs.filter((l) => l.integrationId === integrationId)
    }
    return this.logs
  }

  manualSync(id: string) {
    console.log(`[v0] Manual sync triggered for ${id}`)
    this.syncIntegration(id)
  }

  exportLogs(integrationId: string): string {
    const logs = this.getLogs(integrationId)
    return logs
      .map((log) => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.action}\n  ${log.details}`)
      .join("\n\n")
  }
}

// Create singleton instance
export const integrationStore = new IntegrationStore()
