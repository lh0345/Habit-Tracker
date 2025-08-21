"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HabitLog } from "@/types/habit"
import { formatDate } from "@/lib/habit-utils"

interface StreakCalendarProps {
  habitId: string
  habitName: string
  logs: HabitLog[]
}

export function StreakCalendar({ habitId, habitName, logs }: StreakCalendarProps) {
  const habitLogs = logs.filter((log) => log.habitId === habitId)

  // Get last 28 days (4 weeks)
  const days: Array<{
    date: string
    completed: boolean | null
    dayName: string
    dayNumber: number
  }> = []

  for (let i = 27; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = formatDate(date)

    const log = habitLogs.find((l) => l.date === dateString)

    days.push({
      date: dateString,
      completed: log ? log.completed : null,
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
    })
  }

  // Group by weeks
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const getStatusColor = (completed: boolean | null) => {
    if (completed === null) return "bg-gray-100 dark:bg-gray-800"
    if (completed) return "bg-green-500"
    return "bg-red-500"
  }

  const getStatusText = (completed: boolean | null) => {
    if (completed === null) return "No data"
    if (completed) return "Completed"
    return "Skipped"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{habitName} - Last 4 Weeks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 aspect-square flex flex-col items-center justify-center text-xs rounded-md relative group cursor-pointer"
                  style={{
                    backgroundColor:
                      day.completed === null
                        ? "hsl(var(--muted))"
                        : day.completed
                          ? "hsl(var(--chart-1))"
                          : "hsl(var(--destructive))",
                  }}
                >
                  <div className="text-white font-medium">{day.dayNumber}</div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {day.dayName} {day.dayNumber}: {getStatusText(day.completed)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }}></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--destructive))" }}></div>
            <span>Skipped</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--muted))" }}></div>
            <span>No data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
