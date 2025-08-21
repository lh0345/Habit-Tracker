"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { HabitPerformance } from "@/lib/performance-utils"

interface HabitPerformanceChartProps {
  performance: HabitPerformance
  timeframe: "week" | "month"
}

export function HabitPerformanceChart({ performance, timeframe }: HabitPerformanceChartProps) {
  const data = timeframe === "week" ? performance.weeklyData : performance.monthlyData

  const chartData = data.map((item, index) => ({
    name: timeframe === "week" ? new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }) : item.date,
    successRate: Math.round(item.successRate * 100),
    completed: item.completed,
    total: item.total,
  }))

  const chartConfig = {
    successRate: {
      label: "Success Rate",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{performance.habit.name}</CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Success Rate: {Math.round(performance.successRate * 100)}%</span>
          <span>Streak: {performance.currentStreak} days</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name) => [`${value}%`, "Success Rate"]}
            />
            <Bar dataKey="successRate" fill="var(--color-successRate)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
