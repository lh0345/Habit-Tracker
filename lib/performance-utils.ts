import type { Habit, HabitLog, HabitStats } from "@/types/habit"
import { calculateHabitStats, formatDate } from "@/lib/habit-utils"

export interface PerformanceData {
  date: string
  completed: number
  total: number
  successRate: number
}

export interface HabitPerformance extends HabitStats {
  habit: Habit
  weeklyData: PerformanceData[]
  monthlyData: PerformanceData[]
  recentLogs: HabitLog[]
}

export const calculateWeeklyPerformance = (habit: Habit, logs: HabitLog[]): PerformanceData[] => {
  const habitLogs = logs.filter((log) => log.habitId === habit.id)
  const weeklyData: PerformanceData[] = []

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = formatDate(date)

    const dayLogs = habitLogs.filter((log) => log.date === dateString)
    const completed = dayLogs.filter((log) => log.completed).length
    const total = Math.max(dayLogs.length, 1) // At least 1 to avoid division by zero

    weeklyData.push({
      date: dateString,
      completed,
      total,
      successRate: completed / total,
    })
  }

  return weeklyData
}

export const calculateMonthlyPerformance = (habit: Habit, logs: HabitLog[]): PerformanceData[] => {
  const habitLogs = logs.filter((log) => log.habitId === habit.id)
  const monthlyData: PerformanceData[] = []

  // Get last 30 days, grouped by week
  for (let week = 3; week >= 0; week--) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (week + 1) * 7)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - week * 7)

    const weekLogs = habitLogs.filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= startDate && logDate < endDate
    })

    const completed = weekLogs.filter((log) => log.completed).length
    const total = Math.max(weekLogs.length, 1)

    monthlyData.push({
      date: `Week ${4 - week}`,
      completed,
      total,
      successRate: completed / total,
    })
  }

  return monthlyData
}

export const getHabitPerformance = (habit: Habit, logs: HabitLog[]): HabitPerformance => {
  const stats = calculateHabitStats(habit, logs)
  const habitLogs = logs.filter((log) => log.habitId === habit.id)
  const recentLogs = habitLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  return {
    ...stats,
    habit,
    weeklyData: calculateWeeklyPerformance(habit, logs),
    monthlyData: calculateMonthlyPerformance(habit, logs),
    recentLogs,
  }
}

export const getOverallPerformance = (habits: Habit[], logs: HabitLog[]) => {
  const activeHabits = habits.filter((h) => h.isActive)
  const totalHabits = activeHabits.length

  if (totalHabits === 0) {
    return {
      totalHabits: 0,
      averageSuccessRate: 0,
      totalLogs: 0,
      completedLogs: 0,
      activeStreaks: 0,
      longestStreak: 0,
    }
  }

  const habitStats = activeHabits.map((habit) => calculateHabitStats(habit, logs))

  const averageSuccessRate = habitStats.reduce((sum, stats) => sum + stats.successRate, 0) / totalHabits

  const totalLogs = habitStats.reduce((sum, stats) => sum + stats.totalLogs, 0)
  const completedLogs = habitStats.reduce((sum, stats) => sum + stats.completedLogs, 0)
  const activeStreaks = habitStats.filter((stats) => stats.currentStreak > 0).length
  const longestStreak = Math.max(...habitStats.map((stats) => stats.longestStreak), 0)

  return {
    totalHabits,
    averageSuccessRate,
    totalLogs,
    completedLogs,
    activeStreaks,
    longestStreak,
  }
}
