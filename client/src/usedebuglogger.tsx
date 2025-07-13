import { useState, useCallback, useEffect } from 'react'

interface LogEntry {
  message: string
  type: 'log' | 'warn' | 'error'
  timestamp: number
}

interface NetworkRequest {
  url: string
  method: string
  status: number
  duration: number
  timestamp: number
}

export const useDebugLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([])

  // Intercept console methods
  useEffect(() => {
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      const message = args.join(' ')
      setLogs(prev => [...prev, {
        message,
        type: 'log' as const,
        timestamp: Date.now()
      }].slice(-100)) // Keep only last 100 logs
      originalLog.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(' ')
      setLogs(prev => [...prev, {
        message: `⚠️ ${message}`,
        type: 'warn' as const,
        timestamp: Date.now()
      }].slice(-100))
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      const message = args.join(' ')
      setErrors(prev => [...prev, message].slice(-50)) // Keep only last 50 errors
      setLogs(prev => [...prev, {
        message: `❌ ${message}`,
        type: 'error' as const,
        timestamp: Date.now()
      }].slice(-100))
      originalError.apply(console, args)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  // Intercept fetch requests
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const startTime = Date.now()
      const url = args[0] as string
      const options = args[1] as RequestInit

      try {
        const response = await originalFetch(...args)
        const duration = Date.now() - startTime

        setNetworkRequests(prev => [...prev, {
          url,
          method: options?.method || 'GET',
          status: response.status,
          duration,
          timestamp: Date.now()
        }].slice(-50)) // Keep only last 50 requests

        return response
      } catch (error) {
        const duration = Date.now() - startTime

        setNetworkRequests(prev => [...prev, {
          url,
          method: options?.method || 'GET',
          status: 0,
          duration,
          timestamp: Date.now()
        }].slice(-50))

        throw error
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, event.message].slice(-50))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `Unhandled Promise Rejection: ${event.reason}`].slice(-50))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const addLog = useCallback((message: string, type: 'log' | 'warn' | 'error' = 'log') => {
    setLogs(prev => [...prev, {
      message,
      type,
      timestamp: Date.now()
    }].slice(-100))
  }, [])

  return {
    logs: logs.map(l => l.message),
    errors,
    networkRequests,
    clearLogs,
    clearErrors,
    addLog
  }
}