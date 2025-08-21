"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImportExportDialog } from "@/components/import-export-dialog"
import { Database, Trash2, AlertTriangle } from "lucide-react"
import type { AppData } from "@/types/habit"

interface DataManagementSectionProps {
  data: AppData
  onImport: (data: AppData) => void
  onClearData: () => void
}

export function DataManagementSection({ data, onImport, onClearData }: DataManagementSectionProps) {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  const handleClearData = () => {
    onClearData()
    setShowClearConfirmation(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle>Data Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{data.habits.length}</div>
            <div className="text-muted-foreground">Active Habits</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-primary">{data.logs.length}</div>
            <div className="text-muted-foreground">Total Logs</div>
          </div>
        </div>

        <div className="space-y-2">
          <ImportExportDialog currentData={data} onImport={onImport} />

          <Dialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-destructive border-destructive bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
              </DialogHeader>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-3">
                  <p>
                    This will permanently delete all your habits ({data.habits.length}) and logs ({data.logs.length}).
                    This action cannot be undone.
                  </p>
                  <p className="font-medium">Consider exporting your data first as a backup.</p>
                  <div className="flex gap-2">
                    <Button onClick={handleClearData} variant="destructive" size="sm">
                      Delete Everything
                    </Button>
                    <Button onClick={() => setShowClearConfirmation(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Export creates a JSON backup file</p>
          <p>• Import replaces all current data</p>
          <p>• Data is stored locally in your browser</p>
        </div>
      </CardContent>
    </Card>
  )
}
