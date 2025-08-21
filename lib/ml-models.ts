export class LogisticRegression {
  private weights: number[] = []
  private bias = 0
  private learningRate = 0.01
  private iterations = 1000

  constructor(learningRate = 0.01, iterations = 1000) {
    this.learningRate = learningRate
    this.iterations = iterations
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z))))
  }

  train(features: number[][], labels: number[]): void {
    if (features.length === 0) return

    const numFeatures = features[0].length
    this.weights = new Array(numFeatures).fill(0)
    this.bias = 0

    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = features.map((feature) => this.predict(feature))

      // Update weights and bias
      const weightGradients = new Array(numFeatures).fill(0)
      let biasGradient = 0

      for (let i = 0; i < features.length; i++) {
        const error = predictions[i] - labels[i]
        biasGradient += error

        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * features[i][j]
        }
      }

      // Apply gradients
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * weightGradients[j]) / features.length
      }
      this.bias -= (this.learningRate * biasGradient) / features.length
    }
  }

  predict(features: number[]): number {
    const z = features.reduce((sum, feature, i) => sum + feature * this.weights[i], this.bias)
    return this.sigmoid(z)
  }
}

// Simple decision tree node
interface TreeNode {
  featureIndex?: number
  threshold?: number
  prediction?: number
  left?: TreeNode
  right?: TreeNode
  isLeaf: boolean
}

export class DecisionTree {
  private root: TreeNode | null = null
  private maxDepth = 5
  private minSamples = 2

  constructor(maxDepth = 5, minSamples = 2) {
    this.maxDepth = maxDepth
    this.minSamples = minSamples
  }

  private calculateGini(labels: number[]): number {
    if (labels.length === 0) return 0

    const counts = labels.reduce(
      (acc, label) => {
        acc[label] = (acc[label] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const total = labels.length
    let gini = 1

    Object.values(counts).forEach((count) => {
      const probability = count / total
      gini -= probability * probability
    })

    return gini
  }

  private findBestSplit(
    features: number[][],
    labels: number[],
  ): {
    featureIndex: number
    threshold: number
    gini: number
  } | null {
    let bestGini = Number.POSITIVE_INFINITY
    let bestFeatureIndex = -1
    let bestThreshold = 0

    const numFeatures = features[0]?.length || 0

    for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
      const values = features.map((f) => f[featureIndex]).sort((a, b) => a - b)

      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2

        const leftIndices: number[] = []
        const rightIndices: number[] = []

        features.forEach((feature, index) => {
          if (feature[featureIndex] <= threshold) {
            leftIndices.push(index)
          } else {
            rightIndices.push(index)
          }
        })

        if (leftIndices.length === 0 || rightIndices.length === 0) continue

        const leftLabels = leftIndices.map((i) => labels[i])
        const rightLabels = rightIndices.map((i) => labels[i])

        const leftGini = this.calculateGini(leftLabels)
        const rightGini = this.calculateGini(rightLabels)

        const weightedGini = (leftLabels.length * leftGini + rightLabels.length * rightGini) / labels.length

        if (weightedGini < bestGini) {
          bestGini = weightedGini
          bestFeatureIndex = featureIndex
          bestThreshold = threshold
        }
      }
    }

    return bestFeatureIndex >= 0
      ? {
          featureIndex: bestFeatureIndex,
          threshold: bestThreshold,
          gini: bestGini,
        }
      : null
  }

  private buildTree(features: number[][], labels: number[], depth = 0): TreeNode {
    // Check stopping conditions
    if (depth >= this.maxDepth || labels.length < this.minSamples || new Set(labels).size === 1) {
      const prediction = labels.reduce((sum, label) => sum + label, 0) / labels.length
      return { isLeaf: true, prediction }
    }

    const bestSplit = this.findBestSplit(features, labels)

    if (!bestSplit) {
      const prediction = labels.reduce((sum, label) => sum + label, 0) / labels.length
      return { isLeaf: true, prediction }
    }

    const leftIndices: number[] = []
    const rightIndices: number[] = []

    features.forEach((feature, index) => {
      if (feature[bestSplit.featureIndex] <= bestSplit.threshold) {
        leftIndices.push(index)
      } else {
        rightIndices.push(index)
      }
    })

    const leftFeatures = leftIndices.map((i) => features[i])
    const leftLabels = leftIndices.map((i) => labels[i])
    const rightFeatures = rightIndices.map((i) => features[i])
    const rightLabels = rightIndices.map((i) => labels[i])

    return {
      isLeaf: false,
      featureIndex: bestSplit.featureIndex,
      threshold: bestSplit.threshold,
      left: this.buildTree(leftFeatures, leftLabels, depth + 1),
      right: this.buildTree(rightFeatures, rightLabels, depth + 1),
    }
  }

  train(features: number[][], labels: number[]): void {
    if (features.length === 0) return
    this.root = this.buildTree(features, labels)
  }

  predict(features: number[]): number {
    if (!this.root) return 0.5

    let node = this.root

    while (!node.isLeaf) {
      if (node.featureIndex !== undefined && node.threshold !== undefined) {
        if (features[node.featureIndex] <= node.threshold) {
          node = node.left!
        } else {
          node = node.right!
        }
      } else {
        break
      }
    }

    return node.prediction || 0.5
  }
}
