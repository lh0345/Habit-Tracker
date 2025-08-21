"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Smile, Meh, Frown, Heart } from "lucide-react"
import type { Habit, HabitLog } from "@/types/habit"
import { isHabitLoggedToday } from "@/lib/habit-utils"

interface QuickLogSectionProps {
  habits: Habit[]
  logs: HabitLog[]
  onLogHabit: (habitId: string, completed: boolean, mood?: HabitLog["mood"]) => void
}

const MOOD_OPTIONS = [
  { value: "great", label: "Great", icon: Heart, color: "text-green-600" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-600" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-600" },
  { value: "poor", label: "Poor", icon: Frown, color: "text-red-600" },
] as const

export function QuickLogSection({ habits, logs, onLogHabit }: QuickLogSectionProps) {
  const [selectedMood, setSelectedMood] = useState<HabitLog["mood"]>()

  const unloggedHabits = habits.filter((habit) => !isHabitLoggedToday(habit.id, logs))

  if (unloggedHabits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium text-foreground">All caught up!</p>
            <p className="text-muted-foreground">You've logged all your habits for today.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleLogHabit = (habitId: string, completed: boolean) => {
    onLogHabit(habitId, completed, selectedMood)
    setSelectedMood(undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Log</CardTitle>
        <p className="text-sm text-muted-foreground">
          {unloggedHabits.length} habit{unloggedHabits.length !== 1 ? "s" : ""} remaining today
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">How are you feeling? (optional)</label>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const Icon = mood.icon
              return (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(selectedMood === mood.value ? undefined : mood.value)}
                  className="flex-1"
                >
                  <Icon className={`w-4 h-4 mr-1 ${selectedMood === mood.value ? "" : mood.color}`} />
                  {mood.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Habit Quick Actions */}
        <div className="space-y-3">
          {unloggedHabits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{habit.name}</div>
                <Badge variant="secondary" className="text-xs">
                  {habit.category}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleLogHabit(habit.id, true)}
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleLogHabit(habit.id, false)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
