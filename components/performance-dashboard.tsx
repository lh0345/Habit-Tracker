"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calendar, TrendingUp } from "lucide-react"
import type { Habit, HabitLog } from "@/types/habit"
import { getHabitPerformance, getOverallPerformance } from "@/lib/performance-utils"
import { PerformanceOverview } from "@/components/performance-overview"
import { HabitPerformanceChart } from "@/components/habit-performance-chart"
import { StreakCalendar } from "@/components/streak-calendar"

interface PerformanceDashboardProps {
  habits: Habit[]
  logs: HabitLog[]
}

export const PerformanceDashboard = memo(function PerformanceDashboard({ habits, logs }: PerformanceDashboardProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week")
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  const overallPerformance = useMemo(() => getOverallPerformance(habits, logs), [habits, logs])
  const habitPerformances = useMemo(() => 
    habits.map((habit) => getHabitPerformance(habit, logs)), 
    [habits, logs]
  )

  const handleTimeframeChange = useCallback((newTimeframe: "week" | "month") => {
    setTimeframe(newTimeframe)
  }, [])

  const handleHabitSelect = useCallback((habitId: string | null) => {
    setSelectedHabit(habitId)
  }, [])

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>Performance Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Add some habits and start logging to see your performance!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>Performance Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PerformanceOverview performance={overallPerformance} />
        </CardContent>
      </Card>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance Charts
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Streak Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={timeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange("week")}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeframeChange("month")}
            >
              Last 4 Weeks
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {habitPerformances.map((performance) => (
              <HabitPerformanceChart key={performance.habit.id} performance={performance} timeframe={timeframe} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => (
              <StreakCalendar key={habit.id} habitId={habit.id} habitName={habit.name} logs={logs} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habitPerformances.map((performance) => (
              <div key={performance.habit.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{performance.habit.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{performance.habit.category}</Badge>
                    <Badge variant="outline">{performance.habit.preferredTime}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold text-primary">{Math.round(performance.successRate * 100)}%</div>
                    <div className="text-muted-foreground">Success</div>
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{performance.currentStreak}</div>
                    <div className="text-muted-foreground">Streak</div>
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{performance.longestStreak}</div>
                    <div className="text-muted-foreground">Best</div>
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{performance.totalLogs}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
)