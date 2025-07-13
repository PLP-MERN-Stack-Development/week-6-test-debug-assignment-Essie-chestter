import { Bug } from '@/types/bug'
import { BugCard } from './BugCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus } from 'lucide-react'
import { useState, useMemo } from 'react'

interface BugListProps {
  bugs: Bug[]
  onCreateNew: () => void
  onEdit: (bug: Bug) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Bug['status']) => void
  isLoading?: boolean
}

export const BugList = ({ 
  bugs, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  isLoading = false 
}: BugListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const filteredBugs = useMemo(() => {
    let filtered = bugs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter)
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.severity === severityFilter)
    }

    return filtered
  }, [bugs, searchTerm, statusFilter, severityFilter])

  const getStatusCounts = () => {
    return {
      total: bugs.length,
      open: bugs.filter(bug => bug.status === 'open').length,
      inProgress: bugs.filter(bug => bug.status === 'in-progress').length,
      resolved: bugs.filter(bug => bug.status === 'resolved').length
    }
  }

  const statusCounts = getStatusCounts()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading bugs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bug Tracker
          </h1>
          <p className="text-muted-foreground">
            Track and manage project bugs effectively
          </p>
        </div>
        <Button onClick={onCreateNew} data-testid="create-bug-btn">
          <Plus className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-bg p-4 rounded-lg border">
          <div className="text-2xl font-bold">{statusCounts.total}</div>
          <div className="text-sm text-muted-foreground">Total Bugs</div>
        </div>
        <div className="bg-gradient-bg p-4 rounded-lg border">
          <div className="text-2xl font-bold text-status-open">{statusCounts.open}</div>
          <div className="text-sm text-muted-foreground">Open</div>
        </div>
        <div className="bg-gradient-bg p-4 rounded-lg border">
          <div className="text-2xl font-bold text-status-progress">{statusCounts.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-gradient-bg p-4 rounded-lg border">
          <div className="text-2xl font-bold text-status-resolved">{statusCounts.resolved}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40" data-testid="severity-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all') && (
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')}>×</button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')}>×</button>
            </Badge>
          )}
          {severityFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Severity: {severityFilter}
              <button onClick={() => setSeverityFilter('all')}>×</button>
            </Badge>
          )}
        </div>
      )}

      {/* Bug List */}
      <div className="space-y-4" data-testid="bug-list">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {bugs.length === 0 ? 'No bugs reported yet' : 'No bugs match your filters'}
            </div>
            {bugs.length === 0 && (
              <Button onClick={onCreateNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Report Your First Bug
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBugs.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}