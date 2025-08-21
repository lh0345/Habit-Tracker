"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useHabitData } from "@/hooks/use-habit-data"
import { usePredictions } from "@/hooks/use-predictions"
import { isDataCorrupted, resetToDefaults } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AddHabitForm } from "@/components/add-habit-form"
import { HabitList } from "@/components/habit-list"
import { QuickLogSection } from "@/components/quick-log-section"
import { PredictionSection } from "@/components/prediction-section"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { DataManagementSection } from "@/components/data-management-section"
import { WelcomeScreen } from "@/components/welcome-screen"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { ErrorFallback } from "@/components/error-components"
import { Home, BarChart3, Brain, Settings } from "lucide-react"

export default function HabitTracker() {
  const { data, isLoading, addHabit, logHabit, importAppData, clearAllData, completeOnboarding } = useHabitData()
  const { predictions, isTraining, retrain } = usePredictions(data.habits, data.logs)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [dataCorrupted, setDataCorrupted] = useState(false)

  // Check for data corruption on mount
  useEffect(() => {
    if (typeof window !== "undefined" && isDataCorrupted()) {
      setDataCorrupted(true)
    }
  }, [])

  const handleDataReset = useCallback(() => {
    if (resetToDefaults()) {
      setDataCorrupted(false)
      window.location.reload()
    }
  }, [])

  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Memoize expensive calculations
  const quickStats = useMemo(() => ({
    totalHabits: data.habits.length,
    totalLogs: data.logs.length,
    activeHabits: data.habits.filter(h => h.isActive).length
  }), [data.habits, data.logs])

  useEffect(() => {
    if (isDataCorrupted()) {
      // Optionally, you could show a modal or some UI feedback here
      if (confirm("We detected some data corruption. Would you like to reset your data to defaults?")) {
        resetToDefaults()
        window.location.reload()
      }
    }
  }, [])

  if (dataCorrupted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Data Recovery Needed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your habit data appears to be corrupted. This can happen after browser updates or storage issues.
            </p>
            <p className="text-sm text-muted-foreground">
              Click below to reset to a fresh start. Your data will be cleared, but you can always re-import from backups.
            </p>
            <Button onClick={handleDataReset} variant="destructive" className="w-full">
              Reset to Fresh Start
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    )
  }

  if (!data.hasCompletedOnboarding) {
    if (showOnboarding) {
      return (
        <OnboardingFlow
          onComplete={() => {
            completeOnboarding()
            setShowOnboarding(false)
          }}
        />
      )
    }

    return (
      <WelcomeScreen onStartOnboarding={() => setShowOnboarding(true)} onSkipOnboarding={() => completeOnboarding()} />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Habit Tracker</h1>
          <p className="text-muted-foreground text-sm md:text-base">Build lasting habits with AI-powered predictions</p>
        </header>

        <Tabs defaultValue="dashboard" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm">
              <Home className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm">
              <Brain className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm">
              <Settings className="w-4 h-4 sm:w-4 sm:h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
              {/* Left Column - Mobile: Full width, Desktop: 1/3 */}
              <div className="space-y-4 md:space-y-6 lg:col-span-1">
                <AddHabitForm onAddHabit={addHabit} />

                {data.habits.length > 0 && (
                  <QuickLogSection habits={data.habits} logs={data.logs} onLogHabit={logHabit} />
                )}
              </div>

              {/* Middle Column - Mobile: Full width, Desktop: 1/3 */}
              <div className="space-y-4 md:space-y-6 lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Your Habits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HabitList habits={data.habits} logs={data.logs} onLogHabit={logHabit} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Mobile: Full width, Desktop: 1/3 */}
              <div className="space-y-4 md:space-y-6 lg:col-span-1">
                <PredictionSection predictions={predictions} isTraining={isTraining} onRetrain={retrain} />

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-primary">{quickStats.activeHabits}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-primary">{quickStats.totalLogs}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Logs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-primary">
                          {data.logs.length > 0 ? Math.round((data.logs.filter(l => l.completed).length / data.logs.length) * 100) : 0}%
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">Success</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceDashboard habits={data.habits} logs={data.logs} />
          </TabsContent>

          <TabsContent value="predictions">
            <div className="max-w-4xl mx-auto">
              <PredictionSection predictions={predictions} isTraining={isTraining} onRetrain={retrain} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl mx-auto">
              <DataManagementSection data={data} onImport={importAppData} onClearData={clearAllData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
