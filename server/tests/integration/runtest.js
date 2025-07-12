// Simple test runner for demonstration
// In a real project, you would use vitest or jest to run these tests

import { validateBugRequest, validateTags, formatValidationErrors } from '@/utils/bugValidation'
import { BugService } from '@/services/bugService'
import { CreateBugRequest } from '@/types/bug'

// Test results collector
const testResults: { name: string; passed: boolean; error?: string }[] = []

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      result
        .then(() => {
          testResults.push({ name, passed: true })
          console.log(`✅ ${name}`)
        })
        .catch((error) => {
          testResults.push({ name, passed: false, error: error.message })
          console.log(`❌ ${name}: ${error.message}`)
        })
    } else {
      testResults.push({ name, passed: true })
      console.log(`✅ ${name}`)
    }
  } catch (error) {
    testResults.push({ name, passed: false, error: (error as Error).message })
    console.log(`❌ ${name}: ${(error as Error).message}`)
  }
}

// Validation Tests
export function runValidationTests() {
  console.log('🧪 Running Validation Tests...\n')

  // Valid request test
  test('should validate correct bug request', () => {
    const validRequest: CreateBugRequest = {
      title: 'Valid bug title',
      description: 'This is a valid bug description that is long enough',
      severity: 'high',
      priority: 'medium',
      reportedBy: 'test@example.com',
      assignedTo: 'dev@example.com',
      tags: ['bug', 'frontend']
    }

    const result = validateBugRequest(validRequest)
    assert(result.isValid === true, 'Should be valid')
    assert(result.errors.length === 0, 'Should have no errors')
  })

  // Title validation tests
  test('should fail validation for empty title', () => {
    const request: CreateBugRequest = {
      title: '',
      description: 'Valid description here',
      severity: 'high',
      priority: 'medium',
      reportedBy: 'test@example.com',
      tags: []
    }

    const result = validateBugRequest(request)
    assert(result.isValid === false, 'Should be invalid')
    assert(result.errors.some(e => e.field === 'title'), 'Should have title error')
  })

  test('should fail validation for short title', () => {
    const request: CreateBugRequest = {
      title: 'Bug',
      description: 'Valid description here',
      severity: 'high',
      priority: 'medium',
      reportedBy: 'test@example.com',
      tags: []
    }

    const result = validateBugRequest(request)
    assert(result.isValid === false, 'Should be invalid')
    assert(result.errors.some(e => e.message.includes('at least 5 characters')), 'Should have length error')
  })

  // INTENTIONAL BUG TEST - This will expose the severity validation bug
  test('should FAIL for critical severity (exposes bug)', () => {
    const request: CreateBugRequest = {
      title: 'Critical Bug Title',
      description: 'This is a critical bug description',
      severity: 'critical',
      priority: 'medium',
      reportedBy: 'test@example.com',
      tags: []
    }

    const result = validateBugRequest(request)
    // This test is designed to fail due to the intentional bug
    assert(result.isValid === false, 'Critical severity is rejected due to validation bug')
  })

  // Tags validation tests
  test('should validate correct tags', () => {
    const tags = ['frontend', 'critical', 'bug']
    const result = validateTags(tags)
    assert(result.isValid === true, 'Should be valid')
  })

  test('should fail for too many tags', () => {
    const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
    const result = validateTags(tags)
    assert(result.isValid === false, 'Should be invalid')
    assert(result.errors.some(e => e.message.includes('Maximum 5')), 'Should have max tags error')
  })

  // INTENTIONAL BUG TEST - Empty string tags
  test('should FAIL for empty string tags (exposes bug)', () => {
    const tags = ['valid', '', 'another']
    const result = validateTags(tags)
    // This might pass due to the bug in validation
    console.warn('⚠️ This test might pass due to empty string validation bug')
    assert(result.isValid === false, 'Empty string tags should be invalid')
  })

  console.log('\n📊 Validation Tests Complete\n')
}

// Service Tests (Mock-based)
export function runServiceTests() {
  console.log('🧪 Running Service Tests...\n')

  test('should generate unique IDs (may fail due to bug)', async () => {
    const bugRequest: CreateBugRequest = {
      title: 'Test Bug',
      description: 'Test Description for ID generation test',
      severity: 'low',
      priority: 'low',
      reportedBy: 'test@example.com',
      tags: []
    }

    // Clear storage first
    localStorage.removeItem('bug-tracker-bugs')

    // Create multiple bugs quickly
    const promises = Array(3).fill(null).map(() => BugService.createBug(bugRequest))
    const bugs = await Promise.all(promises)

    const ids = bugs.map(bug => bug.id)
    const uniqueIds = new Set(ids)

    console.warn('⚠️ This test may fail due to the ID generation bug')
    assert(uniqueIds.size === ids.length, `Expected ${ids.length} unique IDs, got ${uniqueIds.size}`)
  })

  test('should create and retrieve bugs', async () => {
    localStorage.removeItem('bug-tracker-bugs')

    const bugRequest: CreateBugRequest = {
      title: 'Test Bug for Retrieval',
      description: 'This bug tests creation and retrieval',
      severity: 'medium',
      priority: 'high',
      reportedBy: 'tester@example.com',
      tags: ['test']
    }

    const createdBug = await BugService.createBug(bugRequest)
    assert(typeof createdBug.id === 'string', 'Should have an ID')
    assert(createdBug.status === 'open', 'Should default to open status')

    const retrievedBugs = await BugService.getBugs()
    assert(retrievedBugs.length === 1, 'Should have one bug')
    assert(retrievedBugs[0].id === createdBug.id, 'Should retrieve the same bug')
  })

  console.log('\n📊 Service Tests Complete\n')
}

// Debugging Tests
export function runDebuggingTests() {
  console.log('🧪 Running Debugging Tests...\n')

  test('should handle console logging', () => {
    const originalLog = console.log
    let loggedMessage = ''

    console.log = (message: string) => {
      loggedMessage = message
      originalLog(message)
    }

    console.log('Test debug message')
    assert(loggedMessage === 'Test debug message', 'Should capture console logs')

    console.log = originalLog
  })

  test('should format validation errors correctly', () => {
    const errors = [
      { field: 'title', message: 'Title is required' },
      { field: 'description', message: 'Description is required' }
    ]

    const formatted = formatValidationErrors(errors)
    assert(formatted.includes('title: Title is required'), 'Should format first error')
    assert(formatted.includes('description: Description is required'), 'Should format second error')
  })

  console.log('\n📊 Debugging Tests Complete\n')
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Starting Bug Tracker Test Suite\n')
  console.log('This demonstrates testing and debugging practices for MERN applications')
  console.log('Note: Some tests are designed to fail due to intentional bugs\n')

  runValidationTests()
  runServiceTests()
  runDebuggingTests()

  setTimeout(() => {
    const passedTests = testResults.filter(t => t.passed).length
    const failedTests = testResults.filter(t => !t.passed).length

    console.log('\n📈 Test Results Summary:')
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`📊 Total: ${testResults.length}`)

    if (failedTests > 0) {
      console.log('\n🐛 Failed Tests (some are intentional bugs):')
      testResults.filter(t => !t.passed).forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`)
      })
    }

    console.log('\n💡 Debugging Tips:')
    console.log('   • Open the Debug Panel to see real-time logs')
    console.log('   • Check browser console for detailed error messages')  
    console.log('   • Use React DevTools to inspect component state')
    console.log('   • Try creating bugs with invalid data to test validation')
  }, 1000)
}