"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Zap, Calendar } from "lucide-react"

interface PerformanceOverviewProps {
  performance: {
    totalHabits: number
    averageSuccessRate: number
    totalLogs: number
    completedLogs: number
    activeStreaks: number
    longestStreak: number
  }
}

export function PerformanceOverview({ performance }: PerformanceOverviewProps) {
  const completionRate = performance.totalLogs > 0 ? (performance.completedLogs / performance.totalLogs) * 100 : 0

  const metrics = [
    {
      title: "Average Success Rate",
      value: `${Math.round(performance.averageSuccessRate * 100)}%`,
      icon: TrendingUp,
      color:
        performance.averageSuccessRate > 0.7
          ? "text-green-600"
          : performance.averageSuccessRate > 0.4
            ? "text-yellow-600"
            : "text-red-600",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      icon: Target,
      color: completionRate > 70 ? "text-green-600" : completionRate > 40 ? "text-yellow-600" : "text-red-600",
    },
    {
      title: "Active Streaks",
      value: `${performance.activeStreaks}/${performance.totalHabits}`,
      icon: Zap,
      color: "text-orange-600",
    },
    {
      title: "Longest Streak",
      value: `${performance.longestStreak} days`,
      icon: Calendar,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
