"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { predictionEngine } from "@/lib/prediction-engine"
import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, LabelList } from "recharts"
import { ModelVisualizations } from "@/components/model-visualizations"

interface AdvancedMLDashboardProps {
  className?: string
}

export function AdvancedMLDashboard({ className }: AdvancedMLDashboardProps) {
  const performanceReport = predictionEngine.getPerformanceReport()

  const metricsData = useMemo(() => {
    if (!performanceReport) return null

    const { logisticRegression: lr, decisionTree: dt, ensemble } = performanceReport

    return {
      models: [
        { name: "Logistic Regression", accuracy: lr.accuracy, precision: lr.precision, recall: lr.recall, f1Score: lr.f1Score },
        { name: "Decision Tree", accuracy: dt.accuracy, precision: dt.precision, recall: dt.recall, f1Score: dt.f1Score },
        { name: "Ensemble", accuracy: ensemble.accuracy, precision: ensemble.precision, recall: ensemble.recall, f1Score: ensemble.f1Score },
      ],
      confusionMatrix: ensemble.confusionMatrix,
      classificationReport: ensemble.classificationReport,
      crossValidation: {
        mean: performanceReport.crossValidationScores.reduce((a, b) => a + b, 0) / performanceReport.crossValidationScores.length,
        std: Math.sqrt(performanceReport.crossValidationScores.reduce((acc, val, _, arr) => {
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length
          return acc + Math.pow(val - mean, 2)
        }, 0) / performanceReport.crossValidationScores.length),
        scores: performanceReport.crossValidationScores
      },
      featureImportance: Object.entries(performanceReport.featureImportance)
        .map(([name, importance]) => ({ name: formatFeatureName(name), importance }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10),
      learningCurve: performanceReport.learningCurve,
      dataQuality: performanceReport.dataQuality
    }
  }, [performanceReport])

  if (!performanceReport || !metricsData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Advanced ML Analytics</CardTitle>
          <CardDescription>
            Train the model with more data to see detailed performance metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No model performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 0.8) return "default"
    if (score >= 0.6) return "secondary"
    return "destructive"
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <Card>
        <CardHeader>
          <CardTitle>Advanced ML Performance Analytics</CardTitle>
          <CardDescription>
            Comprehensive model evaluation and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="confusion">Confusion</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
              <TabsTrigger value="visualizations">ROC/PR Curves</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metricsData.models.map((model) => (
                  <Card key={model.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accuracy</span>
                        <Badge variant={getScoreBadgeVariant(model.accuracy)}>
                          {(model.accuracy * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Precision</span>
                        <Badge variant={getScoreBadgeVariant(model.precision)}>
                          {(model.precision * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Recall</span>
                        <Badge variant={getScoreBadgeVariant(model.recall)}>
                          {(model.recall * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">F1-Score</span>
                        <Badge variant={getScoreBadgeVariant(model.f1Score)}>
                          {(model.f1Score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-Validation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Mean Accuracy</div>
                      <div className={`text-2xl font-bold ${getScoreColor(metricsData.crossValidation.mean)}`}>
                        {(metricsData.crossValidation.mean * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Standard Deviation</div>
                      <div className="text-2xl font-bold">
                        ±{(metricsData.crossValidation.std * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Individual Fold Scores</div>
                    <div className="flex gap-2">
                      {metricsData.crossValidation.scores.map((score, i) => (
                        <Badge key={i} variant={getScoreBadgeVariant(score)}>
                          {(score * 100).toFixed(1)}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1-Score</TableHead>
                    <TableHead>ROC AUC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.models.map((model) => {
                    const rocAuc = model.name === "Ensemble" ? performanceReport.ensemble.rocAuc : 
                                   model.name === "Logistic Regression" ? performanceReport.logisticRegression.rocAuc :
                                   performanceReport.decisionTree.rocAuc
                    return (
                      <TableRow key={model.name}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell className={getScoreColor(model.accuracy)}>
                          {(model.accuracy * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className={getScoreColor(model.precision)}>
                          {(model.precision * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className={getScoreColor(model.recall)}>
                          {(model.recall * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className={getScoreColor(model.f1Score)}>
                          {(model.f1Score * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {rocAuc ? (rocAuc * 100).toFixed(2) + "%" : "N/A"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <Card>
                <CardHeader>
                  <CardTitle>Classification Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Precision</TableHead>
                        <TableHead>Recall</TableHead>
                        <TableHead>F1-Score</TableHead>
                        <TableHead>Support</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Successful</TableCell>
                        <TableCell>{(metricsData.classificationReport.positive.precision * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.positive.recall * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.positive.f1Score * 100).toFixed(2)}%</TableCell>
                        <TableCell>{metricsData.classificationReport.positive.support}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Failed</TableCell>
                        <TableCell>{(metricsData.classificationReport.negative.precision * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.negative.recall * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.negative.f1Score * 100).toFixed(2)}%</TableCell>
                        <TableCell>{metricsData.classificationReport.negative.support}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Macro Avg</TableCell>
                        <TableCell>{(metricsData.classificationReport.macro.precision * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.macro.recall * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.macro.f1Score * 100).toFixed(2)}%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Weighted Avg</TableCell>
                        <TableCell>{(metricsData.classificationReport.weighted.precision * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.weighted.recall * 100).toFixed(2)}%</TableCell>
                        <TableCell>{(metricsData.classificationReport.weighted.f1Score * 100).toFixed(2)}%</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="confusion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Confusion Matrix</CardTitle>
                  <CardDescription>
                    Model predictions vs actual outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="text-center">
                      <div className="text-sm font-medium mb-2">Predicted</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs">Success</div>
                        <div className="text-xs">Failure</div>
                      </div>
                    </div>
                    <div></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded text-center">
                        <div className="text-lg font-bold">{metricsData.confusionMatrix.truePositive}</div>
                        <div className="text-xs">True Positive</div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900 p-4 rounded text-center">
                        <div className="text-lg font-bold">{metricsData.confusionMatrix.falseNegative}</div>
                        <div className="text-xs">False Negative</div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900 p-4 rounded text-center">
                        <div className="text-lg font-bold">{metricsData.confusionMatrix.falsePositive}</div>
                        <div className="text-xs">False Positive</div>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded text-center">
                        <div className="text-lg font-bold">{metricsData.confusionMatrix.trueNegative}</div>
                        <div className="text-xs">True Negative</div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-xs transform -rotate-90 whitespace-nowrap">Actual</div>
                      <div className="text-xs mt-4">Success</div>
                      <div className="text-xs">Failure</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Importance</CardTitle>
                  <CardDescription>
                    Top features influencing model predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={metricsData.featureImportance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Curve</CardTitle>
                  <CardDescription>
                    Model performance vs training set size
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={metricsData.learningCurve}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trainSize" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="trainScore" stroke="#8884d8" name="Training Score" />
                      <Line type="monotone" dataKey="valScore" stroke="#82ca9d" name="Validation Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Samples</span>
                        <Badge variant="outline">{metricsData.dataQuality.totalSamples}</Badge>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Missing Values</span>
                        <span className="text-sm">{(metricsData.dataQuality.missingValueRate * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={metricsData.dataQuality.missingValueRate * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Outliers</span>
                        <span className="text-sm">{(metricsData.dataQuality.outlierRate * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={metricsData.dataQuality.outlierRate * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Class Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Successful", value: metricsData.dataQuality.classBalance.positive },
                            { name: "Failed", value: metricsData.dataQuality.classBalance.negative }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent?: number }) => 
                            `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                          }
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="visualizations" className="space-y-4">
              <ModelVisualizations 
                logisticMetrics={performanceReport.logisticRegression}
                treeMetrics={performanceReport.decisionTree}
                ensembleMetrics={performanceReport.ensemble}
                predictions={[]} // Would need to store these from training
                actuals={[]} // Would need to store these from training  
                probabilities={[]} // Would need to store these from training
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function formatFeatureName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
