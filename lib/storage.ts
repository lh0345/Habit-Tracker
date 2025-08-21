import type { AppData } from "@/types/habit"
import { validateAppData, validateImportData, AppDataSchema } from "@/lib/validation"
import { safeExecute, safeExecuteAsync, createError, logError } from "@/lib/error-handling"

const STORAGE_KEY = "habit-tracker-data"
const STORAGE_VERSION = "1.0"

const defaultData: AppData = {
  habits: [],
  logs: [],
  hasCompletedOnboarding: false,
}

// Encrypt data before storing (basic implementation)
function encryptData(data: string): string {
  if (typeof window === "undefined") return data
  
  try {
    // Simple base64 encoding for basic protection
    // In production, use proper encryption
    return btoa(data)
  } catch (error) {
    logError(createError("Failed to encrypt data", "ENCRYPTION_ERROR", error instanceof Error ? error.message : "Unknown error"))
    return data
  }
}

// Decrypt data after loading
function decryptData(encryptedData: string): string {
  if (typeof window === "undefined") return encryptedData
  
  try {
    // Check if data looks like base64 (contains only base64 characters)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Regex.test(encryptedData)) {
      // Data is not base64 encoded, return as is (for backward compatibility)
      return encryptedData
    }
    
    // Simple base64 decoding
    return atob(encryptedData)
  } catch (error) {
    // If decryption fails, try returning the original data (might be unencrypted)
    try {
      // Test if it's valid JSON
      JSON.parse(encryptedData)
      return encryptedData
    } catch {
      logError(createError("Failed to decrypt data", "DECRYPTION_ERROR", error instanceof Error ? error.message : "Unknown error"))
      return encryptedData
    }
  }
}

export const loadData = (): AppData => {
  if (typeof window === "undefined") return defaultData

  return safeExecute(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultData

    const decrypted = decryptData(stored)
    const parsed = JSON.parse(decrypted)
    
    // Validate the parsed data
    const validation = validateAppData(parsed)
    if (!validation.success) {
      logError(createError(
        "Invalid data format in storage", 
        "VALIDATION_ERROR", 
        validation.error.message
      ))
      // Return default data if validation fails
      return defaultData
    }

    // Convert date strings back to Date objects
    return {
      ...validation.data,
      habits: validation.data.habits.map((h: any) => ({
        ...h,
        createdAt: new Date(h.createdAt),
      })),
      logs: validation.data.logs.map((l: any) => ({
        ...l,
        loggedAt: new Date(l.loggedAt),
      })),
      lastTrainingDate: parsed.lastTrainingDate ? new Date(parsed.lastTrainingDate) : undefined,
    }
  }, defaultData, "Failed to load data from localStorage")
}

export const saveData = (data: AppData): boolean => {
  if (typeof window === "undefined") return false
  
  return safeExecute(() => {
    // Validate data before saving
    const validation = validateAppData(data)
    if (!validation.success) {
      throw new Error(`Invalid data format: ${validation.error.message}`)
    }

    const dataWithVersion = {
      ...data,
      _version: STORAGE_VERSION,
      _timestamp: new Date().toISOString()
    }

    const serialized = JSON.stringify(dataWithVersion)
    const encrypted = encryptData(serialized)
    
    localStorage.setItem(STORAGE_KEY, encrypted)
    return true
  }, false, "Failed to save data to localStorage")
}

export const exportData = (): string => {
  return safeExecute(() => {
    const data = loadData()
    const exportData = {
      ...data,
      _exported: new Date().toISOString(),
      _version: STORAGE_VERSION
    }
    return JSON.stringify(exportData, null, 2)
  }, JSON.stringify(defaultData, null, 2), "Failed to export data")
}

export const importData = (jsonString: string): AppData => {
  return safeExecute(() => {
    const parsed = JSON.parse(jsonString)
    
    // Validate the import data
    const validation = validateImportData(parsed)
    if (!validation.success) {
      throw new Error(`Invalid import data: ${validation.error.message}`)
    }

    const data: AppData = {
      habits: validation.data.habits.map((h: any) => ({
        ...h,
        createdAt: typeof h.createdAt === "string" ? new Date(h.createdAt) : h.createdAt,
      })),
      logs: validation.data.logs.map((l: any) => ({
        ...l,
        loggedAt: typeof l.loggedAt === "string" ? new Date(l.loggedAt) : l.loggedAt,
      })),
      hasCompletedOnboarding: validation.data.hasCompletedOnboarding,
      lastTrainingDate: parsed.lastTrainingDate ? new Date(parsed.lastTrainingDate) : undefined,
    }
    
    // Save the validated data
    const saved = saveData(data)
    if (!saved) {
      throw new Error("Failed to save imported data")
    }
    
    return data
  }, defaultData, "Failed to import data")
}

// Clear all data with confirmation
export const clearAllData = (): boolean => {
  if (typeof window === "undefined") return false
  
  return safeExecute(() => {
    localStorage.removeItem(STORAGE_KEY)
    return true
  }, false, "Failed to clear data from localStorage")
}

// Force reset of all data (useful for corrupted data recovery)
export const resetToDefaults = (): boolean => {
  if (typeof window === "undefined") return false
  
  return safeExecute(() => {
    localStorage.removeItem(STORAGE_KEY)
    return true
  }, false, "Failed to reset data to defaults")
}

// Check if current data is corrupted
export const isDataCorrupted = (): boolean => {
  if (typeof window === "undefined") return false
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    
    const decrypted = decryptData(stored)
    const parsed = JSON.parse(decrypted)
    const validation = validateAppData(parsed)
    return !validation.success
  } catch {
    return true
  }
}

// Check if storage is available
export const isStorageAvailable = (): boolean => {
  return safeExecute(() => {
    if (typeof window === "undefined") return false
    
    const test = "storage-test"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  }, false, "Storage availability check failed")
}

// Get storage usage info
export const getStorageInfo = () => {
  return safeExecute(() => {
    if (typeof window === "undefined") return null
    
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return { size: 0, encrypted: false }
    
    return {
      size: new Blob([data]).size,
      encrypted: true,
      lastModified: new Date().toISOString()
    }
  }, null, "Failed to get storage info")
}
