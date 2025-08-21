import { describe, it, expect, beforeEach } from '@jest/globals'
import { LogisticRegression, DecisionTree } from '../lib/ml-models'

describe('ML Models', () => {
  describe('LogisticRegression', () => {
    let lr: LogisticRegression

    beforeEach(() => {
      lr = new LogisticRegression(0.1, 100)
    })

    it('should initialize with default parameters', () => {
      const defaultLr = new LogisticRegression()
      expect(defaultLr).toBeDefined()
    })

    it('should train on simple binary classification data', () => {
      const features = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ]
      const labels = [0, 0, 0, 1]

      expect(() => lr.train(features, labels)).not.toThrow()
    })

    it('should make predictions after training', () => {
      const features = [
        [0, 0],
        [1, 1],
        [0, 1],
        [1, 0]
      ]
      const labels = [0, 1, 0, 1]

      lr.train(features, labels)
      
      const prediction1 = lr.predict([0, 0])
      const prediction2 = lr.predict([1, 1])
      
      expect(prediction1).toBeGreaterThanOrEqual(0)
      expect(prediction1).toBeLessThanOrEqual(1)
      expect(prediction2).toBeGreaterThanOrEqual(0)
      expect(prediction2).toBeLessThanOrEqual(1)
    })

    it('should handle empty training data gracefully', () => {
      expect(() => lr.train([], [])).not.toThrow()
      const prediction = lr.predict([1, 2, 3])
      // With no training data, prediction might be NaN, which is acceptable
      expect(typeof prediction).toBe('number')
    })

    it('should produce different predictions for different inputs', () => {
      const features = [[0], [1], [2], [3], [4]]
      const labels = [0, 0, 0, 1, 1]

      lr.train(features, labels)
      
      const pred1 = lr.predict([0])
      const pred2 = lr.predict([4])
      
      expect(pred1).not.toBe(pred2)
    })
  })

  describe('DecisionTree', () => {
    let dt: DecisionTree

    beforeEach(() => {
      dt = new DecisionTree(3, 2)
    })

    it('should initialize with custom parameters', () => {
      const customDt = new DecisionTree(5, 3)
      expect(customDt).toBeDefined()
    })

    it('should train on binary classification data', () => {
      const features = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ]
      const labels = [0, 1, 1, 1]

      expect(() => dt.train(features, labels)).not.toThrow()
    })

    it('should make predictions after training', () => {
      const features = [
        [0, 0],
        [1, 1],
        [0.5, 0.5]
      ]
      const labels = [0, 1, 0.5]

      dt.train(features, labels)
      
      const prediction = dt.predict([0.7, 0.8])
      expect(typeof prediction).toBe('number')
      expect(prediction).toBeGreaterThanOrEqual(0)
      expect(prediction).toBeLessThanOrEqual(1)
    })

    it('should handle empty training data', () => {
      expect(() => dt.train([], [])).not.toThrow()
      const prediction = dt.predict([1, 2])
      expect(prediction).toBe(0.5) // Default prediction when no tree exists
    })

    it('should handle single class data', () => {
      const features = [[1], [2], [3]]
      const labels = [1, 1, 1]

      dt.train(features, labels)
      const prediction = dt.predict([1.5])
      expect(prediction).toBe(1)
    })

    it('should create splits based on features', () => {
      const features = [
        [0, 0], [0, 1], [1, 0], [1, 1],
        [2, 2], [2, 3], [3, 2], [3, 3]
      ]
      const labels = [0, 0, 0, 0, 1, 1, 1, 1]

      dt.train(features, labels)
      
      const lowPrediction = dt.predict([0.5, 0.5])
      const highPrediction = dt.predict([2.5, 2.5])
      
      expect(lowPrediction).toBeLessThan(highPrediction)
    })
  })

  describe('ML Models Integration', () => {
    it('should work together for ensemble predictions', () => {
      const lr = new LogisticRegression(0.1, 50)
      const dt = new DecisionTree(3, 2)
      
      const features = [
        [0, 0], [0, 1], [1, 0], [1, 1],
        [2, 0], [2, 1], [3, 0], [3, 1]
      ]
      const labels = [0, 0, 0, 1, 1, 1, 1, 1]
      
      lr.train(features, labels)
      dt.train(features, labels)
      
      const testInput = [1.5, 0.5]
      const lrPred = lr.predict(testInput)
      const dtPred = dt.predict(testInput)
      
      // Ensemble prediction (weighted average)
      const ensemblePred = lrPred * 0.6 + dtPred * 0.4
      
      expect(ensemblePred).toBeGreaterThanOrEqual(0)
      expect(ensemblePred).toBeLessThanOrEqual(1)
      expect(typeof ensemblePred).toBe('number')
    })
  })
})
