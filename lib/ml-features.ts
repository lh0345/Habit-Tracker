import type { Habit, HabitLog, MLFeatures } from "@/types/habit"
import { calculateHabitStats } from "@/lib/habit-utils"

// Enhanced feature extraction with more contextual data
export function extractFeatures(habit: Habit, logs: HabitLog[], targetDate?: Date): MLFeatures {
  const targetDateObj = targetDate || new Date()
  const stats = calculateHabitStats(habit, logs)
  const habitLogs = logs.filter((log) => log.habitId === habit.id)
  
  // Get the most recent log for contextual features
  const recentLog = habitLogs
    .filter((log) => new Date(log.date) <= targetDateObj)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  // Calculate days since habit was created
  const daysSinceCreated = Math.floor(
    (targetDateObj.getTime() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Determine if target date is weekend
  const isWeekend = targetDateObj.getDay() === 0 || targetDateObj.getDay() === 6

  return {
    habitId: habit.id,
    dayOfWeek: targetDateObj.getDay(),
    timeOfDay: habit.preferredTime,
    mood: recentLog?.mood,
    sleepHours: recentLog?.sleepHours,
    energyLevel: recentLog?.energyLevel,
    stressLevel: recentLog?.stressLevel,
    weather: recentLog?.weather,
    streak: stats.currentStreak,
    daysSinceLastLog: stats.daysSinceLastLog,
    successRate: stats.successRate,
    category: habit.category,
    daysSinceCreated,
    isWeekend
  }
}

// Enhanced encoding with more features
export function encodeFeatures(features: MLFeatures): number[] {
  const encoded: number[] = []

  // Day of week (0-6)
  encoded.push(features.dayOfWeek / 6)

  // Time of day (one-hot encoding)
  const timeEncoding = [0, 0, 0, 0] // morning, afternoon, evening, anytime
  switch (features.timeOfDay) {
    case "morning": timeEncoding[0] = 1; break
    case "afternoon": timeEncoding[1] = 1; break
    case "evening": timeEncoding[2] = 1; break
    case "anytime": timeEncoding[3] = 1; break
  }
  encoded.push(...timeEncoding)

  // Mood (normalized 0-1, with default 0.5 for missing)
  const moodValue = features.mood 
    ? { "poor": 0, "okay": 0.33, "good": 0.67, "great": 1 }[features.mood] 
    : 0.5
  encoded.push(moodValue)

  // Sleep hours (normalized, assuming 8 hours is optimal)
  const sleepValue = features.sleepHours ? Math.min(features.sleepHours / 10, 1) : 0.75
  encoded.push(sleepValue)

  // Energy level (normalized 0-1)
  const energyValue = features.energyLevel ? (features.energyLevel - 1) / 4 : 0.5
  encoded.push(energyValue)

  // Stress level (inverted and normalized - lower stress is better)
  const stressValue = features.stressLevel ? 1 - ((features.stressLevel - 1) / 4) : 0.5
  encoded.push(stressValue)

  // Weather (one-hot encoding)
  const weatherEncoding = [0, 0, 0, 0] // sunny, cloudy, rainy, snowy
  switch (features.weather) {
    case "sunny": weatherEncoding[0] = 1; break
    case "cloudy": weatherEncoding[1] = 1; break
    case "rainy": weatherEncoding[2] = 1; break
    case "snowy": weatherEncoding[3] = 1; break
  }
  encoded.push(...weatherEncoding)

  // Streak (normalized with logarithmic scaling)
  encoded.push(Math.min(Math.log1p(features.streak) / Math.log1p(30), 1))

  // Days since last log (normalized, capped at 30 days)
  encoded.push(Math.min(features.daysSinceLastLog / 30, 1))

  // Success rate
  encoded.push(features.successRate)

  // Category (simple hash-based encoding)
  const categoryHash = features.category.split("").reduce((hash, char) => 
    ((hash << 5) - hash + char.charCodeAt(0)) & 0xffff, 0
  )
  encoded.push((categoryHash % 100) / 100)

  // Days since created (normalized, with logarithmic scaling)
  encoded.push(Math.min(Math.log1p(features.daysSinceCreated) / Math.log1p(365), 1))

  // Is weekend (binary)
  encoded.push(features.isWeekend ? 1 : 0)

  return encoded
}

export function createTrainingData(habits: Habit[], logs: HabitLog[]): {
  features: number[][]
  labels: number[]
  metadata: { habitId: string; date: string }[]
} {
  const trainingFeatures: number[][] = []
  const labels: number[] = []
  const metadata: { habitId: string; date: string }[] = []

  for (const habit of habits) {
    const habitLogs = logs.filter((log) => log.habitId === habit.id)
    
    // Use each log as a training sample
    for (const log of habitLogs) {
      const logDate = new Date(log.date)
      const features = extractFeatures(habit, logs, logDate)
      const encoded = encodeFeatures(features)
      
      trainingFeatures.push(encoded)
      labels.push(log.completed ? 1 : 0)
      metadata.push({ habitId: habit.id, date: log.date })
    }
  }

  return {
    features: trainingFeatures,
    labels,
    metadata
  }
}

// Feature importance calculation for model interpretability
export function calculateFeatureImportance(
  features: number[][],
  labels: number[]
): Record<string, number> {
  const featureNames = [
    "dayOfWeek", "timeOfDay_morning", "timeOfDay_afternoon", "timeOfDay_evening", "timeOfDay_anytime",
    "mood", "sleepHours", "energyLevel", "stressLevel", 
    "weather_sunny", "weather_cloudy", "weather_rainy", "weather_snowy",
    "streak", "daysSinceLastLog", "successRate", "category", "daysSinceCreated", "isWeekend"
  ]

  const importance: Record<string, number> = {}
  
  // Simple correlation-based importance
  for (let i = 0; i < featureNames.length; i++) {
    const featureValues = features.map(f => f[i])
    const correlation = calculateCorrelation(featureValues, labels)
    importance[featureNames[i]] = Math.abs(correlation)
  }

  return importance
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n === 0) return 0

  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denominator = Math.sqrt(denomX * denomY)
  return denominator === 0 ? 0 : numerator / denominator
}
