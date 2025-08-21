"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Database, Trash2, Download } from "lucide-react"
import { generateSampleData, addSampleDataToExisting } from "@/lib/sample-data-generator"
import type { AppData } from "@/types/habit"

interface DevToolsProps {
  data: AppData
  onImport: (data: AppData) => void
  onClearData: () => void
}

export function DevTools({ data, onImport, onClearData }: DevToolsProps) {
  const [numDays, setNumDays] = useState(30)

  const handleGenerateSampleData = () => {
    const sampleData = generateSampleData(numDays)
    const newData: AppData = {
      habits: sampleData.habits,
      logs: sampleData.logs,
      hasCompletedOnboarding: true
    }
    onImport(newData)
  }

  const handleAddSampleData = () => {
    const combinedData = addSampleDataToExisting(data.habits, data.logs, numDays)
    const newData: AppData = {
      ...data,
      habits: combinedData.habits,
      logs: combinedData.logs,
      hasCompletedOnboarding: true
    }
    onImport(newData)
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habit-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Developer Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Data Stats */}
        <div className="flex gap-4">
          <Badge variant="outline">
            {data.habits.length} Habits
          </Badge>
          <Badge variant="outline">
            {data.logs.length} Logs
          </Badge>
        </div>

        {/* Sample Data Generation */}
        <div className="space-y-2">
          <Label htmlFor="numDays">Generate Sample Data (Days)</Label>
          <Input
            id="numDays"
            type="number"
            min="7"
            max="365"
            value={numDays}
            onChange={(e) => setNumDays(parseInt(e.target.value) || 30)}
            className="w-24"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateSampleData} size="sm">
            Replace with Sample Data
          </Button>
          <Button onClick={handleAddSampleData} variant="outline" size="sm">
            Add Sample Data
          </Button>
        </div>

        {/* Data Export */}
        <Button onClick={handleExportData} variant="outline" size="sm" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export Current Data
        </Button>

        {/* Clear Data */}
        <Button onClick={onClearData} variant="destructive" size="sm" className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Data
        </Button>

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Sample Data:</strong> Generates realistic habit patterns with contextual data (mood, sleep, weather, etc.)</p>
          <p><strong>ML Training:</strong> Requires at least 10 logs to train models</p>
          <p><strong>Export:</strong> Download your data for backup or analysis</p>
        </div>
      </CardContent>
    </Card>
  )
}
