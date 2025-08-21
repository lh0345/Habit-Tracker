"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, Calendar, Zap } from "lucide-react"
import type { Prediction } from "@/types/habit"

interface PredictionSectionProps {
  predictions: {
    today: Prediction[]
    tomorrow: Prediction[]
  }
  isTraining: boolean
  onRetrain: () => void
}

function PredictionCard({ prediction, isToday }: { prediction: Prediction; isToday: boolean }) {
  const probabilityPercent = Math.round(prediction.probability * 100)
  const confidenceColor = {
    high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{prediction.habitName}</h4>
          <Badge variant="secondary" className="text-xs mt-1">
            {prediction.category}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{probabilityPercent}%</div>
          <Badge className={confidenceColor[prediction.confidence]} variant="secondary">
            {prediction.confidence}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{Math.round(prediction.successRate * 100)}% success</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>{prediction.streak} day streak</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{prediction.explanation}</p>
    </div>
  )
}

export function PredictionSection({ predictions, isTraining, onRetrain }: PredictionSectionProps) {
  const hasPredictions = predictions.today.length > 0 || predictions.tomorrow.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>AI Predictions</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onRetrain} disabled={isTraining}>
            {isTraining ? "Training..." : "Retrain"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isTraining ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Training AI model...</p>
          </div>
        ) : !hasPredictions ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Add some habits and log them to get AI predictions!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.today.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Today's Top Predictions</h3>
                </div>
                <div className="space-y-3">
                  {predictions.today.map((prediction) => (
                    <PredictionCard key={prediction.habitId} prediction={prediction} isToday={true} />
                  ))}
                </div>
              </div>
            )}

            {predictions.tomorrow.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Tomorrow's Top Predictions</h3>
                </div>
                <div className="space-y-3">
                  {predictions.tomorrow.map((prediction) => (
                    <PredictionCard key={prediction.habitId} prediction={prediction} isToday={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
