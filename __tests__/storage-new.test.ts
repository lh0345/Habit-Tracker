import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  loadData,
  saveData, 
  importData, 
  exportData,
  clearAllData,
  isStorageAvailable,
  getStorageInfo
} from '../lib/storage'
import type { Habit, HabitLog, AppData } from '../types/habit'

// Mock window and localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
    key(index: number): string | null {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    }
  }
})()

// Mock global objects for Node environment
global.window = {
  localStorage: localStorageMock
} as any

global.localStorage = localStorageMock as Storage

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Data Management', () => {
    const mockData: AppData = {
      habits: [
        {
          id: '1',
          name: 'Exercise',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date('2024-01-01'),
          isActive: true
        },
        {
          id: '2',
          name: 'Read',
          category: 'Learning',
          preferredTime: 'evening',
          createdAt: new Date('2024-01-01'),
          isActive: false
        }
      ],
      logs: [
        {
          id: '1',
          habitId: '1',
          date: '2024-01-01',
          completed: true,
          mood: 'good',
          loggedAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: '2',
          habitId: '1',
          date: '2024-01-02',
          completed: false,
          loggedAt: new Date('2024-01-02T10:00:00Z')
        }
      ],
      hasCompletedOnboarding: true
    }

    it('should save and load data correctly', () => {
      const saved = saveData(mockData)
      expect(saved).toBe(true)
      
      const loadedData = loadData()
      
      expect(loadedData.habits).toHaveLength(2)
      expect(loadedData.logs).toHaveLength(2)
      expect(loadedData.hasCompletedOnboarding).toBe(true)
      expect(loadedData.habits[0].id).toBe('1')
      expect(loadedData.habits[0].name).toBe('Exercise')
      expect(loadedData.habits[0].createdAt).toBeInstanceOf(Date)
      expect(loadedData.logs[0].loggedAt).toBeInstanceOf(Date)
    })

    it('should return default data when no data exists', () => {
      const data = loadData()
      expect(data.habits).toEqual([])
      expect(data.logs).toEqual([])
      expect(data.hasCompletedOnboarding).toBe(false)
    })

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('habit-tracker-data', 'invalid json')
      const data = loadData()
      expect(data.habits).toEqual([])
      expect(data.logs).toEqual([])
      expect(data.hasCompletedOnboarding).toBe(false)
    })

    it('should validate data before saving', () => {
      const invalidData = {
        habits: [{ id: '1' }], // Missing required fields
        logs: [],
        hasCompletedOnboarding: true
      } as any

      const result = saveData(invalidData)
      expect(result).toBe(false)
    })

    it('should preserve date objects during save/load cycles', () => {
      const testDate = new Date('2024-01-01T15:30:00Z')
      const dataWithDate: AppData = {
        habits: [{
          id: '1',
          name: 'Test',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: testDate,
          isActive: true
        }],
        logs: [{
          id: '1',
          habitId: '1',
          date: '2024-01-01',
          completed: true,
          loggedAt: testDate
        }],
        hasCompletedOnboarding: false
      }

      saveData(dataWithDate)
      const loaded = loadData()

      expect(loaded.habits[0].createdAt).toBeInstanceOf(Date)
      expect(loaded.habits[0].createdAt.getTime()).toBe(testDate.getTime())
      expect(loaded.logs[0].loggedAt).toBeInstanceOf(Date)
      expect(loaded.logs[0].loggedAt.getTime()).toBe(testDate.getTime())
    })
  })

  describe('Data Import/Export', () => {
    const mockExportData = {
      habits: [
        {
          id: '1',
          name: 'Exercise',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: '2024-01-01T00:00:00.000Z',
          isActive: true
        }
      ],
      logs: [
        {
          id: '1',
          habitId: '1',
          date: '2024-01-01',
          completed: true,
          loggedAt: '2024-01-01T10:00:00.000Z'
        }
      ],
      hasCompletedOnboarding: true
    }

    it('should export data correctly', () => {
      // Set up some data first
      const testData: AppData = {
        habits: [{
          id: '1',
          name: 'Exercise',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date('2024-01-01'),
          isActive: true
        }],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      saveData(testData)
      const exportedData = exportData()
      
      expect(typeof exportedData).toBe('string')
      const parsed = JSON.parse(exportedData)
      expect(parsed).toHaveProperty('habits')
      expect(parsed).toHaveProperty('logs')
      expect(parsed).toHaveProperty('hasCompletedOnboarding')
      expect(parsed.habits).toHaveLength(1)
      expect(parsed.habits[0].name).toBe('Exercise')
    })

    it('should import valid data successfully', () => {
      const jsonString = JSON.stringify(mockExportData)
      const result = importData(jsonString)
      
      expect(result.habits).toHaveLength(1)
      expect(result.logs).toHaveLength(1)
      expect(result.hasCompletedOnboarding).toBe(true)
      
      // Verify data was actually imported and saved
      const loaded = loadData()
      expect(loaded.habits).toHaveLength(1)
      expect(loaded.logs).toHaveLength(1)
      expect(loaded.habits[0].createdAt).toBeInstanceOf(Date)
      expect(loaded.logs[0].loggedAt).toBeInstanceOf(Date)
    })

    it('should reject invalid import data', () => {
      const invalidJson = '{ "invalid": "data" }'
      const result = importData(invalidJson)
      
      // Should return default data on error
      expect(result.habits).toEqual([])
      expect(result.logs).toEqual([])
      expect(result.hasCompletedOnboarding).toBe(false)
    })

    it('should handle malformed JSON gracefully', () => {
      const invalidJson = 'not json at all'
      const result = importData(invalidJson)
      
      expect(result.habits).toEqual([])
      expect(result.logs).toEqual([])
      expect(result.hasCompletedOnboarding).toBe(false)
    })

    it('should validate imported habit data', () => {
      const invalidHabitsData = {
        habits: [
          { name: 'Valid Habit', category: 'Health' }, // Missing id
          { id: '1' }, // Missing required fields
        ],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      const jsonString = JSON.stringify(invalidHabitsData)
      const result = importData(jsonString)
      
      // Should return default data due to validation failure
      expect(result.habits).toEqual([])
      expect(result.logs).toEqual([])
    })
  })

  describe('Utility Functions', () => {
    it('should check storage availability correctly', () => {
      const available = isStorageAvailable()
      expect(available).toBe(true)
    })

    it('should get storage info', () => {
      const testData: AppData = {
        habits: [{
          id: '1',
          name: 'Test',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date(),
          isActive: true
        }],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      saveData(testData)
      const info = getStorageInfo()
      
      expect(info).not.toBeNull()
      expect(info).toHaveProperty('size')
      expect(info).toHaveProperty('encrypted')
      expect(typeof info!.size).toBe('number')
      expect(info!.size).toBeGreaterThan(0)
      expect(info!.encrypted).toBe(true)
    })

    it('should clear all data', () => {
      const testData: AppData = {
        habits: [{
          id: '1',
          name: 'Test',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date(),
          isActive: true
        }],
        logs: [],
        hasCompletedOnboarding: true
      }
      
      saveData(testData)
      expect(loadData().habits).toHaveLength(1)
      
      const cleared = clearAllData()
      expect(cleared).toBe(true)
      
      const afterClear = loadData()
      expect(afterClear.habits).toEqual([])
      expect(afterClear.logs).toEqual([])
      expect(afterClear.hasCompletedOnboarding).toBe(false)
    })
  })

  describe('Data Encryption', () => {
    it('should encrypt data when storing', () => {
      const testData: AppData = {
        habits: [{
          id: '1',
          name: 'Secret Habit',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date(),
          isActive: true
        }],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      saveData(testData)
      
      // The raw stored data should be encrypted (base64)
      const rawStored = localStorage.getItem('habit-tracker-data')
      expect(rawStored).toBeTruthy()
      expect(rawStored).not.toContain('Secret Habit') // Should not contain plain text
    })

    it('should decrypt data when loading', () => {
      const testData: AppData = {
        habits: [{
          id: '1',
          name: 'Secret Habit',
          category: 'Health',
          preferredTime: 'morning',
          createdAt: new Date(),
          isActive: true
        }],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      saveData(testData)
      const loaded = loadData()
      
      expect(loaded.habits[0].name).toBe('Secret Habit')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full')
      })
      
      const testData: AppData = {
        habits: [],
        logs: [],
        hasCompletedOnboarding: false
      }
      
      const result = saveData(testData)
      expect(result).toBe(false)
      
      // Restore original method
      localStorage.setItem = originalSetItem
    })

    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage to be undefined
      const originalLocalStorage = window.localStorage
      delete (window as any).localStorage
      
      const data = loadData()
      expect(data.habits).toEqual([])
      expect(data.logs).toEqual([])
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage
      })
    })
  })
})
