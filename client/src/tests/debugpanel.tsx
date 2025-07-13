import { useState } from 'react'
import { Bug } from '@/types/bug'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bug as BugIcon, 
  Eye, 
  Code, 
  Network, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DebugPanelProps {
  bugs: Bug[]
  logs: string[]
  errors: string[]
  networkRequests: any[]
  onClearLogs: () => void
  onClearErrors: () => void
}

export const DebugPanel = ({ 
  bugs, 
  logs, 
  errors, 
  networkRequests, 
  onClearLogs, 
  onClearErrors 
}: DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const getErrorCount = () => errors.length
  const getWarningCount = () => logs.filter(log => log.includes('warn')).length

  const getBugStats = () => {
    return {
      total: bugs.length,
      open: bugs.filter(bug => bug.status === 'open').length,
      critical: bugs.filter(bug => bug.severity === 'critical').length,
      resolved: bugs.filter(bug => bug.status === 'resolved').length
    }
  }

  const stats = getBugStats()

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
          size="lg"
          data-testid="debug-toggle"
        >
          <BugIcon className="h-5 w-5 mr-2" />
          Debug Panel
          {(getErrorCount() > 0 || getWarningCount() > 0) && (
            <Badge variant="destructive" className="ml-2">
              {getErrorCount() + getWarningCount()}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50 border rounded-lg bg-background shadow-xl">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Debug Panel</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              data-testid="debug-close"
            >
              ×
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <BugIcon className="h-4 w-4 text-status-open" />
              <span>{stats.open} Open</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-severity-critical" />
              <span>{stats.critical} Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{getErrorCount()} Errors</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-status-resolved" />
              <span>{stats.resolved} Resolved</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-[calc(100%-140px)]">
          <Tabs defaultValue="console" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="console">Console</TabsTrigger>
              <TabsTrigger value="errors">
                Errors
                {getErrorCount() > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {getErrorCount()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="state">State</TabsTrigger>
            </TabsList>

            <TabsContent value="console" className="h-[calc(100%-50px)] mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Console Logs</span>
                <Button variant="outline" size="sm" onClick={onClearLogs}>
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-full border rounded p-2">
                <div className="space-y-1 font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">No logs</div>
                  ) : (
                    logs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`${
                          log.includes('error') ? 'text-red-500' :
                          log.includes('warn') ? 'text-yellow-500' :
                          'text-foreground'
                        }`}
                      >
                        <span className="text-muted-foreground mr-2">
                          {new Date().toLocaleTimeString()}
                        </span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="errors" className="h-[calc(100%-50px)] mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Error Messages</span>
                <Button variant="outline" size="sm" onClick={onClearErrors}>
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-full border rounded p-2">
                <div className="space-y-2">
                  {errors.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No errors</div>
                  ) : (
                    errors.map((error, index) => (
                      <div key={index} className="p-2 bg-destructive/10 rounded border-l-2 border-destructive">
                        <div className="font-mono text-xs text-destructive break-all">
                          {error}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="network" className="h-[calc(100%-50px)] mt-4">
              <div className="mb-2">
                <span className="text-sm font-medium">Network Requests</span>
              </div>
              <ScrollArea className="h-full border rounded p-2">
                <div className="space-y-2">
                  {networkRequests.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No network requests</div>
                  ) : (
                    networkRequests.map((request, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={request.status >= 400 ? 'destructive' : 'default'}>
                            {request.method}
                          </Badge>
                          <span className="text-xs font-mono">{request.status}</span>
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{request.duration}ms</span>
                        </div>
                        <div className="text-xs text-muted-foreground break-all">
                          {request.url}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="state" className="h-[calc(100%-50px)] mt-4">
              <div className="mb-2">
                <span className="text-sm font-medium">Application State</span>
              </div>
              <ScrollArea className="h-full border rounded p-2">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Bug Summary</div>
                    <div className="text-xs text-muted-foreground">
                      Total: {stats.total} | Open: {stats.open} | In Progress: {bugs.filter(b => b.status === 'in-progress').length} | Resolved: {stats.resolved}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Recent Bugs</div>
                    <div className="space-y-1">
                      {bugs.slice(0, 3).map(bug => (
                        <div key={bug.id} className="text-xs p-2 bg-muted rounded">
                          <div className="font-medium">{bug.title}</div>
                          <div className="text-muted-foreground">
                            {bug.status} • {bug.severity} • {bug.reportedBy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Performance</div>
                    <div className="text-xs text-muted-foreground">
                      Memory: {(performance as any).memory ? 
                        `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
                        'Not available'
                      }
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}