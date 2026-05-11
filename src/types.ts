export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  points: number;
  totalEarnings: number;
  referralCode: string;
  referredBy: string | null;
  joinedAt: string;
  profilePic: string | null;
  referralEarnings?: number;
  referralCountL1?: number;
  referralCountL2?: number;
  referralCountL3?: number;
  paymentInfo: {
    method: string;
    details: string;
  };
  streak: number;
  lastCheckIn: string | null;
  isAdmin?: boolean;
  role?: 'user' | 'admin' | 'super_admin';
  spins: number; // Available spins
  lastIp?: string;
  userAgent?: string;
  location?: {
    city: string;
    country: string;
    region: string;
  };
  deviceInfo?: {
    browser: string;
    os: string;
    isMobile: boolean;
  };
}

export interface WheelSlice {
  label: string;
  value: number;
  probability: number; // 0 to 1
  color: string;
}

export interface LuckyWheelConfig {
  slices: WheelSlice[];
  spinsPerTask: number;
  spinsPerQuiz: number;
}

export type AdminPermission = 
  | 'manage_tasks' 
  | 'manage_withdrawals' 
  | 'manage_users' 
  | 'manage_banners' 
  | 'manage_settings' 
  | 'manage_support'
  | 'manage_admins';

export interface AdminRecord {
  id?: string;
  email: string;
  role: 'super_admin' | 'moderator';
  permissions: AdminPermission[];
  addedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of options
}

export interface Quiz {
  id?: string;
  title: string;
  description: string;
  points: number;
  questions: QuizQuestion[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string; // ISO date string
}

export interface UserQuizAttempt {
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  pointsEarned: number;
}

export interface AppSettings {
  conversionRate: number;
  pointsPerUsd: number;
  pointsPerBdt: number;
  minWithdrawal: number;
  referralBonus: number;
  withdrawalNotice?: string;
  dailyBonusBase: number;
  videoPointReward: number;
  bannerAutoSlide: boolean;
  bannerInterval: number;
  supportEmail: string;
  mlmLevel1Percent: number;
  mlmLevel2Percent: number;
  mlmLevel3Percent: number;
  adsterraDashboardBanner: string;
  adsterraTaskPopupBanner: string;
  promotionalText: string;
  termsAndConditions: string;
  privacyPolicy: string;
  footerAbout: string;
  luckyWheel: LuckyWheelConfig;
}

export interface Banner {
  id?: string;
  title?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  type?: 'promotion' | 'offer' | 'news' | 'alert';
  clickCount?: number;
  orderIndex: number;
  isActive: boolean;
}

export type EarningType = 'daily_bonus' | 'quiz' | 'video' | 'referral' | 'survey' | 'task' | 'offer' | 'wheel';

export type TaskType = 'visit_website' | 'watch_youtube' | 'submit_form' | 'download_app';
export type TaskStatus = 'pending' | 'started' | 'completed' | 'failed';

export interface Task {
  id?: string;
  title: string;
  description: string;
  type: TaskType;
  targetUrl: string;
  requiredSeconds: number;
  rewardPoints: number;
  isActive: boolean;
  category?: string;
  expiresAt?: string; // ISO date string
}

export interface UserTask {
  userId: string;
  taskId: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  watchedSeconds?: number;
}

export interface EarningLog {
  id?: string;
  userId: string;
  taskName: string;
  points: number;
  timestamp: string;
  type: EarningType;
  sourceUserId?: string; // UID of the user who generated this commission
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id?: string;
  userId: string;
  points: number; // The points being spent
  amount: number; // Converted monetary value
  currency: string; // The currency selected (e.g., BDT, USD)
  status: WithdrawalStatus;
  method: string;
  details: string;
  timestamp: string;
  reason?: string;
}

export type ChatStatus = 'open' | 'closed';

export interface SupportChat {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  accountNumber: string;
  lastMessage: string;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  text: string;
  imageUrl?: string;
  timestamp: string;
}
