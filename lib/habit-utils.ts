import type { Habit, HabitLog, HabitStats } from "@/types/habit"

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export const getTodayString = (): string => {
  return formatDate(new Date())
}

export const getTomorrowString = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(tomorrow)
}

export const calculateHabitStats = (habit: Habit, logs: HabitLog[]): HabitStats => {
  const habitLogs = logs.filter((log) => log.habitId === habit.id)
  const completedLogs = habitLogs.filter((log) => log.completed)

  const totalLogs = habitLogs.length
  const completedCount = completedLogs.length
  const successRate = totalLogs > 0 ? completedCount / totalLogs : 0

  // Calculate current streak
  let currentStreak = 0
  const sortedLogs = habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (const log of sortedLogs) {
    if (log.completed) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0

  for (const log of sortedLogs.reverse()) {
    if (log.completed) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Calculate days since last log
  const lastLog = sortedLogs[0]
  const daysSinceLastLog = lastLog
    ? Math.floor((Date.now() - new Date(lastLog.date).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  return {
    habitId: habit.id,
    totalLogs,
    completedLogs: completedCount,
    successRate,
    currentStreak,
    longestStreak,
    daysSinceLastLog,
  }
}

export const getHabitLogForDate = (habitId: string, date: string, logs: HabitLog[]): HabitLog | undefined => {
  return logs.find((log) => log.habitId === habitId && log.date === date)
}

export const isHabitLoggedToday = (habitId: string, logs: HabitLog[]): boolean => {
  const today = getTodayString()
  return logs.some((log) => log.habitId === habitId && log.date === today)
}
