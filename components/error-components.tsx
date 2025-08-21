"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

// Error boundary fallback component
export function ErrorFallback({ 
  error, 
  resetError,
  title = "Something went wrong"
}: { 
  error: Error; 
  resetError: () => void;
  title?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
        </div>
        <Button onClick={resetError} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="text-sm cursor-pointer text-muted-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Network error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Network error occurred. Please check your connection.</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Data corruption error component
export function DataCorruptionError({ onReset }: { onReset: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <p>Your habit data appears to be corrupted.</p>
        <Button variant="destructive" size="sm" onClick={onReset}>
          Reset All Data
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// Loading error component
export function LoadingError({ 
  message = "Failed to load data", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void 
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
