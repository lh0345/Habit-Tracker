import type { Habit, HabitLog, Prediction } from "@/types/habit"
import { extractFeatures, encodeFeatures, createTrainingData } from "@/lib/ml-features"
import { LogisticRegression, DecisionTree } from "@/lib/ml-models"
import { calculateHabitStats } from "@/lib/habit-utils"

export class PredictionEngine {
  private logisticRegression: LogisticRegression
  private decisionTree: DecisionTree
  private isTrained = false
  private minLogsForML = 8

  constructor() {
    this.logisticRegression = new LogisticRegression(0.01, 500)
    this.decisionTree = new DecisionTree(4, 3)
  }

  train(habits: Habit[], logs: HabitLog[]): void {
    if (logs.length < this.minLogsForML) {
      this.isTrained = false
      return
    }

    const { features, labels } = createTrainingData(habits, logs)

    if (features.length === 0) {
      this.isTrained = false
      return
    }

    try {
      this.logisticRegression.train(features, labels)
      this.decisionTree.train(features, labels)
      this.isTrained = true
    } catch (error) {
      console.error("Training failed:", error)
      this.isTrained = false
    }
  }

  private generateHeuristicPrediction(habit: Habit, logs: HabitLog[]): Prediction {
    const stats = calculateHabitStats(habit, logs)

    // Simple heuristic based on success rate, streak, and recency
    let probability = 0.5 // Base probability

    // Factor in success rate (40% weight)
    probability += (stats.successRate - 0.5) * 0.4

    // Factor in current streak (30% weight)
    const streakBonus = Math.min(stats.currentStreak / 7, 1) * 0.3
    probability += streakBonus

    // Factor in recency (30% weight)
    const recencyPenalty = Math.min(stats.daysSinceLastLog / 7, 1) * 0.3
    probability -= recencyPenalty

    // Clamp between 0.1 and 0.9
    probability = Math.max(0.1, Math.min(0.9, probability))

    const confidence = stats.totalLogs > 3 ? "medium" : "low"

    let explanation = "Based on your habit history: "
    const factors: string[] = []

    if (stats.successRate > 0.7) {
      factors.push(`high success rate (${Math.round(stats.successRate * 100)}%)`)
    } else if (stats.successRate < 0.3) {
      factors.push(`low success rate (${Math.round(stats.successRate * 100)}%)`)
    }

    if (stats.currentStreak > 2) {
      factors.push(`${stats.currentStreak}-day streak`)
    }

    if (stats.daysSinceLastLog > 3) {
      factors.push(`${stats.daysSinceLastLog} days since last completion`)
    }

    if (factors.length === 0) {
      explanation += "limited data available"
    } else {
      explanation += factors.join(", ")
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      category: habit.category,
      probability,
      confidence,
      explanation,
      streak: stats.currentStreak,
      successRate: stats.successRate,
    }
  }

  private generateMLPrediction(habit: Habit, logs: HabitLog[], targetDate: Date): Prediction {
    const features = extractFeatures(habit, logs, targetDate)
    const encodedFeatures = encodeFeatures(features)

    // Get predictions from both models
    const lrPrediction = this.logisticRegression.predict(encodedFeatures)
    const dtPrediction = this.decisionTree.predict(encodedFeatures)

    // Ensemble: weighted average (LR gets 60%, DT gets 40%)
    const probability = lrPrediction * 0.6 + dtPrediction * 0.4

    const stats = calculateHabitStats(habit, logs)
    const confidence = logs.length > 20 ? "high" : logs.length > 10 ? "medium" : "low"

    // Generate explanation
    let explanation = "AI prediction based on: "
    const factors: string[] = []

    if (stats.successRate > 0.7) {
      factors.push(`strong track record (${Math.round(stats.successRate * 100)}%)`)
    }

    if (stats.currentStreak > 0) {
      factors.push(`current ${stats.currentStreak}-day streak`)
    }

    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" })
    factors.push(`${dayName} patterns`)

    if (habit.preferredTime !== "anytime") {
      factors.push(`${habit.preferredTime} timing`)
    }

    explanation += factors.join(", ")

    return {
      habitId: habit.id,
      habitName: habit.name,
      category: habit.category,
      probability,
      confidence,
      explanation,
      streak: stats.currentStreak,
      successRate: stats.successRate,
    }
  }

  predictForDate(habits: Habit[], logs: HabitLog[], targetDate: Date): Prediction[] {
    const predictions: Prediction[] = []

    for (const habit of habits) {
      if (!habit.isActive) continue

      const habitLogs = logs.filter((log) => log.habitId === habit.id)

      let prediction: Prediction

      if (this.isTrained && habitLogs.length >= this.minLogsForML) {
        prediction = this.generateMLPrediction(habit, logs, targetDate)
      } else {
        prediction = this.generateHeuristicPrediction(habit, logs)
      }

      predictions.push(prediction)
    }

    // Sort by probability (descending)
    return predictions.sort((a, b) => b.probability - a.probability)
  }

  getTopPredictions(
    habits: Habit[],
    logs: HabitLog[],
    count = 3,
  ): {
    today: Prediction[]
    tomorrow: Prediction[]
  } {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayPredictions = this.predictForDate(habits, logs, today).slice(0, count)
    const tomorrowPredictions = this.predictForDate(habits, logs, tomorrow).slice(0, count)

    return {
      today: todayPredictions,
      tomorrow: tomorrowPredictions,
    }
  }
}

// Singleton instance
export const predictionEngine = new PredictionEngine()
