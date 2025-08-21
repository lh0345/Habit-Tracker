import React from "react"

export interface AppError {
  message: string
  code?: string
  details?: string
  timestamp: Date
}

export class HabitTrackerError extends Error {
  code?: string
  details?: string
  timestamp: Date

  constructor(message: string, code?: string, details?: string) {
    super(message)
    this.name = "HabitTrackerError"
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

// Error handling utilities
export const createError = (message: string, code?: string, details?: string): AppError => ({
  message,
  code,
  details,
  timestamp: new Date()
})

export const logError = (error: AppError | Error) => {
  // Only log to console in development mode
  if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
    console.warn("[Habit Tracker]", {
      message: error.message,
      timestamp: "timestamp" in error ? error.timestamp : new Date(),
      code: "code" in error ? error.code : undefined,
      details: "details" in error ? error.details : undefined,
    })
  }
  
  // In production, you might want to send this to a logging service
  // For now, we'll just store it silently
}

// Safe execution wrapper
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  errorMessage: string = "Operation failed"
): T {
  try {
    return fn()
  } catch (error) {
    const appError = createError(errorMessage, "SAFE_EXECUTE_ERROR", error instanceof Error ? error.message : "Unknown error")
    logError(appError)
    return fallback
  }
}

// Async safe execution wrapper
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage: string = "Async operation failed"
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const appError = createError(errorMessage, "SAFE_EXECUTE_ASYNC_ERROR", error instanceof Error ? error.message : "Unknown error")
    logError(appError)
    return fallback
  }
}
