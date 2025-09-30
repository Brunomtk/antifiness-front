"use client"

import { useUser } from "./use-user"
import { useClient } from "./use-client"
import { usePlan } from "./use-plan"
import { useDiet } from "./use-diet"
import { useWorkoutList } from "./use-workout" // Changed useWorkout() to useWorkoutList() since useWorkout requires an id parameter
import { useCourse } from "./use-course"
import { useFeedback } from "./use-feedback"
import { useReport } from "./use-report"
import { useDashboard } from "./use-dashboard"
import { useNotification } from "./use-notification"
import { useMessage } from "./use-message"

export function useApp() {
  const user = useUser()
  const client = useClient()
  const plan = usePlan()
  const diet = useDiet()
  const workout = useWorkoutList()
  const course = useCourse()
  const feedback = useFeedback()
  const report = useReport()
  const dashboard = useDashboard()
  const notification = useNotification()
  const message = useMessage()

  return {
    user,
    client,
    plan,
    diet,
    workout,
    course,
    feedback,
    report,
    dashboard,
    notification,
    message,
  }
}
