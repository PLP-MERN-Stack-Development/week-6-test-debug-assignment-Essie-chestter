import { describe, it, expect, beforeEach } from 'vitest'
import { validateBugRequest, validateTags, formatValidationErrors } from '@/utils/bugValidation'
import { CreateBugRequest } from '@/types/bug'

describe('Bug Validation', () => {
  describe('validateBugRequest', () => {
    let validRequest: CreateBugRequest

    beforeEach(() => {
      validRequest = {
        title: 'Valid bug title',
        description: 'This is a valid bug description that is long enough',
        severity: 'high',
        priority: 'medium',
        reportedBy: 'test@example.com',
        assignedTo: 'dev@example.com',
        tags: ['bug', 'frontend']
      }
    })

    it('should validate a correct bug request', () => {
      const result = validateBugRequest(validRequest)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation for empty title', () => {
      const request = { ...validRequest, title: '' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title is required'
      })
    })

    it('should fail validation for short title', () => {
      const request = { ...validRequest, title: 'Bug' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title must be at least 5 characters long'
      })
    })

    it('should fail validation for long title', () => {
      const request = { ...validRequest, title: 'A'.repeat(101) }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'title',
        message: 'Title must be less than 100 characters'
      })
    })

    it('should fail validation for empty description', () => {
      const request = { ...validRequest, description: '' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'description',
        message: 'Description is required'
      })
    })

    it('should fail validation for short description', () => {
      const request = { ...validRequest, description: 'Short' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'description',
        message: 'Description must be at least 10 characters long'
      })
    })

    // This test exposes the intentional bug in severity validation
    it('should fail validation for critical severity (intentional bug)', () => {
      const request = { ...validRequest, severity: 'critical' as any }
      const result = validateBugRequest(request)

      // This should pass but will fail due to the intentional bug
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'severity',
        message: 'Invalid severity level'
      })
    })

    it('should fail validation for invalid priority', () => {
      const request = { ...validRequest, priority: 'invalid' as any }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'priority',
        message: 'Invalid priority level'
      })
    })

    it('should fail validation for empty reporter', () => {
      const request = { ...validRequest, reportedBy: '' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'reportedBy',
        message: 'Reporter name is required'
      })
    })

    // This test exposes the intentional bug in email validation
    it('should fail validation for invalid email format (weak regex bug)', () => {
      const request = { ...validRequest, assignedTo: 'invalid@' }
      const result = validateBugRequest(request)

      // This should fail but might pass due to the weak regex
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'assignedTo',
        message: 'Invalid email format for assignee'
      })
    })

    it('should pass validation with empty assignedTo', () => {
      const request = { ...validRequest, assignedTo: '' }
      const result = validateBugRequest(request)

      expect(result.isValid).toBe(true)
    })

    it('should accumulate multiple validation errors', () => {
      const request: CreateBugRequest = {
        title: '',
        description: '',
        severity: 'invalid' as any,
        priority: 'invalid' as any,
        reportedBy: '',
        assignedTo: 'invalid-email',
        tags: []
      }

      const result = validateBugRequest(request)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(3)
    })
  })

  describe('validateTags', () => {
    it('should validate correct tags', () => {
      const tags = ['bug', 'frontend', 'critical']
      const result = validateTags(tags)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation for too many tags', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
      const result = validateTags(tags)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'tags',
        message: 'Maximum 5 tags allowed'
      })
    })

    it('should fail validation for short tags', () => {
      const tags = ['a', 'bb', 'valid']
      const result = validateTags(tags)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        field: 'tags',
        message: 'Each tag must be at least 2 characters long'
      })
    })

    // This test exposes the intentional bug with empty string validation
    it('should fail validation for empty string tags (intentional bug)', () => {
      const tags = ['valid', '', 'another']
      const result = validateTags(tags)

      // This should fail but might pass due to the bug
      expect(result.isValid).toBe(false)
    })
  })

  describe('formatValidationErrors', () => {
    it('should format single error correctly', () => {
      const errors = [{ field: 'title', message: 'Title is required' }]
      const formatted = formatValidationErrors(errors)

      expect(formatted).toBe('title: Title is required')
    })

    it('should format multiple errors correctly', () => {
      const errors = [
        { field: 'title', message: 'Title is required' },
        { field: 'description', message: 'Description is required' }
      ]
      const formatted = formatValidationErrors(errors)

      expect(formatted).toBe('title: Title is required, description: Description is required')
    })

    it('should handle empty errors array', () => {
      const errors: any[] = []
      const formatted = formatValidationErrors(errors)

      expect(formatted).toBe('')
    })
  })
})