"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Clock } from "lucide-react"
import type { Habit, HabitLog, HabitStats } from "@/types/habit"
import { calculateHabitStats, isHabitLoggedToday } from "@/lib/habit-utils"

interface HabitListProps {
  habits: Habit[]
  logs: HabitLog[]
  onLogHabit: (habitId: string, completed: boolean, mood?: HabitLog["mood"]) => void
}

const TIME_COLORS = {
  morning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  afternoon: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  evening: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  anytime: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

function HabitCard({
  habit,
  stats,
  isLoggedToday,
  onLogHabit,
}: {
  habit: Habit
  stats: HabitStats
  isLoggedToday: boolean
  onLogHabit: (habitId: string, completed: boolean) => void
}) {
  const todayLog = isLoggedToday

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{habit.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{habit.category}</Badge>
              <Badge className={TIME_COLORS[habit.preferredTime]}>
                <Clock className="w-3 h-3 mr-1" />
                {habit.preferredTime}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">{stats.currentStreak}</div>
              <div className="text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">{Math.round(stats.successRate * 100)}%</div>
              <div className="text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">{stats.totalLogs}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onLogHabit(habit.id, true)}
              variant={todayLog ? "default" : "outline"}
              size="sm"
              className="flex-1"
              disabled={todayLog}
            >
              <Check className="w-4 h-4 mr-1" />
              {todayLog ? "Completed" : "Complete"}
            </Button>
            <Button
              onClick={() => onLogHabit(habit.id, false)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={todayLog}
            >
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HabitList({ habits, logs, onLogHabit }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No habits yet. Add your first habit to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const stats = calculateHabitStats(habit, logs)
        const loggedToday = isHabitLoggedToday(habit.id, logs)

        return (
          <HabitCard key={habit.id} habit={habit} stats={stats} isLoggedToday={loggedToday} onLogHabit={onLogHabit} />
        )
      })}
    </div>
  )
}
