import { z } from "zod"

// Habit validation schema
export const HabitSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Habit name is required").max(100, "Habit name too long"),
  category: z.string().min(1, "Category is required").max(50, "Category too long"),
  preferredTime: z.enum(["morning", "afternoon", "evening", "anytime"], {
    errorMap: () => ({ message: "Invalid preferred time" })
  }),
  createdAt: z.date(),
  isActive: z.boolean()
})

// Habit log validation schema
export const HabitLogSchema = z.object({
  id: z.string().min(1, "ID is required"),
  habitId: z.string().min(1, "Habit ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  completed: z.boolean(),
  mood: z.enum(["great", "good", "okay", "poor"]).optional(),
  loggedAt: z.date()
})

// App data validation schema
export const AppDataSchema = z.object({
  habits: z.array(HabitSchema).default([]),
  logs: z.array(HabitLogSchema).default([]),
  hasCompletedOnboarding: z.boolean().default(false),
  lastTrainingDate: z.date().optional()
})

// Form validation schemas
export const AddHabitFormSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100, "Habit name too long"),
  category: z.string().min(1, "Category is required").max(50, "Category too long"),
  preferredTime: z.enum(["morning", "afternoon", "evening", "anytime"])
})

export const ImportDataSchema = z.object({
  habits: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    preferredTime: z.enum(["morning", "afternoon", "evening", "anytime"]),
    createdAt: z.string().or(z.date()),
    isActive: z.boolean()
  })).default([]),
  logs: z.array(z.object({
    id: z.string(),
    habitId: z.string(),
    date: z.string(),
    completed: z.boolean(),
    mood: z.enum(["great", "good", "okay", "poor"]).optional(),
    loggedAt: z.string().or(z.date())
  })).default([]),
  hasCompletedOnboarding: z.boolean().default(false)
})

// Export types
export type Habit = z.infer<typeof HabitSchema>
export type HabitLog = z.infer<typeof HabitLogSchema>
export type AppData = z.infer<typeof AppDataSchema>
export type AddHabitForm = z.infer<typeof AddHabitFormSchema>
export type ImportData = z.infer<typeof ImportDataSchema>

// Validation helper functions
export const validateHabit = (data: unknown) => {
  return HabitSchema.safeParse(data)
}

export const validateHabitLog = (data: unknown) => {
  return HabitLogSchema.safeParse(data)
}

export const validateAppData = (data: unknown) => {
  return AppDataSchema.safeParse(data)
}

export const validateImportData = (data: unknown) => {
  return ImportDataSchema.safeParse(data)
}
