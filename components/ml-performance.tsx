"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Target, Clock, Zap } from "lucide-react"
import type { MLModelState } from "@/types/habit"

interface MLPerformanceProps {
  modelState: MLModelState
  isTraining: boolean
}

export function MLPerformance({ modelState, isTraining }: MLPerformanceProps) {
  if (isTraining) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse text-blue-500" />
            AI Model Training...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Analyzing your habit patterns...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!modelState.isTrained) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-gray-400" />
            AI Model Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="mb-2">
              <Badge variant="secondary">Not Ready</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Need at least 10 habit logs to train AI model
            </p>
            <p className="text-xs text-muted-foreground">
              Current logs: {modelState.totalSamples}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const accuracyPercentage = Math.round((modelState.accuracy || 0) * 100)
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600"
    if (accuracy >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 80) return "Excellent"
    if (accuracy >= 70) return "Good"
    if (accuracy >= 60) return "Fair"
    return "Improving"
  }

  const topFeatures = modelState.featureImportance 
    ? Object.entries(modelState.featureImportance)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, importance]) => ({
          name: name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
          importance: importance * 100
        }))
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          AI Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </div>

        {/* Accuracy Metric */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Prediction Accuracy</span>
            </div>
            <span className={`text-sm font-bold ${getAccuracyColor(accuracyPercentage)}`}>
              {accuracyPercentage}%
            </span>
          </div>
          <Progress value={accuracyPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {getAccuracyLevel(accuracyPercentage)} - Based on {modelState.totalSamples} training samples
          </p>
        </div>

        {/* Training Data */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Training Data</span>
          </div>
          <span className="text-sm font-semibold">{modelState.totalSamples} samples</span>
        </div>

        {/* Last Training */}
        {modelState.trainingDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Last Updated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                Math.round((modelState.trainingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                'day'
              )}
            </span>
          </div>
        )}

        {/* Feature Importance */}
        {topFeatures.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Prediction Factors</h4>
            <div className="space-y-2">
              {topFeatures.map((feature, index) => (
                <div key={feature.name} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">
                    {feature.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={feature.importance} 
                      className="h-1 w-16" 
                    />
                    <span className="text-xs w-8 text-right">
                      {Math.round(feature.importance)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Using ensemble of Logistic Regression and Decision Tree models
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
