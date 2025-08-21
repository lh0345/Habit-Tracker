import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModelMetrics } from '@/lib/model-evaluation'

interface ModelVisualizationsProps {
  logisticMetrics: ModelMetrics
  treeMetrics: ModelMetrics  
  ensembleMetrics: ModelMetrics
  predictions: number[]
  actuals: number[]
  probabilities: number[]
}

export function ModelVisualizations({
  logisticMetrics,
  treeMetrics,
  ensembleMetrics,
  predictions,
  actuals,
  probabilities
}: ModelVisualizationsProps) {
  
  // Generate ROC curve data
  const generateROCCurve = (actuals: number[], probabilities: number[]) => {
    const sorted = actuals
      .map((actual, i) => ({ actual, prob: probabilities[i] }))
      .sort((a, b) => b.prob - a.prob)

    const positives = actuals.filter(a => a === 1).length
    const negatives = actuals.length - positives

    if (positives === 0 || negatives === 0) return []

    const rocPoints = [{ fpr: 0, tpr: 0 }]
    let tp = 0, fp = 0

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].actual === 1) {
        tp++
      } else {
        fp++
      }

      // Add point when threshold changes or at end
      if (i === sorted.length - 1 || sorted[i].prob !== sorted[i + 1].prob) {
        const tpr = tp / positives
        const fpr = fp / negatives
        rocPoints.push({ fpr, tpr })
      }
    }

    return rocPoints
  }

  // Generate Precision-Recall curve data
  const generatePRCurve = (actuals: number[], probabilities: number[]) => {
    const sorted = actuals
      .map((actual, i) => ({ actual, prob: probabilities[i] }))
      .sort((a, b) => b.prob - a.prob)

    const positives = actuals.filter(a => a === 1).length
    if (positives === 0) return []

    const prPoints = []
    let tp = 0, fp = 0

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].actual === 1) {
        tp++
      } else {
        fp++
      }

      if (i === sorted.length - 1 || sorted[i].prob !== sorted[i + 1].prob) {
        const precision = tp / (tp + fp) || 0
        const recall = tp / positives
        prPoints.push({ recall, precision })
      }
    }

    return prPoints
  }

  // Generate prediction confidence distribution
  const generateConfidenceDistribution = (probabilities: number[]) => {
    const bins = Array(10).fill(0)
    
    probabilities.forEach(prob => {
      const binIndex = Math.min(Math.floor(prob * 10), 9)
      bins[binIndex]++
    })

    return bins.map((count, i) => ({
      range: `${i * 10}-${(i + 1) * 10}%`,
      count,
      midpoint: (i + 0.5) / 10
    }))
  }

  const rocData = generateROCCurve(actuals, probabilities)
  const prData = generatePRCurve(actuals, probabilities)
  const confidenceData = generateConfidenceDistribution(probabilities)

  const rocAUC = ensembleMetrics.rocAuc || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ROC Curve</CardTitle>
          <p className="text-sm text-muted-foreground">
            Receiver Operating Characteristic (AUC = {(rocAUC * 100).toFixed(1)}%)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fpr" 
                type="number" 
                domain={[0, 1]}
                label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="tpr"
                type="number"
                domain={[0, 1]}
                label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  (value * 100).toFixed(1) + '%', 
                  name === 'tpr' ? 'True Positive Rate' : 'False Positive Rate'
                ]}
              />
              <Line 
                type="linear" 
                dataKey="tpr" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
                name="ROC Curve"
              />
              {/* Diagonal reference line */}
              <Line 
                type="linear"
                data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                dataKey="tpr"
                stroke="#ccc"
                strokeDasharray="5 5"
                dot={false}
                name="Random Classifier"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precision-Recall Curve</CardTitle>
          <p className="text-sm text-muted-foreground">
            Precision vs Recall Trade-off
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="recall" 
                type="number" 
                domain={[0, 1]}
                label={{ value: 'Recall', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="precision"
                type="number"
                domain={[0, 1]}
                label={{ value: 'Precision', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [(value * 100).toFixed(1) + '%']}
              />
              <Line 
                type="linear" 
                dataKey="precision" 
                stroke="#82ca9d" 
                strokeWidth={2}
                dot={false}
                name="PR Curve"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Confidence Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of model prediction probabilities
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="range"
                label={{ value: 'Confidence Range', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Predictions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Performance comparison across all models
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-medium">Metric</div>
              <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                <span>Logistic</span>
                <span>Tree</span>
                <span>Ensemble</span>
              </div>
            </div>
            
            {[
              { name: 'Accuracy', values: [logisticMetrics.accuracy, treeMetrics.accuracy, ensembleMetrics.accuracy] },
              { name: 'Precision', values: [logisticMetrics.precision, treeMetrics.precision, ensembleMetrics.precision] },
              { name: 'Recall', values: [logisticMetrics.recall, treeMetrics.recall, ensembleMetrics.recall] },
              { name: 'F1-Score', values: [logisticMetrics.f1Score, treeMetrics.f1Score, ensembleMetrics.f1Score] },
            ].map(metric => (
              <div key={metric.name} className="grid grid-cols-2 gap-4 text-sm">
                <div>{metric.name}</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {metric.values.map((value, i) => {
                    const isHighest = value === Math.max(...metric.values)
                    return (
                      <span 
                        key={i} 
                        className={isHighest ? 'font-bold text-green-600' : ''}
                      >
                        {(value * 100).toFixed(1)}%
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
