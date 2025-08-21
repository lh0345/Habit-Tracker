"use client"

import { useState, useEffect, useCallback } from "react"
import type { Habit, HabitLog, Prediction, MLModelState } from "@/types/habit"
import { predictionEngine } from "@/lib/prediction-engine"

export const usePredictions = (habits: Habit[], logs: HabitLog[]) => {
  const [predictions, setPredictions] = useState<{
    today: Prediction[]
    tomorrow: Prediction[]
  }>({ today: [], tomorrow: [] })
  const [isTraining, setIsTraining] = useState(false)
  const [modelState, setModelState] = useState<MLModelState>({ 
    isTrained: false, 
    totalSamples: 0 
  })
  const [lastTrainingDate, setLastTrainingDate] = useState<Date | null>(null)

  const trainAndPredict = useCallback(async () => {
    if (habits.length === 0) {
      setPredictions({ today: [], tomorrow: [] })
      setModelState({ isTrained: false, totalSamples: 0 })
      return
    }

    setIsTraining(true)

    try {
      // Train the model (this runs synchronously but we simulate async for UX)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const newModelState = predictionEngine.train(habits, logs)
      setModelState(newModelState)
      
      const newPredictions = predictionEngine.getTopPredictions(habits, logs, 3)
      setPredictions(newPredictions)
      setLastTrainingDate(new Date())
    } catch (error) {
      console.error("Prediction failed:", error)
      setPredictions({ today: [], tomorrow: [] })
      setModelState({ isTrained: false, totalSamples: logs.length })
    } finally {
      setIsTraining(false)
    }
  }, [habits, logs])

  // Retrain when data changes
  useEffect(() => {
    trainAndPredict()
  }, [trainAndPredict])

  // Auto-retrain daily
  useEffect(() => {
    const checkForRetraining = () => {
      if (!lastTrainingDate) return

      const now = new Date()
      const hoursSinceTraining = (now.getTime() - lastTrainingDate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceTraining >= 24) {
        trainAndPredict()
      }
    }

    const interval = setInterval(checkForRetraining, 60 * 60 * 1000) // Check every hour
    return () => clearInterval(interval)
  }, [lastTrainingDate, trainAndPredict])

  return {
    predictions,
    isTraining,
    modelState,
    retrain: trainAndPredict,
  }
}
