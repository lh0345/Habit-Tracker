export interface Habit {
  id: string
  name: string
  category: string
  preferredTime: "morning" | "afternoon" | "evening" | "anytime"
  createdAt: Date
  isActive: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  date: string // YYYY-MM-DD format
  completed: boolean
  mood?: "great" | "good" | "okay" | "poor"
  sleepHours?: number
  energyLevel?: 1 | 2 | 3 | 4 | 5
  stressLevel?: 1 | 2 | 3 | 4 | 5
  weather?: "sunny" | "cloudy" | "rainy" | "snowy"
  loggedAt: Date
}

export interface HabitStats {
  habitId: string
  totalLogs: number
  completedLogs: number
  successRate: number
  currentStreak: number
  longestStreak: number
  daysSinceLastLog: number
}

export interface Prediction {
  habitId: string
  habitName: string
  category: string
  probability: number
  confidence: "high" | "medium" | "low"
  explanation: string
  streak: number
  successRate: number
}

export interface MLFeatures {
  habitId: string
  dayOfWeek: number // 0-6
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime"
  mood?: "great" | "good" | "okay" | "poor"
  sleepHours?: number
  energyLevel?: 1 | 2 | 3 | 4 | 5
  stressLevel?: 1 | 2 | 3 | 4 | 5
  weather?: "sunny" | "cloudy" | "rainy" | "snowy"
  streak: number
  daysSinceLastLog: number
  successRate: number
  category: string
  daysSinceCreated: number
  isWeekend: boolean
}

export interface MLModelState {
  isTrained: boolean
  trainingDate?: Date
  totalSamples: number
  accuracy?: number
  featureImportance?: Record<string, number>
}

export interface EnhancedPrediction extends Prediction {
  modelType: "logistic" | "tree" | "ensemble"
  featureContributions?: Record<string, number>
  alternativeRecommendations?: string[]
}

export interface AppData {
  habits: Habit[]
  logs: HabitLog[]
  hasCompletedOnboarding: boolean
  lastTrainingDate?: Date
  mlModelState?: MLModelState
}
