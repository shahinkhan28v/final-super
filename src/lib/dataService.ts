import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  increment, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  setDoc,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebaseUtils';
import { EarningLog, EarningType, WithdrawalRequest, UserProfile, AppSettings, Banner, Task, UserTask, TaskStatus, SupportChat, ChatMessage, AdminRecord, AdminPermission, Quiz, QuizQuestion, UserQuizAttempt } from '../types';

function clean(obj: any): any {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

export async function updateUserDeviceInfo(userId: string, data: { lastIp?: string, userAgent?: string, deviceInfo?: any }) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, clean(data));
  } catch (error) {
    console.error("Update Device Info Error:", error);
  }
}

export async function addEarnings(userId: string, taskName: string, points: number, type: EarningType, sourceUserId?: string) {
  const earningPath = 'earnings';
  try {
    const numPoints = Math.max(0, Number(points));
    if (isNaN(numPoints) || numPoints === 0) return;

    const userRef = doc(db, 'users', userId);
    
    // Update user points
    await updateDoc(userRef, {
      points: increment(numPoints),
      totalEarnings: increment(numPoints)
    });

    // Logging and MLM (secondary)
    try {
      await addDoc(collection(db, earningPath), {
        userId,
        taskName,
        points: numPoints,
        timestamp: new Date().toISOString(),
        type,
        sourceUserId
      });
      
      if (type !== 'referral') {
        distributeMLMCommission(userId, numPoints).catch(() => {});
      }
    } catch (e) {
      console.warn("Log/MLM error:", e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, earningPath);
  }
}

export async function requestWithdrawal(userId: string, points: number, amount: number, currency: string, method: string, details: string) {
  const withdrawalPath = 'withdrawals';
  try {
    // Check if user has enough points
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data() as UserProfile;
    
    if (userData.points < points) {
      throw new Error('Insufficient points');
    }

    const numPoints = Number(points);
    const request: WithdrawalRequest = {
      userId,
      points: numPoints,
      amount,
      currency,
      status: 'pending',
      method,
      details,
      timestamp: new Date().toISOString()
    };
    
    // 1. Add withdrawal request
    await addDoc(collection(db, withdrawalPath), request);
    
    // 2. Deduct points
    await updateDoc(userRef, {
      points: increment(-numPoints)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, withdrawalPath);
  }
}

export async function getUserEarnings(userId: string) {
  const path = 'earnings';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EarningLog));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getUserWithdrawals(userId: string) {
  const path = 'withdrawals';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToAppSettings(callback: (settings: AppSettings) => void) {
  const path = 'settings';
  const ref = doc(db, path, 'global');
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as AppSettings;
      callback({
        ...DEFAULT_SETTINGS,
        ...data,
        luckyWheel: {
          ...DEFAULT_SETTINGS.luckyWheel,
          ...(data.luckyWheel || {})
        }
      });
    } else {
      callback(DEFAULT_SETTINGS);
    }
  });
}

export function subscribeToUserEarnings(userId: string, callback: (earnings: EarningLog[]) => void) {
  const path = 'earnings';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EarningLog)));
  });
}

export function subscribeToUserWithdrawals(userId: string, callback: (withdrawals: WithdrawalRequest[]) => void) {
  const path = 'withdrawals';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest)));
  });
}

export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
  });
}

export function subscribeToAllWithdrawals(callback: (withdrawals: WithdrawalRequest[]) => void) {
  const q = query(collection(db, 'withdrawals'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest)));
  });
}

export function subscribeToSupportChats(callback: (chats: SupportChat[]) => void) {
  const q = query(collection(db, 'support_chats'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChat)));
  });
}

export function subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'support_chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
  });
}

export async function processDailyCheckIn(userId: string) {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data() as UserProfile;
    
    const now = new Date();
    const lastCheckIn = userData.lastCheckIn ? new Date(userData.lastCheckIn) : null;
    
    let isEligible = false;
    if (!lastCheckIn) {
      isEligible = true;
    } else {
      const diffDays = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 1) isEligible = true;
    }

    if (isEligible) {
      const bonus = 50; // Daily bonus points
      await addEarnings(userId, 'Daily Check-in', bonus, 'daily_bonus');
      await updateDoc(userRef, {
        lastCheckIn: now.toISOString(),
        streak: increment(1)
      });
      return bonus;
    }
    return 0;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
  }
}

