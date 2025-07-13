import { Bug } from '@/types/bug'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Tag, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BugCardProps {
  bug: Bug
  onEdit: (bug: Bug) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Bug['status']) => void
}

export const BugCard = ({ bug, onEdit, onDelete, onStatusChange }: BugCardProps) => {
  const getStatusColor = (status: Bug['status']) => {
    switch (status) {
      case 'open': return 'bg-status-open text-white'
      case 'in-progress': return 'bg-status-progress text-white'
      case 'resolved': return 'bg-status-resolved text-white'
      default: return 'bg-muted'
    }
  }

  const getSeverityColor = (severity: Bug['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-severity-critical text-white'
      case 'high': return 'bg-severity-high text-white'
      case 'medium': return 'bg-severity-medium text-white'
      case 'low': return 'bg-severity-low text-white'
      default: return 'bg-muted'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        "border-l-4",
        bug.severity === 'critical' && "border-l-severity-critical",
        bug.severity === 'high' && "border-l-severity-high", 
        bug.severity === 'medium' && "border-l-severity-medium",
        bug.severity === 'low' && "border-l-severity-low"
      )}
      data-testid={`bug-card-${bug.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold leading-tight">
            {bug.title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bug)}
              data-testid={`edit-bug-${bug.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(bug.id)}
              data-testid={`delete-bug-${bug.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge className={getStatusColor(bug.status)} data-testid="bug-status">
            {bug.status.replace('-', ' ')}
          </Badge>
          <Badge className={getSeverityColor(bug.severity)} data-testid="bug-severity">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {bug.severity}
          </Badge>
          <Badge variant="outline" data-testid="bug-priority">
            {bug.priority} priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {bug.description}
        </p>

        {bug.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {bug.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{bug.reportedBy}</span>
            </div>
            {bug.assignedTo && (
              <div className="flex items-center gap-1">
                <span>→ {bug.assignedTo}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(bug.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {bug.status !== 'resolved' && (
            <>
              {bug.status === 'open' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(bug.id, 'in-progress')}
                  data-testid="start-progress-btn"
                >
                  Start Progress
                </Button>
              )}
              {bug.status === 'in-progress' && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => onStatusChange(bug.id, 'resolved')}
                  data-testid="resolve-btn"
                >
                  Mark Resolved
                </Button>
              )}
            </>
          )}
          {bug.status === 'resolved' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(bug.id, 'open')}
              data-testid="reopen-btn"
            >
              Reopen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}