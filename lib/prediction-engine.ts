import type { Habit, HabitLog, Prediction, MLModelState, EnhancedPrediction } from "@/types/habit"
import { extractFeatures, encodeFeatures, createTrainingData, calculateFeatureImportance } from "@/lib/ml-features"
import { LogisticRegression, DecisionTree } from "@/lib/ml-models"
import { calculateHabitStats } from "@/lib/habit-utils"
import { ModelEvaluator, type ModelPerformanceReport } from "@/lib/model-evaluation"

export class PredictionEngine {
  private logisticRegression: LogisticRegression
  private decisionTree: DecisionTree
  private modelState: MLModelState = { isTrained: false, totalSamples: 0 }
  private minLogsForML = 10
  private featureImportance: Record<string, number> = {}
  private performanceReport: ModelPerformanceReport | null = null

  constructor() {
    this.logisticRegression = new LogisticRegression(0.01, 500)
    this.decisionTree = new DecisionTree(4, 3)
  }

  getModelState(): MLModelState {
    return this.modelState
  }

  getPerformanceReport(): ModelPerformanceReport | null {
    return this.performanceReport
  }

  train(habits: Habit[], logs: HabitLog[]): MLModelState {
    if (logs.length < this.minLogsForML) {
      this.modelState = { isTrained: false, totalSamples: logs.length }
      return this.modelState
    }

    const { features, labels, metadata } = createTrainingData(habits, logs)

    if (features.length === 0) {
      this.modelState = { isTrained: false, totalSamples: 0 }
      return this.modelState
    }

    try {
      // Split data for training and validation
      const splitIndex = Math.floor(features.length * 0.8)
      const trainFeatures = features.slice(0, splitIndex)
      const trainLabels = labels.slice(0, splitIndex)
      const testFeatures = features.slice(splitIndex)
      const testLabels = labels.slice(splitIndex)

      // Train models
      this.logisticRegression.train(trainFeatures, trainLabels)
      this.decisionTree.train(trainFeatures, trainLabels)

      // Calculate comprehensive metrics for all models
      const logisticPredictions: number[] = []
      const treePredictions: number[] = []
      const ensemblePredictions: number[] = []
      const logisticProbabilities: number[] = []
      const treeProbabilities: number[] = []
      const ensembleProbabilities: number[] = []

      for (let i = 0; i < testFeatures.length; i++) {
        const lrProb = this.logisticRegression.predict(testFeatures[i])
        const dtProb = this.decisionTree.predict(testFeatures[i])
        const ensembleProb = (lrProb + dtProb) / 2

        logisticProbabilities.push(lrProb)
        treeProbabilities.push(dtProb)
        ensembleProbabilities.push(ensembleProb)

        logisticPredictions.push(lrProb > 0.5 ? 1 : 0)
        treePredictions.push(dtProb > 0.5 ? 1 : 0)
        ensemblePredictions.push(ensembleProb > 0.5 ? 1 : 0)
      }

      // Generate comprehensive performance report
      const logisticMetrics = ModelEvaluator.calculateMetrics(logisticPredictions, testLabels, logisticProbabilities)
      const treeMetrics = ModelEvaluator.calculateMetrics(treePredictions, testLabels, treeProbabilities)
      const ensembleMetrics = ModelEvaluator.calculateMetrics(ensemblePredictions, testLabels, ensembleProbabilities)

      // Perform cross-validation
      const cvScores = ModelEvaluator.performCrossValidation(features, labels)
      
      // Generate learning curve
      const learningCurve = ModelEvaluator.generateLearningCurve(features, labels)
      
      // Calculate feature importance
      this.featureImportance = calculateFeatureImportance(features, labels)
      
      // Assess data quality
      const dataQuality = ModelEvaluator.assessDataQuality(habits, logs)

      this.performanceReport = {
        logisticRegression: logisticMetrics,
        decisionTree: treeMetrics,
        ensemble: ensembleMetrics,
        crossValidationScores: cvScores.ensemble,
        learningCurve,
        featureImportance: this.featureImportance,
        dataQuality
      }

      this.modelState = {
        isTrained: true,
        trainingDate: new Date(),
        totalSamples: features.length,
        accuracy: ensembleMetrics.accuracy,
        featureImportance: this.featureImportance
      }
    } catch (error) {
      console.error("Training failed:", error)
      this.modelState = { isTrained: false, totalSamples: features.length }
    }

    return this.modelState
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

    // Ensure probability stays within bounds
    probability = Math.max(0, Math.min(1, probability))

    const confidence = probability > 0.7 ? "high" : probability > 0.4 ? "medium" : "low"
    
    let explanation = `Heuristic prediction: `
    if (stats.successRate > 0.7) explanation += "Good track record. "
    if (stats.currentStreak > 3) explanation += "Strong current streak. "
    if (stats.daysSinceLastLog > 3) explanation += "Haven't logged recently. "

    return {
      habitId: habit.id,
      habitName: habit.name,
      category: habit.category,
      probability,
      confidence,
      explanation,
      streak: stats.currentStreak,
      successRate: stats.successRate
    }
  }

  // Public API methods
  predictForDate(habits: Habit[], logs: HabitLog[], targetDate: Date): Prediction[] {
    return habits
      .filter(h => h.isActive)
      .map(habit => {
        const prediction = this.generateHeuristicPrediction(habit, logs)
        return prediction
      })
      .sort((a, b) => b.probability - a.probability)
  }

  getTopPredictions(habits: Habit[], logs: HabitLog[], count = 5): {
    today: Prediction[]
    tomorrow: Prediction[]
  } {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayPredictions = this.predictForDate(habits, logs, today).slice(0, count)
    const tomorrowPredictions = this.predictForDate(habits, logs, tomorrow).slice(0, count)

    return {
      today: todayPredictions,
      tomorrow: tomorrowPredictions
    }
  }
}

// Export singleton instance
export const predictionEngine = new PredictionEngine()