export async function getAllUsers() {
  const path = 'users';
  try {
    const q = query(collection(db, path), orderBy('joinedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllWithdrawals() {
  const path = 'withdrawals';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateWithdrawalStatus(id: string, status: 'approved' | 'rejected', reason?: string) {
  const path = 'withdrawals';
  try {
    const ref = doc(db, path, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const withdrawal = snap.data() as WithdrawalRequest;

    await updateDoc(ref, clean({ status, updatedAt: new Date().toISOString(), reason }));

    if (status === 'rejected') {
      // Return points to user
      const userRef = doc(db, 'users', withdrawal.userId);
      const pointsToRefund = Number(withdrawal.points);
      await updateDoc(userRef, {
        points: increment(pointsToRefund)
      });
      
      // Add a refund log
      await addDoc(collection(db, 'earnings'), {
        userId: withdrawal.userId,
        taskName: 'Withdrawal Refunded',
        points: pointsToRefund,
        timestamp: new Date().toISOString(),
        type: 'task'
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  const path = 'settings';
  try {
    const ref = doc(db, path, 'global');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AppSettings;
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        luckyWheel: {
          ...DEFAULT_SETTINGS.luckyWheel,
          ...(data.luckyWheel || {})
        }
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  conversionRate: 100,
  pointsPerUsd: 100,
  pointsPerBdt: 1,
  minWithdrawal: 500,
  referralBonus: 500,
  dailyBonusBase: 50,
  videoPointReward: 10,
  bannerAutoSlide: true,
  bannerInterval: 7,
  supportEmail: 'support@pointhub.com',
  mlmLevel1Percent: 10,
  mlmLevel2Percent: 5,
  mlmLevel3Percent: 3,
  adsterraDashboardBanner: '',
  adsterraTaskPopupBanner: '',
  promotionalText: 'Join our official Telegram for gift codes!',
  termsAndConditions: 'Rules of use...',
  privacyPolicy: 'Your data is safe...',
  footerAbout: 'Pointhub is the leading micro-task reward platform.',
  luckyWheel: {
    spinsPerTask: 1,
    spinsPerQuiz: 2,
    slices: [
      { label: '5 PTS', value: 5, probability: 0.3, color: '#4f46e5' },
      { label: '10 PTS', value: 10, probability: 0.25, color: '#7c3aed' },
      { label: '20 PTS', value: 20, probability: 0.15, color: '#2563eb' },
      { label: '50 PTS', value: 50, probability: 0.1, color: '#059669' },
      { label: '100 PTS', value: 100, probability: 0.05, color: '#d97706' },
      { label: 'Better luck!', value: 0, probability: 0.15, color: '#64748b' }
    ]
  }
};

export async function updateAppSettings(settings: AppSettings) {
  const path = 'settings';
  try {
    const ref = doc(db, path, 'global');
    await setDoc(ref, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isAdmin, role: isAdmin ? 'admin' : 'user' });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'users');
  }
}

// --- Admin Management Methods ---

export async function getAllAdmins() {
  const path = 'admins';
  try {
    const q = query(collection(db, path), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAdminByEmail(email: string) {
  const path = 'admins';
  try {
    const q = query(collection(db, path), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as AdminRecord;
  } catch (error) {
    return null;
  }
}

export async function addAdmin(admin: Omit<AdminRecord, 'id'>) {
  const path = 'admins';
  try {
    const adminId = admin.email.toLowerCase();
    const ref = doc(db, path, adminId);
    const snap = await getDoc(ref);
    if (snap.exists()) throw new Error('Admin already exists');

    await setDoc(ref, clean(admin));
    
    // Update user if they exist
    const userQ = query(collection(db, 'users'), where('email', '==', admin.email.toLowerCase()));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      await updateDoc(doc(db, 'users', userSnap.docs[0].id), { 
        isAdmin: true,
        role: admin.role === 'super_admin' ? 'super_admin' : 'admin'
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAdmin(id: string, admin: Partial<AdminRecord>) {
  const path = 'admins';
  try {
    const ref = doc(db, path, id);
    await updateDoc(ref, clean(admin));
    
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminRecord;
      const userQ = query(collection(db, 'users'), where('email', '==', data.email));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        await updateDoc(doc(db, 'users', userSnap.docs[0].id), { 
          role: data.role === 'super_admin' ? 'super_admin' : 'admin'
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAdmin(id: string) {
  const path = 'admins';
  try {
    const ref = doc(db, path, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminRecord;
      const userQ = query(collection(db, 'users'), where('email', '==', data.email));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        await updateDoc(doc(db, 'users', userSnap.docs[0].id), { 
          isAdmin: false,
          role: 'user'
        });
      }
    }
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Quiz Methods ---

export function subscribeToAllQuizzes(callback: (quizzes: Quiz[]) => void) {
  const path = 'quizzes';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
  });
}

export async function getAllQuizzes(onlyActive = false) {
  const path = 'quizzes';
  try {
    let q = query(collection(db, path), orderBy('createdAt', 'desc'));
    if (onlyActive) q = query(q, where('isActive', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addQuiz(quiz: Omit<Quiz, 'id'>) {
  const path = 'quizzes';
  try {
    await addDoc(collection(db, path), clean(quiz));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateQuiz(id: string, quiz: Partial<Quiz>) {
  const path = 'quizzes';
  try {
    await updateDoc(doc(db, path, id), clean(quiz));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteQuiz(id: string) {
  const path = 'quizzes';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getUserQuizAttempts(userId: string) {
  const path = `users/${userId}/quiz_attempts`;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => doc.data() as UserQuizAttempt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitQuizAttempt(userId: string, quiz: Quiz, score: number) {
  const attemptPath = `users/${userId}/quiz_attempts`;
  try {
    const pointsEarned = Math.floor((score / quiz.questions.length) * quiz.points);
    const attempt: UserQuizAttempt = {
      userId,
      quizId: quiz.id!,
      score,
      totalQuestions: quiz.questions.length,
      completedAt: new Date().toISOString(),
      pointsEarned
    };

    await setDoc(doc(db, attemptPath, quiz.id!), attempt);
    
    // Grant spins
    const settings = await getAppSettings();
    const spinsToGrant = settings.luckyWheel?.spinsPerQuiz || 0;
    if (spinsToGrant > 0) {
       await updateDoc(doc(db, 'users', userId), {
         spins: increment(spinsToGrant)
       });
    }

    if (pointsEarned > 0) {
      await addEarnings(userId, `Completed quiz: ${quiz.title}`, Number(pointsEarned), 'quiz');
    }
    
    return attempt;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, attemptPath);
  }
}

export async function useLuckySpin(userId: string) {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data() as UserProfile;

    if (userData.spins < 1) {
      throw new Error('No spins available');
    }

    const settings = await getAppSettings();
    const { slices } = settings.luckyWheel;

    // Weighted random selection
    const r = Math.random();
    let cumulative = 0;
    let selectedSlice = slices[slices.length - 1];

    for (const slice of slices) {
      cumulative += slice.probability;
      if (r <= cumulative) {
        selectedSlice = slice;
        break;
      }
    }

    // Update user: deduct 1 spin, add points if won
    await updateDoc(userRef, {
      spins: increment(-1)
    });

    if (selectedSlice.value > 0) {
      await addEarnings(userId, 'Lucky Wheel Win', Number(selectedSlice.value), 'wheel');
    }

    return {
      success: true,
      slice: selectedSlice,
      remainingSpins: userData.spins - 1
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
    throw error;
  }
}

export async function getAdminStats() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const earningsSnap = await getDocs(collection(db, 'earnings'));
    const withdrawalsSnap = await getDocs(collection(db, 'withdrawals'));

    const totalUsers = usersSnap.size;
    let totalPointsInCirculation = 0;
    usersSnap.forEach(doc => {
      totalPointsInCirculation += (doc.data() as UserProfile).points;
    });

    let todayEarnings = 0;
    const today = new Date().toISOString().split('T')[0];
    earningsSnap.forEach(doc => {
      const data = doc.data() as any;
      if (data.timestamp.startsWith(today)) {
        todayEarnings += data.points;
      }
    });

    let pendingWithdrawals = 0;
    withdrawalsSnap.forEach(doc => {
      if ((doc.data() as WithdrawalRequest).status === 'pending') {
        pendingWithdrawals++;
      }
    });

    return {
      totalUsers,
      totalPointsInCirculation,
      todayEarnings,
      pendingWithdrawals
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'stats');
  }
}

export async function getAllBanners() {
  const path = 'banners';
  try {
    const q = query(collection(db, path), orderBy('orderIndex', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addBanner(banner: Omit<Banner, 'id'>) {
  const path = 'banners';
  try {
    await addDoc(collection(db, path), clean(banner));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  const path = 'banners';
  try {
    const ref = doc(db, path, id);
    await updateDoc(ref, clean(banner));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function incrementBannerClick(id: string) {
  const path = 'banners';
  try {
    const { increment } = await import('firebase/firestore');
    const ref = doc(db, path, id);
    await updateDoc(ref, { clickCount: increment(1) });
  } catch (error) {
    console.error("Error incrementing banner click:", error);
  }
}

export async function deleteBanner(id: string) {
  const path = 'banners';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Task Methods ---

export function subscribeToAllTasks(callback: (tasks: Task[]) => void) {
  const path = 'tasks';
  const q = query(collection(db, path), orderBy('category', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
  });
}

export async function getAllTasks(onlyActive = false) {
  const path = 'tasks';
  try {
    let q = query(collection(db, path));
    if (onlyActive) {
      q = query(collection(db, path), where('isActive', '==', true));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addTask(task: Omit<Task, 'id'>) {
  const path = 'tasks';
  try {
    await addDoc(collection(db, path), clean(task));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(id: string, task: Partial<Task>) {
  const path = 'tasks';
  try {
    const ref = doc(db, path, id);
    await updateDoc(ref, clean(task));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(id: string) {
  const path = 'tasks';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getUserTasks(userId: string) {
  const path = `users/${userId}/tasks`;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => doc.data() as UserTask);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function startUserTask(userId: string, taskId: string) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const ref = doc(db, 'users', userId, 'tasks', taskId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        userId,
        taskId,
        status: 'started',
        startedAt: new Date().toISOString(),
        watchedSeconds: 0
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function verifyUserTask(userId: string, task: Task) {
  const path = `users/${userId}/tasks/${task.id!}`;
  try {
    const ref = doc(db, 'users', userId, 'tasks', task.id!);
    const snap = await getDoc(ref);
    const data = snap.data() as UserTask;

    if (!data || data.status === 'completed') return { success: false, message: 'Already completed or not started' };

    // Simulating verification logic
    // In a real app, you'd check timers, server logic, etc.
    const now = new Date();
    const startedAt = new Date(data.startedAt!);
    const diffSeconds = (now.getTime() - startedAt.getTime()) / 1000;

    if (diffSeconds < task.requiredSeconds - 5) { // 5s grace period
      return { success: false, message: `Please wait ${Math.ceil(task.requiredSeconds - diffSeconds)} more seconds` };
    }

    // Mark as completed
    await updateDoc(ref, {
      status: 'completed',
      completedAt: now.toISOString()
    });

    // Grant spins
    const settings = await getAppSettings();
    const spinsToGrant = settings.luckyWheel?.spinsPerTask || 0;
    if (spinsToGrant > 0) {
       await updateDoc(doc(db, 'users', userId), {
         spins: increment(spinsToGrant)
       });
    }

    // Add points
    await addEarnings(userId, `Completed task: ${task.title}`, Number(task.rewardPoints), 'task');

    return { success: true, message: `Verified! +${task.rewardPoints} points` };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false, message: 'Verification error' };
  }
}

export async function updateUserDetails(userId: string, data: Partial<UserProfile>) {
  const path = 'users';
  try {
    const ref = doc(db, path, userId);
    await updateDoc(ref, clean(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Support Chat Service ---
const CHATS_PATH = 'support_chats';

export async function getOrCreateSupportChat(profile: UserProfile, accountNumber: string): Promise<SupportChat | null> {
  try {
    const chatRef = doc(db, CHATS_PATH, profile.uid);
    const chatDoc = await getDoc(chatRef);

    const chatData: SupportChat = {
      userId: profile.uid,
      userName: profile.name || 'Anonymous User',
      userEmail: profile.email,
      accountNumber,
      lastMessage: 'Chat started',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    };

    if (!chatDoc.exists()) {
      await setDoc(chatRef, chatData);
      return { id: profile.uid, ...chatData };
    } else {
      // Update account number if provided
      await updateDoc(chatRef, { accountNumber, updatedAt: new Date().toISOString() });
      return { id: chatDoc.id, ...chatDoc.data() } as SupportChat;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CHATS_PATH);
    return null;
  }
}

export async function sendChatMessage(chatId: string, message: Partial<ChatMessage>) {
  const path = `${CHATS_PATH}/${chatId}/messages`;
  try {
    const messagesRef = collection(db, CHATS_PATH, chatId, 'messages');
    const msgData = clean({
      ...message,
      timestamp: new Date().toISOString()
    });
    await addDoc(messagesRef, msgData);
    
    // Update last message in parent doc
    const chatRef = doc(db, CHATS_PATH, chatId);
    await updateDoc(chatRef, {
      lastMessage: message.text || (message.imageUrl ? 'Image' : ''),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getSupportChats(): Promise<SupportChat[]> {
  try {
    const q = query(collection(db, CHATS_PATH), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChat));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CHATS_PATH);
    return [];
  }
}

// --- MLM Referral Logic ---

export async function getUserIdByReferralCode(code: string): Promise<string | null> {
  try {
    const q = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch (error) {
    console.error("Error finding user by referral code:", error);
    return null;
  }
}

export async function processReferralOnSignup(userId: string, referralCode: string) {
  try {
    const referrerId = await getUserIdByReferralCode(referralCode);
    if (!referrerId || referrerId === userId) return { success: false, message: 'Invalid referral' };

    // 1. Update referral counts (Level 1)
    try {
      await updateDoc(doc(db, 'users', referrerId), { referralCountL1: increment(1) });
      
      const referrerSnap = await getDoc(doc(db, 'users', referrerId));
      if (referrerSnap.exists()) {
        const referrerData = referrerSnap.data() as UserProfile;
        if (referrerData.referredBy) {
          await updateDoc(doc(db, 'users', referrerData.referredBy), { referralCountL2: increment(1) });
          
          const l2Referrer = await getDoc(doc(db, 'users', referrerData.referredBy));
          if (l2Referrer.exists()) {
            const l2Data = l2Referrer.data() as UserProfile;
            if (l2Data.referredBy) {
              await updateDoc(doc(db, 'users', l2Data.referredBy), { referralCountL3: increment(1) });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Referral counts fail:", e);
    }

    // 2. Reward direct referrer (Signup Bonus)
    try {
      const settings = await getAppSettings();
      if (settings.referralBonus > 0) {
        await addEarnings(referrerId, 'Referral Signup Bonus', settings.referralBonus, 'referral', userId);
      }
    } catch (e) {
      console.warn("Referral bonus fail:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Referral process error:", error);
    return { success: false, message: 'System error' };
  }
}

async function distributeMLMCommission(userId: string, pointsEarned: number) {
  try {
    const numPointsEarned = Number(pointsEarned);
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return;
    const userData = userSnap.data() as UserProfile;
    if (!userData.referredBy) return;

    const settings = await getAppSettings();
    
    // Level 1
    const l1Id = userData.referredBy;
    const l1Comm = Math.floor(numPointsEarned * (Number(settings.mlmLevel1Percent) / 100));
    if (l1Comm > 0) {
      await addCommission(l1Id, `L1 Referral Earned: ${numPointsEarned}`, l1Comm, userId);
    }

    // Level 2
    const l1Snap = await getDoc(doc(db, 'users', l1Id));
    if (l1Snap.exists()) {
      const l1Data = l1Snap.data() as UserProfile;
      if (l1Data.referredBy) {
        const l2Id = l1Data.referredBy;
        const l2Comm = Math.floor(numPointsEarned * (Number(settings.mlmLevel2Percent) / 100));
        if (l2Comm > 0) {
          await addCommission(l2Id, `L2 Referral Earned: ${numPointsEarned}`, l2Comm, userId);
        }

        // Level 3
        const l2Snap = await getDoc(doc(db, 'users', l2Id));
        if (l2Snap.exists()) {
          const l2Data = l2Snap.data() as UserProfile;
          if (l2Data.referredBy) {
            const l3Id = l2Data.referredBy;
            const l3Comm = Math.floor(numPointsEarned * (Number(settings.mlmLevel3Percent) / 100));
            if (l3Comm > 0) {
              await addCommission(l3Id, `L3 Referral Earned: ${numPointsEarned}`, l3Comm, userId);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("MLM Distribution Error:", e);
  }
}

async function addCommission(referrerId: string, taskName: string, points: number, sourceUserId: string) {
  try {
    const numPoints = Number(points);
    const earning: EarningLog = {
      userId: referrerId,
      taskName, // Simplified task name
      points: numPoints,
      timestamp: new Date().toISOString(),
      type: 'referral',
      sourceUserId
    };
    
    await addDoc(collection(db, 'earnings'), earning);
    
    const userRef = doc(db, 'users', referrerId);
    await updateDoc(userRef, {
      points: increment(numPoints),
      totalEarnings: increment(numPoints),
      referralEarnings: increment(numPoints)
    });
  } catch (e) {
    console.error("Add Commission Error:", e);
  }
}

export async function getReferralsWithStats(userId: string) {
  try {
    // 1. Get all users referred by this user
    const q = query(collection(db, 'users'), where('referredBy', '==', userId), orderBy('joinedAt', 'desc'));
    const snap = await getDocs(q);
    const referrals = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));

    // 2. Get earnings from these referrals
    const eq = query(collection(db, 'earnings'), where('userId', '==', userId), where('type', '==', 'referral'));
    const esnap = await getDocs(eq);
    const earnings = esnap.docs.map(doc => doc.data() as EarningLog);

    // 3. Map stats to referrals
    return referrals.map(ref => {
      const earnedFromUser = earnings
        .filter(e => e.sourceUserId === ref.uid)
        .reduce((sum, curr) => sum + curr.points, 0);
      
      return {
        ...ref,
        earnedFromUser
      };
    });
  } catch (error) {
    console.error("Error fetching referrals with stats:", error);
    return [];
  }
}
