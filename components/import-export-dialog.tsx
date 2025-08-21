"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import type { AppData } from "@/types/habit"
import { exportData, importData } from "@/lib/storage"

interface ImportExportDialogProps {
  currentData: AppData
  onImport: (data: AppData) => void
}

export function ImportExportDialog({ currentData, onImport }: ImportExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importError, setImportError] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<AppData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const jsonData = exportData()
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `habit-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = importData(content)

        // Show confirmation if there's existing data
        if (currentData.habits.length > 0 || currentData.logs.length > 0) {
          setPendingImportData(importedData)
          setShowConfirmation(true)
        } else {
          // No existing data, import directly
          onImport(importedData)
          setImportStatus("success")
          setTimeout(() => {
            setImportStatus("idle")
            setIsOpen(false)
          }, 2000)
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Invalid file format")
        setImportStatus("error")
      }
    }

    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (pendingImportData) {
      onImport(pendingImportData)
      setImportStatus("success")
      setShowConfirmation(false)
      setPendingImportData(null)
      setTimeout(() => {
        setImportStatus("idle")
        setIsOpen(false)
      }, 2000)
    }
  }

  const cancelImport = () => {
    setShowConfirmation(false)
    setPendingImportData(null)
    setImportStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetImport = () => {
    setImportStatus("idle")
    setImportError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download your habits and logs as a JSON file for backup or transfer.
              </p>
              <Button onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a JSON backup file to restore your habits and logs.
              </p>

              {importStatus === "idle" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="import-file"
                  />
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                </div>
              )}

              {importStatus === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Data imported successfully!</AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && (
                <div className="space-y-2">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                  <Button onClick={resetImport} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              )}

              {showConfirmation && pendingImportData && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="space-y-3">
                    <p>
                      This will replace your current data ({currentData.habits.length} habits, {currentData.logs.length}{" "}
                      logs) with the imported data ({pendingImportData.habits.length} habits,{" "}
                      {pendingImportData.logs.length} logs).
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={confirmImport} size="sm" variant="destructive">
                        Replace Data
                      </Button>
                      <Button onClick={cancelImport} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Current Data Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{currentData.habits.length}</div>
                  <div className="text-muted-foreground">Habits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{currentData.logs.length}</div>
                  <div className="text-muted-foreground">Logs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
