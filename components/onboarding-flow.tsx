"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Brain, BarChart3, Target, Zap, CheckCircle } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
}

const ONBOARDING_STEPS = [
  {
    title: "Welcome to Habit Tracker",
    subtitle: "Your AI-powered habit building companion",
    content: (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-4">
          <p className="text-lg text-foreground">
            Build lasting habits with the power of artificial intelligence and data-driven insights.
          </p>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">AI Predictions</div>
                <div className="text-sm text-muted-foreground">Get personalized habit recommendations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Performance Tracking</div>
                <div className="text-sm text-muted-foreground">Visualize your progress with detailed analytics</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium">Streak Building</div>
                <div className="text-sm text-muted-foreground">Maintain momentum with streak tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Create Your First Habit",
    subtitle: "Start building positive routines",
    content: (
      <div className="space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-4">
          <p className="text-center text-foreground">
            Habits are the building blocks of lasting change. Let's start with something simple and achievable.
          </p>

          <div className="space-y-3">
            <h4 className="font-medium">Popular starter habits:</h4>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Drink 8 glasses of water</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Health & Fitness
                  </Badge>
                </div>
                <Badge variant="outline">Morning</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Read for 15 minutes</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Learning
                  </Badge>
                </div>
                <Badge variant="outline">Evening</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Write in journal</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Mindfulness
                  </Badge>
                </div>
                <Badge variant="outline">Anytime</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Start small and be specific. "Exercise for 10 minutes" is better than "Get fit."
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "How It Works",
    subtitle: "Your daily habit journey",
    content: (
      <div className="space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-4">
          <p className="text-center text-foreground">Here's how Habit Tracker helps you build lasting routines:</p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Daily Logging</h4>
                <p className="text-sm text-muted-foreground">
                  Quick and easy habit tracking with optional mood logging
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">AI Predictions</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations for which habits to focus on today
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Track Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Visualize your streaks, success rates, and long-term trends
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <strong>The AI learns from your patterns</strong> and gets better at predicting which habits you're most
              likely to complete each day.
            </p>
          </div>
        </div>
      </div>
    ),
  },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  const step = ONBOARDING_STEPS[currentStep]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <p className="text-muted-foreground">{step.subtitle}</p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[400px] flex items-center">{step.content}</div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : index < currentStep ? "bg-primary/50" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
