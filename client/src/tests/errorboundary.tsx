import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to our debug logger
    console.error(`React Error Boundary: ${error.message}`)
    console.error(`Component Stack: ${errorInfo.componentStack}`)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">
                    Oops! Something went wrong
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    The application encountered an unexpected error
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="font-medium text-destructive mb-2">
                  Error Details:
                </div>
                <div className="font-mono text-sm text-destructive">
                  {this.state.error?.message}
                </div>
                {this.state.error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Component Stack */}
              {this.state.errorInfo?.componentStack && (
                <details className="bg-muted rounded-lg p-4">
                  <summary className="cursor-pointer font-medium">
                    Component Stack
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Debugging Tips */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Debugging Tips:
                  </span>
                </div>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Check the browser console for additional error details</li>
                  <li>• Look for any recent changes that might have caused this</li>
                  <li>• Try refreshing the page to see if the error persists</li>
                  <li>• Use the debug panel to inspect application state</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              {/* Development Mode Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
                  <strong>Development Mode:</strong> This detailed error information is only shown in development. 
                  In production, users would see a more user-friendly error message.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}