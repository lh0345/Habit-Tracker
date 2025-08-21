"use client"

import { useState, useEffect, useCallback } from "react"
import type { AppData, Habit, HabitLog } from "@/types/habit"
import { loadData, saveData } from "@/lib/storage"
import { generateId, getTodayString } from "@/lib/habit-utils"

export const useHabitData = () => {
  const [data, setData] = useState<AppData>(() => {
    try {
      return loadData()
    } catch (error) {
      // Fallback to default data if loading fails
      return {
        habits: [],
        logs: [],
        hasCompletedOnboarding: false,
      }
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const updateData = useCallback((newData: AppData) => {
    setData(newData)
    saveData(newData)
  }, [])

  const addHabit = useCallback(
    (habitData: Omit<Habit, "id" | "createdAt" | "isActive">) => {
      const newHabit: Habit = {
        ...habitData,
        id: generateId(),
        createdAt: new Date(),
        isActive: true,
      }

      const newData = {
        ...data,
        habits: [...data.habits, newHabit],
      }
      updateData(newData)
      return newHabit
    },
    [data, updateData],
  )

  const logHabit = useCallback(
    (habitId: string, completed: boolean, contextData?: {
      mood?: "great" | "good" | "okay" | "poor"
      sleepHours?: number
      energyLevel?: 1 | 2 | 3 | 4 | 5
      stressLevel?: 1 | 2 | 3 | 4 | 5
      weather?: "sunny" | "cloudy" | "rainy" | "snowy"
    }) => {
      const today = getTodayString()
      const existingLogIndex = data.logs.findIndex((log) => log.habitId === habitId && log.date === today)

      let newLogs: HabitLog[]

      if (existingLogIndex !== -1) {
        // Update existing log
        newLogs = [...data.logs]
        newLogs[existingLogIndex] = {
          ...newLogs[existingLogIndex],
          completed,
          mood: contextData?.mood,
          sleepHours: contextData?.sleepHours,
          energyLevel: contextData?.energyLevel,
          stressLevel: contextData?.stressLevel,
          weather: contextData?.weather,
          loggedAt: new Date(),
        }
      } else {
        // Create new log
        const newLog: HabitLog = {
          id: generateId(),
          habitId,
          date: today,
          completed,
          mood: contextData?.mood,
          sleepHours: contextData?.sleepHours,
          energyLevel: contextData?.energyLevel,
          stressLevel: contextData?.stressLevel,
          weather: contextData?.weather,
          loggedAt: new Date(),
        }
        newLogs = [...data.logs, newLog]
      }

      const newData = {
        ...data,
        logs: newLogs,
      }
      updateData(newData)
    },
    [data, updateData],
  )

  const completeOnboarding = useCallback(() => {
    const newData = {
      ...data,
      hasCompletedOnboarding: true,
    }
    updateData(newData)
  }, [data, updateData])

  const importAppData = useCallback(
    (importedData: AppData) => {
      updateData(importedData)
    },
    [updateData],
  )

  const clearAllData = useCallback(() => {
    const clearedData: AppData = {
      habits: [],
      logs: [],
      hasCompletedOnboarding: data.hasCompletedOnboarding, // Keep onboarding status
    }
    updateData(clearedData)
  }, [data.hasCompletedOnboarding, updateData])

  return {
    data,
    isLoading,
    addHabit,
    logHabit,
    completeOnboarding,
    importAppData,
    clearAllData,
    updateData,
  }
}
