// Client Stats
export interface ClientStats {
  totalClients: number
  activeClients: number
  inactiveClients: number
  pausedClients: number
  newClientsThisMonth: number
  clientsWithGoalsAchieved: number
  averageWeightLoss: number
  retentionRate: number
  monthlyGrowthPercentage: number
  clientsWithNutritionist: number
  clientsWithActivePlan: number
  clientsByActivityLevel: Record<string, number> | null
  clientsByGoalType: Record<string, number> | null
  clientsByAgeGroup: Record<string, number> | null
}

// Course Stats
export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  completionRate: number
  popularCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  monthlyEnrollments: Array<{
    month: string
    count: number
  }>
}

// Diet Stats
export interface DietStats {
  totalDiets: number
  activeDiets: number
  completedDiets: number
  pausedDiets: number
  cancelledDiets: number
  activeDietsPercentage: number
  completedDietsPercentage: number
  pausedDietsPercentage: number
  cancelledDietsPercentage: number
  averageCaloriesPerDiet: number
  averageMealsPerDiet: number
  averageCompletionRate: number
  totalMeals: number
  completedMeals: number
  mealCompletionPercentage: number
  averageWeightLoss: number
  averageEnergyLevel: number
  averageSatisfactionLevel: number
  dietsThisMonth: number
  dietsLastMonth: number
  monthlyGrowth: number
}

// Feedback Stats
export interface FeedbackStats {
  totalFeedbacks: number
  pendingFeedbacks: number
  resolvedFeedbacks: number
  averageRating: number
  feedbacksByType: Record<string, number>
  feedbacksByCategory: Record<string, number>
  feedbacksByStatus: Record<string, number>
}

// User Stats
export interface UserStats {
  totalUsers: number
  totalAdmins: number
  totalClients: number
  activeUsers: number
  inactiveUsers: number
  pendingUsers: number
  newUsersThisMonth: number
  verifiedAdmins: number
  clientsWithNutritionist: number
  growthPercentage: number
}

// Workout Stats
export interface WorkoutStats {
  totalExercises: number
  activeExercises: number
  totalWorkouts: number
  completedWorkouts: number
  templateWorkouts: number
  completionRate: number
  totalDuration: number
  totalCalories: number
  averageRating: number
  personalRecords: number
  workoutsByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  muscleGroupDistribution: Array<{
    muscleGroup: string
    count: number
    percentage: number
  }>
}

// Combined Stats
export interface DashboardStats {
  clients: ClientStats
  courses: CourseStats
  diets: DietStats
  feedbacks: FeedbackStats
  users: UserStats
  workouts: WorkoutStats
}

export interface StatsFilters {
  empresaId?: number
  clientId?: number
  dateFrom?: Date
  dateTo?: Date
}
