export interface Course {
  id: string;
  userId: string;
  entityId?: string | null;
  name: string;
  modality: string;
  cityOrPlatform?: string | null;
  startDate: string;
  endDate: string;
  totalHours: number;
  schedule?: string | null;
  hourlyRate?: number | null;
  totalPrice?: number | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  entity?: TrainingEntity | null;
  sessions?: Session[];
}

export interface Session {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  content?: string | null;
  status: string;
  course?: Course;
}

export interface CourseOffer {
  id: string;
  userId: string;
  entityId?: string | null;
  courseName: string;
  startDate: string;
  endDate: string;
  schedule?: string | null;
  totalHours: number;
  hourlyRate?: number | null;
  totalPrice?: number | null;
  modality: string;
  cityOrPlatform?: string | null;
  status: string;
  aiRecommendation?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  entity?: TrainingEntity | null;
}

export interface TrainingEntity {
  id: string;
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface TeacherConfig {
  id: string;
  userId: string;
  maxHoursPerWeek: number;
  availableDays: string;
  minHourlyRate: number;
  preferredModality: string;
  dailyMaxHours: number;
}

export interface AIRecommendation {
  decision: "aceptar" | "aceptar_con_ajustes" | "no_aceptar";
  confidence: number;
  explanation: string;
  conflicts: string[];
  weeklyHoursImpact: number;
}

export interface DashboardStats {
  upcomingCourses: number;
  weeklyHours: number;
  monthlyHours: number;
  monthlyIncome: number;
  yearlyIncome: number;
  conflicts: ConflictAlert[];
}

export interface ConflictAlert {
  type: "overlap" | "daily_excess" | "weekly_excess";
  message: string;
  date: string;
  sessions: string[];
}

export interface MonthlyStats {
  month: string;
  hours: number;
  income: number;
  courses: number;
}
