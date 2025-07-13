import { useState } from 'react'
import { Bug, CreateBugRequest, BugSeverity, BugPriority } from '@/types/bug'
import { validateBugRequest, validateTags } from '@/utils/bugValidation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, X, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BugFormProps {
  onSubmit: (bug: CreateBugRequest) => void
  onCancel: () => void
  initialData?: Partial<Bug>
  isLoading?: boolean
}

export const BugForm = ({ onSubmit, onCancel, initialData, isLoading = false }: BugFormProps) => {
  const [formData, setFormData] = useState<CreateBugRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    severity: initialData?.severity || 'medium',
    priority: initialData?.priority || 'medium',
    reportedBy: initialData?.reportedBy || '',
    assignedTo: initialData?.assignedTo || '',
    tags: initialData?.tags || [],
    stepsToReproduce: initialData?.stepsToReproduce || '',
    expectedBehavior: initialData?.expectedBehavior || '',
    actualBehavior: initialData?.actualBehavior || ''
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof CreateBugRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      const newTags = [...formData.tags, tagInput.trim()]
      setFormData(prev => ({ ...prev, tags: newTags }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData) // Debug log

    // Validate form data
    const validation = validateBugRequest(formData)
    const tagValidation = validateTags(formData.tags)

    const allErrors = [...validation.errors, ...tagValidation.errors]

    if (allErrors.length > 0) {
      setErrors(allErrors.map(error => `${error.field}: ${error.message}`))
      console.log('Validation errors:', allErrors) // Debug log
      return
    }

    onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Bug Report' : 'Create New Bug Report'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="bug-form">
          {errors.length > 0 && (
            <Alert variant="destructive" data-testid="form-errors">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the bug"
                data-testid="title-input"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the bug"
                rows={4}
                data-testid="description-input"
              />
            </div>

            <div>
              <Label htmlFor="severity">Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: BugSeverity) => handleInputChange('severity', value)}
              >
                <SelectTrigger data-testid="severity-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: BugPriority) => handleInputChange('priority', value)}
              >
                <SelectTrigger data-testid="priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reportedBy">Reported By *</Label>
              <Input
                id="reportedBy"
                value={formData.reportedBy}
                onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                placeholder="reporter@example.com"
                data-testid="reporter-input"
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="assignee@example.com"
                data-testid="assignee-input"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                  data-testid="tag-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  data-testid="add-tag-btn"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                      data-testid={`remove-tag-${tag}`}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
              <Textarea
                id="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                rows={3}
                data-testid="steps-input"
              />
            </div>

            <div>
              <Label htmlFor="expectedBehavior">Expected Behavior</Label>
              <Textarea
                id="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                placeholder="What should happen"
                rows={3}
                data-testid="expected-input"
              />
            </div>

            <div>
              <Label htmlFor="actualBehavior">Actual Behavior</Label>
              <Textarea
                id="actualBehavior"
                value={formData.actualBehavior}
                onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                placeholder="What actually happens"
                rows={3}
                data-testid="actual-input"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="submit-btn"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Bug' : 'Create Bug')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}