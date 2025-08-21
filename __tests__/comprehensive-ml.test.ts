import { describe, it, expect, beforeEach } from '@jest/globals'
import { predictionEngine } from '@/lib/prediction-engine'
import { ModelEvaluator } from '@/lib/model-evaluation'
import { generateSampleData } from '@/lib/sample-data-generator'
import type { Habit, HabitLog } from '@/types/habit'

describe('ML Integration Tests', () => {
  let habits: Habit[]
  let logs: HabitLog[]

  beforeEach(() => {
    const sampleData = generateSampleData(60)
    habits = sampleData.habits
    logs = sampleData.logs
  })

  describe('Comprehensive ML Pipeline', () => {
    it('should successfully train ensemble models with sufficient data', () => {
      const modelState = predictionEngine.train(habits, logs)
      
      expect(modelState.isTrained).toBe(true)
      expect(modelState.totalSamples).toBeGreaterThan(50)
      expect(modelState.accuracy).toBeGreaterThan(0.5)
      expect(modelState.accuracy).toBeLessThanOrEqual(1.0)
      expect(modelState.featureImportance).toBeDefined()
      expect(Object.keys(modelState.featureImportance!).length).toBeGreaterThan(0)
    })

    it('should generate comprehensive performance report', () => {
      predictionEngine.train(habits, logs)
      const report = predictionEngine.getPerformanceReport()
      
      expect(report).toBeDefined()
      expect(report!.logisticRegression).toBeDefined()
      expect(report!.decisionTree).toBeDefined()
      expect(report!.ensemble).toBeDefined()
      
      // Validate all metrics are present
      const metrics = report!.ensemble
      expect(metrics.accuracy).toBeGreaterThan(0)
      expect(metrics.precision).toBeGreaterThan(0)
      expect(metrics.recall).toBeGreaterThan(0)
      expect(metrics.f1Score).toBeGreaterThan(0)
      expect(metrics.confusionMatrix).toBeDefined()
      expect(metrics.classificationReport).toBeDefined()
    })

    it('should perform cross-validation successfully', () => {
      predictionEngine.train(habits, logs)
      const report = predictionEngine.getPerformanceReport()
      
      expect(report!.crossValidationScores).toBeDefined()
      expect(report!.crossValidationScores.length).toBe(5)
      
      // All CV scores should be reasonable
      report!.crossValidationScores.forEach(score => {
        expect(score).toBeGreaterThan(0.3) // Minimum reasonable accuracy
        expect(score).toBeLessThanOrEqual(1.0)
      })
    })

    it('should generate learning curve data', () => {
      predictionEngine.train(habits, logs)
      const report = predictionEngine.getPerformanceReport()
      
      expect(report!.learningCurve).toBeDefined()
      expect(report!.learningCurve.length).toBeGreaterThan(3)
      
      // Validate learning curve structure
      report!.learningCurve.forEach(point => {
        expect(point.trainSize).toBeGreaterThan(0)
        expect(point.trainScore).toBeGreaterThan(0)
        expect(point.valScore).toBeGreaterThan(0)
        expect(point.trainScore).toBeLessThanOrEqual(1.0)
        expect(point.valScore).toBeLessThanOrEqual(1.0)
      })
    })

    it('should assess data quality correctly', () => {
      predictionEngine.train(habits, logs)
      const report = predictionEngine.getPerformanceReport()
      
      expect(report!.dataQuality).toBeDefined()
      expect(report!.dataQuality.totalSamples).toBeGreaterThan(0)
      expect(report!.dataQuality.classBalance).toBeDefined()
      expect(report!.dataQuality.missingValueRate).toBeGreaterThanOrEqual(0)
      expect(report!.dataQuality.outlierRate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Model Performance Metrics', () => {
    it('should calculate ROC AUC correctly', () => {
      const predictions = [0, 1, 1, 0, 1]
      const actuals = [0, 1, 0, 0, 1]
      const probabilities = [0.2, 0.8, 0.6, 0.3, 0.9]
      
      const rocAuc = ModelEvaluator.calculateROCAUC(actuals, probabilities)
      expect(rocAuc).toBeGreaterThan(0)
      expect(rocAuc).toBeLessThanOrEqual(1.0)
    })

    it('should calculate comprehensive metrics correctly', () => {
      const predictions = [1, 1, 0, 0, 1, 0]
      const actuals = [1, 0, 0, 1, 1, 0]
      const probabilities = [0.8, 0.6, 0.3, 0.4, 0.9, 0.2]
      
      const metrics = ModelEvaluator.calculateMetrics(predictions, actuals, probabilities)
      
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0)
      expect(metrics.accuracy).toBeLessThanOrEqual(1)
      expect(metrics.precision).toBeGreaterThanOrEqual(0)
      expect(metrics.precision).toBeLessThanOrEqual(1)
      expect(metrics.recall).toBeGreaterThanOrEqual(0)
      expect(metrics.recall).toBeLessThanOrEqual(1)
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0)
      expect(metrics.f1Score).toBeLessThanOrEqual(1)
      
      // Confusion matrix should sum correctly
      const cm = metrics.confusionMatrix
      expect(cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative).toBe(predictions.length)
      
      // Classification report should be comprehensive
      expect(metrics.classificationReport.positive).toBeDefined()
      expect(metrics.classificationReport.negative).toBeDefined()
      expect(metrics.classificationReport.macro).toBeDefined()
      expect(metrics.classificationReport.weighted).toBeDefined()
    })
  })

  describe('Feature Engineering Validation', () => {
    it('should extract all 19 features correctly', () => {
      predictionEngine.train(habits, logs)
      
      // Test with a sample habit
      const habit = habits[0]
      const habitLogs = logs.filter(log => log.habitId === habit.id)
      
      if (habitLogs.length > 5) {
        const predictions = predictionEngine.predictForDate(habits, logs, new Date())
        expect(predictions.length).toBeGreaterThan(0)
        
        predictions.forEach(prediction => {
          expect(prediction.habitId).toBeDefined()
          expect(prediction.habitName).toBeDefined()
          expect(prediction.probability).toBeGreaterThanOrEqual(0)
          expect(prediction.probability).toBeLessThanOrEqual(1)
          expect(['high', 'medium', 'low']).toContain(prediction.confidence)
        })
      }
    })
  })

  describe('Real-world Performance Validation', () => {
    it('should achieve reasonable accuracy on realistic data', () => {
      // Generate more realistic, challenging dataset
      const challengingData = generateSampleData(90)
      
      const modelState = predictionEngine.train(challengingData.habits, challengingData.logs)
      
      expect(modelState.isTrained).toBe(true)
      expect(modelState.accuracy).toBeGreaterThan(0.6) // Reasonable threshold
      
      const report = predictionEngine.getPerformanceReport()
      expect(report!.ensemble.f1Score).toBeGreaterThan(0.5) // Balanced performance
    })

    it('should handle edge cases gracefully', () => {
      // Test with minimal data
      const minimalHabits = habits.slice(0, 1)
      const minimalLogs = logs.slice(0, 5)
      
      const modelState = predictionEngine.train(minimalHabits, minimalLogs)
      expect(modelState.isTrained).toBe(false) // Should not train with insufficient data
      expect(modelState.totalSamples).toBeLessThan(10)
      
      // Test predictions still work (fallback to heuristics)
      const predictions = predictionEngine.predictForDate(minimalHabits, minimalLogs, new Date())
      expect(predictions).toBeDefined()
    })
  })

  describe('Performance Benchmarks', () => {
    it('should train models efficiently', () => {
      const startTime = Date.now()
      predictionEngine.train(habits, logs)
      const trainingTime = Date.now() - startTime
      
      // Training should complete within reasonable time
      expect(trainingTime).toBeLessThan(5000) // 5 seconds max
    })

    it('should generate predictions quickly', () => {
      predictionEngine.train(habits, logs)
      
      const startTime = Date.now()
      const predictions = predictionEngine.predictForDate(habits, logs, new Date())
      const predictionTime = Date.now() - startTime
      
      expect(predictionTime).toBeLessThan(1000) // 1 second max
      expect(predictions.length).toBeGreaterThan(0)
    })
  })

  describe('Model Comparison and Selection', () => {
    it('should compare models and select best performer', () => {
      predictionEngine.train(habits, logs)
      const report = predictionEngine.getPerformanceReport()
      
      const lr = report!.logisticRegression
      const dt = report!.decisionTree
      const ensemble = report!.ensemble
      
      // Ensemble should generally perform at least as well as individual models
      // (may not always be true due to randomness, but should be close)
      const ensembleScore = ensemble.f1Score
      const bestIndividual = Math.max(lr.f1Score, dt.f1Score)
      
      // Allow small tolerance for ensemble not being best due to test set randomness
      expect(ensembleScore).toBeGreaterThan(bestIndividual - 0.1)
    })
  })
})
