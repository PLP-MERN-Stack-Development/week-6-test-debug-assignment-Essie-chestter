import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BugService } from '@/services/bugService'
import { CreateBugRequest, Bug } from '@/types/bug'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('BugService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('getBugs', () => {
    it('should return empty array when no bugs stored', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const bugs = await BugService.getBugs()

      expect(bugs).toEqual([])
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bug-tracker-bugs')
    })

    it('should return parsed bugs from localStorage', async () => {
      const storedBugs: Bug[] = [
        {
          id: 'test-1',
          title: 'Test Bug',
          description: 'Test Description',
          status: 'open',
          severity: 'high',
          priority: 'medium',
          reportedBy: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          tags: ['test']
        }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedBugs))

      const bugs = await BugService.getBugs()

      expect(bugs).toEqual(storedBugs)
    })

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      await expect(BugService.getBugs()).rejects.toThrow('Failed to fetch bugs')
    })
  })

  describe('createBug', () => {
    it('should create a new bug successfully', async () => {
      const bugRequest: CreateBugRequest = {
        title: 'New Bug',
        description: 'Bug description',
        severity: 'high',
        priority: 'medium',
        reportedBy: 'test@example.com',
        tags: ['new']
      }

      mockLocalStorage.getItem.mockReturnValue('[]')

      const createdBug = await BugService.createBug(bugRequest)

      expect(createdBug).toMatchObject({
        ...bugRequest,
        status: 'open'
      })
      expect(createdBug.id).toBeDefined()
      expect(createdBug.createdAt).toBeDefined()
      expect(createdBug.updatedAt).toBeDefined()

      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should add bug to existing bugs list', async () => {
      const existingBugs = [
        {
          id: 'existing-1',
          title: 'Existing Bug',
          description: 'Existing Description',
          status: 'open',
          severity: 'low',
          priority: 'low',
          reportedBy: 'existing@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          tags: []
        }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingBugs))

      const bugRequest: CreateBugRequest = {
        title: 'New Bug',
        description: 'Bug description',
        severity: 'high',
        priority: 'medium',
        reportedBy: 'test@example.com',
        tags: []
      }

      await BugService.createBug(bugRequest)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(2)
      expect(savedData[1]).toMatchObject(bugRequest)
    })
  })

  describe('updateBug', () => {
    it('should update an existing bug', async () => {
      const existingBug: Bug = {
        id: 'test-1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
        severity: 'low',
        priority: 'low',
        reportedBy: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tags: []
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([existingBug]))

      const updates = {
        title: 'Updated Title',
        status: 'in-progress' as const
      }

      const updatedBug = await BugService.updateBug('test-1', updates)

      expect(updatedBug.title).toBe('Updated Title')
      expect(updatedBug.status).toBe('in-progress')
      expect(updatedBug.updatedAt).not.toBe(existingBug.updatedAt)
    })

    it('should throw error for non-existent bug', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      await expect(BugService.updateBug('non-existent', { title: 'Test' }))
        .rejects.toThrow('Bug not found')
    })
  })

  describe('deleteBug', () => {
    it('should delete an existing bug', async () => {
      const bugs = [
        {
          id: 'test-1',
          title: 'Bug 1',
          description: 'Description 1',
          status: 'open',
          severity: 'low',
          priority: 'low',
          reportedBy: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          tags: []
        },
        {
          id: 'test-2',
          title: 'Bug 2',
          description: 'Description 2',
          status: 'open',
          severity: 'low',
          priority: 'low',
          reportedBy: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          tags: []
        }
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(bugs))

      await BugService.deleteBug('test-1')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].id).toBe('test-2')
    })

    it('should throw error for non-existent bug', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      await expect(BugService.deleteBug('non-existent'))
        .rejects.toThrow('Bug not found')
    })
  })

  describe('getBugById', () => {
    it('should return bug by id', async () => {
      const bug = {
        id: 'test-1',
        title: 'Test Bug',
        description: 'Description',
        status: 'open',
        severity: 'low',
        priority: 'low',
        reportedBy: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tags: []
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([bug]))

      const foundBug = await BugService.getBugById('test-1')

      expect(foundBug).toEqual(bug)
    })

    it('should return null for non-existent bug', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]')

      const foundBug = await BugService.getBugById('non-existent')

      expect(foundBug).toBeNull()
    })
  })

  // Testing the intentional bug in ID generation
  describe('ID generation (testing intentional bug)', () => {
    it('should generate unique IDs (may fail due to intentional bug)', async () => {
      const bugRequest: CreateBugRequest = {
        title: 'Test Bug',
        description: 'Test Description',
        severity: 'low',
        priority: 'low',
        reportedBy: 'test@example.com',
        tags: []
      }

      mockLocalStorage.getItem.mockReturnValue('[]')

      // Create multiple bugs quickly to test ID uniqueness
      const promises = Array(5).fill(null).map(() => BugService.createBug(bugRequest))
      const bugs = await Promise.all(promises)

      const ids = bugs.map(bug => bug.id)
      const uniqueIds = new Set(ids)

      // This assertion might fail due to the intentional bug in ID generation
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})