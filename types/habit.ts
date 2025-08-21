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
  streak: number
  daysSinceLastLog: number
  successRate: number
  category: string
}

export interface AppData {
  habits: Habit[]
  logs: HabitLog[]
  hasCompletedOnboarding: boolean
  lastTrainingDate?: Date
}
