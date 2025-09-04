"use client"

import type React from "react"

import { UserProvider } from "./user-context"
import { NotificationProvider } from "./notification-context"
import { DietProvider } from "./diet-context"
import { WorkoutProvider } from "./workout-context"
import { CourseProvider } from "./course-context"
import { FeedbackProvider } from "./feedback-context"
import { MessageProvider } from "./message-context"
import { ReportProvider } from "./report-context"
import { DashboardProvider } from "./dashboard-context"
import { ClientProvider } from "./client-context"
import { PlanProvider } from "./plan-context"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ClientProvider>
          <PlanProvider>
            <DietProvider>
              <WorkoutProvider>
                <CourseProvider>
                  <FeedbackProvider>
                    <MessageProvider>
                      <ReportProvider>
                        <DashboardProvider>{children}</DashboardProvider>
                      </ReportProvider>
                    </MessageProvider>
                  </FeedbackProvider>
                </CourseProvider>
              </WorkoutProvider>
            </DietProvider>
          </PlanProvider>
        </ClientProvider>
      </NotificationProvider>
    </UserProvider>
  )
}
