"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Brain, BarChart3, FileText } from "lucide-react"

interface WelcomeScreenProps {
  onStartOnboarding: () => void
  onSkipOnboarding: () => void
}

export function WelcomeScreen({ onStartOnboarding, onSkipOnboarding }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Welcome to Habit Tracker</CardTitle>
            <p className="text-muted-foreground text-lg">Build lasting habits with AI-powered insights</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Brain className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Smart Predictions</div>
                <div className="text-sm text-muted-foreground">
                  AI learns your patterns and suggests the best habits to focus on
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Detailed Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Track streaks, success rates, and visualize your progress
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Data Ownership</div>
                <div className="text-sm text-muted-foreground">
                  Your data stays local with easy import/export options
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={onStartOnboarding} className="w-full" size="lg">
              Take the Tour
            </Button>
            <Button onClick={onSkipOnboarding} variant="outline" className="w-full bg-transparent">
              Skip and Start Using
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            The tour takes about 2 minutes and helps you get the most out of Habit Tracker
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
