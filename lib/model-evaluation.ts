import type { Habit, HabitLog, MLModelState } from "@/types/habit"
import { createTrainingData, encodeFeatures, extractFeatures } from "@/lib/ml-features"
import { LogisticRegression, DecisionTree } from "@/lib/ml-models"

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: {
    truePositive: number
    trueNegative: number
    falsePositive: number
    falseNegative: number
  }
  rocAuc?: number
  classificationReport: {
    positive: { precision: number; recall: number; f1Score: number; support: number }
    negative: { precision: number; recall: number; f1Score: number; support: number }
    macro: { precision: number; recall: number; f1Score: number }
    weighted: { precision: number; recall: number; f1Score: number }
  }
}

export interface ModelPerformanceReport {
  logisticRegression: ModelMetrics
  decisionTree: ModelMetrics
  ensemble: ModelMetrics
  crossValidationScores: number[]
  learningCurve: Array<{ trainSize: number; trainScore: number; valScore: number }>
  featureImportance: Record<string, number>
  dataQuality: {
    totalSamples: number
    classBalance: { positive: number; negative: number }
    missingValueRate: number
    outlierRate: number
  }
}

export class ModelEvaluator {
  static calculateMetrics(
    predictions: number[],
    actuals: number[],
    probabilities: number[]
  ): ModelMetrics {
    const tp = predictions.reduce((sum, pred, i) => sum + (pred === 1 && actuals[i] === 1 ? 1 : 0), 0)
    const tn = predictions.reduce((sum, pred, i) => sum + (pred === 0 && actuals[i] === 0 ? 1 : 0), 0)
    const fp = predictions.reduce((sum, pred, i) => sum + (pred === 1 && actuals[i] === 0 ? 1 : 0), 0)
    const fn = predictions.reduce((sum, pred, i) => sum + (pred === 0 && actuals[i] === 1 ? 1 : 0), 0)

    const accuracy = (tp + tn) / (tp + tn + fp + fn)
    const precision = tp / (tp + fp) || 0
    const recall = tp / (tp + fn) || 0
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0

    // Calculate precision, recall, f1 for negative class
    const negativePrecision = tn / (tn + fn) || 0
    const negativeRecall = tn / (tn + fp) || 0
    const negativeF1 = 2 * (negativePrecision * negativeRecall) / (negativePrecision + negativeRecall) || 0

    // Support (number of samples in each class)
    const positiveSupport = actuals.filter(a => a === 1).length
    const negativeSupport = actuals.filter(a => a === 0).length

    // Macro averages (unweighted)
    const macroPrecision = (precision + negativePrecision) / 2
    const macroRecall = (recall + negativeRecall) / 2
    const macroF1 = (f1Score + negativeF1) / 2

    // Weighted averages
    const total = positiveSupport + negativeSupport
    const weightedPrecision = (precision * positiveSupport + negativePrecision * negativeSupport) / total
    const weightedRecall = (recall * positiveSupport + negativeRecall * negativeSupport) / total
    const weightedF1 = (f1Score * positiveSupport + negativeF1 * negativeSupport) / total

    // Calculate ROC AUC if probabilities are provided
    let rocAuc: number | undefined
    if (probabilities.length === actuals.length) {
      rocAuc = this.calculateROCAUC(actuals, probabilities)
    }

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: { truePositive: tp, trueNegative: tn, falsePositive: fp, falseNegative: fn },
      rocAuc,
      classificationReport: {
        positive: { precision, recall, f1Score, support: positiveSupport },
        negative: { precision: negativePrecision, recall: negativeRecall, f1Score: negativeF1, support: negativeSupport },
        macro: { precision: macroPrecision, recall: macroRecall, f1Score: macroF1 },
        weighted: { precision: weightedPrecision, recall: weightedRecall, f1Score: weightedF1 }
      }
    }
  }

  static calculateROCAUC(actuals: number[], probabilities: number[]): number {
    // Sort by probability descending
    const sorted = actuals
      .map((actual, i) => ({ actual, prob: probabilities[i] }))
      .sort((a, b) => b.prob - a.prob)

    const positives = actuals.filter(a => a === 1).length
    const negatives = actuals.length - positives

    if (positives === 0 || negatives === 0) return 0.5

    let tpr = 0 // True Positive Rate
    let fpr = 0 // False Positive Rate
    let auc = 0
    let tp = 0
    let fp = 0

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].actual === 1) {
        tp++
      } else {
        fp++
      }

      // When we reach a new threshold, calculate AUC contribution
      if (i === sorted.length - 1 || sorted[i].prob !== sorted[i + 1].prob) {
        const newTPR = tp / positives
        const newFPR = fp / negatives
        auc += (newFPR - fpr) * (tpr + newTPR) / 2
        tpr = newTPR
        fpr = newFPR
      }
    }

    return auc
  }

  static performCrossValidation(
    features: number[][],
    labels: number[],
    folds = 5
  ): { logistic: number[]; tree: number[]; ensemble: number[] } {
    const scores: { logistic: number[]; tree: number[]; ensemble: number[] } = { 
      logistic: [], 
      tree: [], 
      ensemble: [] 
    }
    const foldSize = Math.floor(features.length / folds)

    for (let fold = 0; fold < folds; fold++) {
      const testStart = fold * foldSize
      const testEnd = fold === folds - 1 ? features.length : testStart + foldSize

      const testFeatures = features.slice(testStart, testEnd)
      const testLabels = labels.slice(testStart, testEnd)
      const trainFeatures = [...features.slice(0, testStart), ...features.slice(testEnd)]
      const trainLabels = [...labels.slice(0, testStart), ...labels.slice(testEnd)]

      // Train models
      const lr = new LogisticRegression(0.01, 300)
      const dt = new DecisionTree(4, 3)

      lr.train(trainFeatures, trainLabels)
      dt.train(trainFeatures, trainLabels)

      // Calculate accuracies
      let lrCorrect = 0, dtCorrect = 0, ensembleCorrect = 0

      for (let i = 0; i < testFeatures.length; i++) {
        const lrPred = lr.predict(testFeatures[i]) > 0.5 ? 1 : 0
        const dtPred = dt.predict(testFeatures[i]) > 0.5 ? 1 : 0
        const ensemblePred = (lr.predict(testFeatures[i]) + dt.predict(testFeatures[i])) / 2 > 0.5 ? 1 : 0

        if (lrPred === testLabels[i]) lrCorrect++
        if (dtPred === testLabels[i]) dtCorrect++
        if (ensemblePred === testLabels[i]) ensembleCorrect++
      }

      scores.logistic.push(lrCorrect / testFeatures.length)
      scores.tree.push(dtCorrect / testFeatures.length)
      scores.ensemble.push(ensembleCorrect / testFeatures.length)
    }

    return scores
  }

  static generateLearningCurve(
    features: number[][],
    labels: number[],
    trainSizes = [0.1, 0.2, 0.4, 0.6, 0.8, 1.0]
  ): Array<{ trainSize: number; trainScore: number; valScore: number }> {
    const curve = []
    
    for (const size of trainSizes) {
      const sampleSize = Math.floor(features.length * size)
      if (sampleSize < 10) continue

      const sampleFeatures = features.slice(0, sampleSize)
      const sampleLabels = labels.slice(0, sampleSize)

      // Use 80/20 split for train/val
      const splitIndex = Math.floor(sampleSize * 0.8)
      const trainFeatures = sampleFeatures.slice(0, splitIndex)
      const trainLabels = sampleLabels.slice(0, splitIndex)
      const valFeatures = sampleFeatures.slice(splitIndex)
      const valLabels = sampleLabels.slice(splitIndex)

      if (trainFeatures.length === 0 || valFeatures.length === 0) continue

      // Train ensemble model
      const lr = new LogisticRegression(0.01, 300)
      const dt = new DecisionTree(4, 3)
      lr.train(trainFeatures, trainLabels)
      dt.train(trainFeatures, trainLabels)

      // Calculate train accuracy
      let trainCorrect = 0
      for (let i = 0; i < trainFeatures.length; i++) {
        const pred = (lr.predict(trainFeatures[i]) + dt.predict(trainFeatures[i])) / 2 > 0.5 ? 1 : 0
        if (pred === trainLabels[i]) trainCorrect++
      }

      // Calculate validation accuracy
      let valCorrect = 0
      for (let i = 0; i < valFeatures.length; i++) {
        const pred = (lr.predict(valFeatures[i]) + dt.predict(valFeatures[i])) / 2 > 0.5 ? 1 : 0
        if (pred === valLabels[i]) valCorrect++
      }

      curve.push({
        trainSize: sampleSize,
        trainScore: trainCorrect / trainFeatures.length,
        valScore: valCorrect / valFeatures.length
      })
    }

    return curve
  }

  static assessDataQuality(habits: Habit[], logs: HabitLog[]): ModelPerformanceReport['dataQuality'] {
    const { features, labels } = createTrainingData(habits, logs)
    
    if (features.length === 0) {
      return {
        totalSamples: 0,
        classBalance: { positive: 0, negative: 0 },
        missingValueRate: 0,
        outlierRate: 0
      }
    }

    const positive = labels.filter(l => l === 1).length
    const negative = labels.length - positive

    // Calculate missing value rate (features with 0 values in contextual data)
    let missingCount = 0
    let totalFeatures = 0
    
    for (const feature of features) {
      for (let i = 5; i < 13; i++) { // Contextual features (mood, sleep, energy, stress, weather)
        totalFeatures++
        if (feature[i] === 0.5) missingCount++ // Default values indicate missing data
      }
    }

    const missingValueRate = totalFeatures > 0 ? missingCount / totalFeatures : 0

    // Simple outlier detection using IQR method on success rates
    const successRates = features.map(f => f[f.length - 6]) // Success rate feature
    successRates.sort((a, b) => a - b)
    
    const q1 = successRates[Math.floor(successRates.length * 0.25)]
    const q3 = successRates[Math.floor(successRates.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    
    const outliers = successRates.filter(sr => sr < lowerBound || sr > upperBound).length
    const outlierRate = outliers / successRates.length

    return {
      totalSamples: features.length,
      classBalance: { positive, negative },
      missingValueRate,
      outlierRate
    }
  }
}
