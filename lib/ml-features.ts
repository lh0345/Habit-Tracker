import type { Habit, HabitLog, MLFeatures } from "@/types/habit"
import { calculateHabitStats } from "@/lib/habit-utils"

export const extractFeatures = (habit: Habit, logs: HabitLog[], targetDate: Date = new Date()): MLFeatures => {
  const stats = calculateHabitStats(habit, logs)

  return {
    habitId: habit.id,
    dayOfWeek: targetDate.getDay(), // 0 = Sunday, 6 = Saturday
    timeOfDay: habit.preferredTime,
    mood: undefined, // Will be filled during prediction if available
    streak: stats.currentStreak,
    daysSinceLastLog: stats.daysSinceLastLog,
    successRate: stats.successRate,
    category: habit.category,
  }
}

export const encodeFeatures = (features: MLFeatures): number[] => {
  // Encode categorical features as one-hot or numerical
  const encoded: number[] = []

  // Day of week (0-6)
  encoded.push(features.dayOfWeek)

  // Time of day (one-hot encoding)
  encoded.push(features.timeOfDay === "morning" ? 1 : 0)
  encoded.push(features.timeOfDay === "afternoon" ? 1 : 0)
  encoded.push(features.timeOfDay === "evening" ? 1 : 0)
  encoded.push(features.timeOfDay === "anytime" ? 1 : 0)

  // Mood (one-hot encoding, all 0 if undefined)
  encoded.push(features.mood === "great" ? 1 : 0)
  encoded.push(features.mood === "good" ? 1 : 0)
  encoded.push(features.mood === "okay" ? 1 : 0)
  encoded.push(features.mood === "poor" ? 1 : 0)

  // Numerical features (normalized)
  encoded.push(Math.min(features.streak / 30, 1)) // Normalize streak to 0-1
  encoded.push(Math.min(features.daysSinceLastLog / 7, 1)) // Normalize to 0-1 (week)
  encoded.push(features.successRate) // Already 0-1

  // Category (simple hash to number, normalized)
  const categoryHash = features.category.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  encoded.push((Math.abs(categoryHash) % 100) / 100) // Normalize to 0-1

  return encoded
}

export const createTrainingData = (
  habits: Habit[],
  logs: HabitLog[],
): {
  features: number[][]
  labels: number[]
  habitIds: string[]
} => {
  const features: number[][] = []
  const labels: number[] = []
  const habitIds: string[] = []

  // Create training examples from historical logs
  logs.forEach((log) => {
    const habit = habits.find((h) => h.id === log.habitId)
    if (!habit) return

    const logDate = new Date(log.date)
    const mlFeatures = extractFeatures(habit, logs, logDate)
    mlFeatures.mood = log.mood

    const encodedFeatures = encodeFeatures(mlFeatures)

    features.push(encodedFeatures)
    labels.push(log.completed ? 1 : 0)
    habitIds.push(habit.id)
  })

  return { features, labels, habitIds }
}
