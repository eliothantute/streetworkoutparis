export type EquipmentType =
  | 'pullup_bars'
  | 'dip_bars'
  | 'parallel_bars'
  | 'rings'
  | 'monkey_bars'
  | 'swedish_wall'
  | 'ab_bench'
  | 'pushup_bars'
  | 'low_bars'
  | 'handstand_wall';

export interface SpotReview {
  id: string;
  author: string;
  avatarUrl?: string;
  rating: number; // 1-5
  equipmentRating: number; // 1-5
  crowdRating: number; // 1-5
  content: string;
  date: string; // ISO String
}

export interface SpotReport {
  id: string;
  type: 'condition' | 'cleanliness' | 'crowd';
  status: 'perfect' | 'good' | 'worn' | 'broken';
  description: string;
  date: string;
}

export interface ScheduledWorkout {
  id: string;
  title: string;
  time: string; // "18:00" or ISO Date
  date: string; // "Today", "Tomorrow", "2026-06-03"
  hostName: string;
  attendeesCount: number;
  userJoined: boolean;
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutSpot {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number]; // [latitude, longitude]
  equipment: EquipmentType[];
  safetyFloor: boolean; // Rubbery protective floor vs gravel/concrete
  shade: 'none' | 'partial' | 'full';
  lighting: boolean; // Does it have lights for night workouts?
  waterSource: boolean; // Water fountain nearby?
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
  busyHours: number[]; // 24 values representing relative busy levels (0-100)
  activeUsers: number; // Current active checked-in users
  reviews: SpotReview[];
  reports: SpotReport[];
  scheduledWorkouts: ScheduledWorkout[];
  imageUrl: string;
  description: string;
}

export interface WorkoutSession {
  spotId: string;
  spotName: string;
  startTime: string; // ISO
  active: boolean;
}

export interface UserProfile {
  username: string;
  level: number;
  xp: number;
  sessionsCompleted: number;
  achievements: Achievement[];
  currentSession?: WorkoutSession;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
}
