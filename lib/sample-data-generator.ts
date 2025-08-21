import type { Habit, HabitLog } from "@/types/habit"
import { generateId } from "@/lib/habit-utils"

/**
 * Generate sample habit tracking data for testing ML models
 * This creates realistic patterns that would occur with actual users
 */
export function generateSampleData(numDays = 30): { habits: Habit[], logs: HabitLog[] } {
  const categories = ["Health", "Learning", "Productivity", "Wellness", "Exercise"]
  const habitNames = [
    "Morning Meditation", "Read for 30min", "Write in Journal", 
    "Drink 8 Glasses Water", "Go to Gym",
    "Learn New Language", "Take Vitamins", "No Social Media Before Noon"
  ]

  // Generate habits
  const habits: Habit[] = Array.from({ length: 6 }, (_, i) => ({
    id: generateId(),
    name: habitNames[i % habitNames.length],
    category: categories[Math.floor(i / 2) % categories.length],
    preferredTime: ["morning", "afternoon", "evening", "anytime"][i % 4] as any,
    createdAt: new Date(Date.now() - (numDays - Math.floor(i / 2)) * 24 * 60 * 60 * 1000),
    isActive: true
  }))

  // Generate realistic logs
  const logs: HabitLog[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - numDays)

  for (let day = 0; day < numDays; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + day)
    const dateString = currentDate.toISOString().split('T')[0]

    // Simulate different user behaviors
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const dayOfWeek = currentDate.getDay()

    // Base completion rate with weekly patterns
    let baseCompletionRate = 0.6
    if (isWeekend) baseCompletionRate *= 0.8 // Slightly lower on weekends
    if (dayOfWeek === 1) baseCompletionRate *= 0.7 // Monday blues

    for (const habit of habits) {
      // Skip habits that haven't been created yet
      if (currentDate < habit.createdAt) continue

      // Different habits have different success patterns
      let habitMultiplier = 1
      switch (habit.name) {
        case "Morning Meditation":
          habitMultiplier = isWeekend ? 0.9 : 1.1 // Better on weekdays
          break
        case "Go to Gym":
          habitMultiplier = isWeekend ? 1.3 : 0.8 // Better on weekends
          break
        case "Read for 30min":
          habitMultiplier = isWeekend ? 1.2 : 0.9 // Better on weekends
          break
      }

      // Time-based patterns
      let timeMultiplier = 1
      switch (habit.preferredTime) {
        case "morning":
          timeMultiplier = isWeekend ? 0.8 : 1.1
          break
        case "evening":
          timeMultiplier = isWeekend ? 1.1 : 0.9
          break
      }

      // Progressive improvement over time (learning effect)
      const progressMultiplier = 1 + (day / numDays) * 0.2

      const finalProbability = Math.min(
        baseCompletionRate * habitMultiplier * timeMultiplier * progressMultiplier,
        0.95
      )

      // Only log some days (not every day)
      if (Math.random() < 0.85) { // 85% chance to log
        const completed = Math.random() < finalProbability

        // Generate contextual data with realistic patterns
        const moods = ["poor", "okay", "good", "great"] as const
        const moodWeights = completed ? [0.05, 0.15, 0.4, 0.4] : [0.2, 0.4, 0.3, 0.1]
        let cumulativeWeight = 0
        const randomMood = Math.random()
        let selectedMood: typeof moods[number] = "okay"
        
        for (let i = 0; i < moods.length; i++) {
          cumulativeWeight += moodWeights[i]
          if (randomMood < cumulativeWeight) {
            selectedMood = moods[i]
            break
          }
        }

        // Sleep hours (affecting performance)
        const baseSleep = 7.5
        const sleepVariation = (Math.random() - 0.5) * 3
        const sleepHours = Math.max(4, Math.min(11, baseSleep + sleepVariation))

        // Energy and stress correlate with mood and sleep
        const energyLevel = Math.max(1, Math.min(5, Math.round(
          (selectedMood === "great" ? 4.5 : selectedMood === "good" ? 3.5 : 
           selectedMood === "okay" ? 2.5 : 1.5) + 
          (sleepHours - 7) * 0.3 + (Math.random() - 0.5)
        ))) as 1 | 2 | 3 | 4 | 5

        const stressLevel = Math.max(1, Math.min(5, Math.round(
          (selectedMood === "poor" ? 4 : selectedMood === "okay" ? 3 : 
           selectedMood === "good" ? 2 : 1) +
          (isWeekend ? -0.5 : 0.5) + (Math.random() - 0.5)
        ))) as 1 | 2 | 3 | 4 | 5

        // Weather (seasonal patterns)
        const weatherOptions = ["sunny", "cloudy", "rainy", "snowy"] as const
        const seasonalWeights = [0.4, 0.35, 0.2, 0.05] // More sunny days
        let cumulativeWeatherWeight = 0
        const randomWeather = Math.random()
        let selectedWeather: typeof weatherOptions[number] = "sunny"
        
        for (let i = 0; i < weatherOptions.length; i++) {
          cumulativeWeatherWeight += seasonalWeights[i]
          if (randomWeather < cumulativeWeatherWeight) {
            selectedWeather = weatherOptions[i]
            break
          }
        }

        logs.push({
          id: generateId(),
          habitId: habit.id,
          date: dateString,
          completed,
          mood: selectedMood,
          sleepHours: Math.round(sleepHours * 2) / 2, // Round to nearest 0.5
          energyLevel,
          stressLevel,
          weather: selectedWeather,
          loggedAt: new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
    }
  }

  return { habits, logs }
}

/**
 * Add sample data to existing habits and logs
 * Useful for testing ML features without losing real user data
 */
export function addSampleDataToExisting(
  existingHabits: Habit[], 
  existingLogs: HabitLog[], 
  numDays = 30
): { habits: Habit[], logs: HabitLog[] } {
  const { habits: sampleHabits, logs: sampleLogs } = generateSampleData(numDays)
  
  return {
    habits: [...existingHabits, ...sampleHabits],
    logs: [...existingLogs, ...sampleLogs]
  }
}
