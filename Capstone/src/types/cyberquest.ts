export type NavSection =
  | 'dashboard'
  | 'learning-path'
  | 'academy'
  | 'labs'
  | 'achievements'
  | 'profile';

export type UnitId = 'unit-1' | 'unit-2' | 'unit-3' | 'unit-4' | 'unit-5';

export type LabId = 'lab-1' | 'lab-2' | 'lab-3' | 'lab-4' | 'lab-5';

export type NodeType = 'lesson' | 'activity' | 'practice' | 'lab' | 'checkpoint';

export type ByteMood =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'explaining'
  | 'hint'
  | 'excited'
  | 'concerned'
  | 'mission-complete'
  | 'welcome';

export interface ActivityHistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  category: 'lesson' | 'activity' | 'practice' | 'lab' | 'checkpoint' | 'achievement' | 'daily';
  xpEarned: number;
}

export interface LabTaskHint {
  level1: string; // Conceptual clue
  level2: string; // Direction or tool
  level3: string; // Specific guidance
  explanation: string; // Detailed solution & reasoning
}

export interface LabTaskDefinition {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  hints: LabTaskHint;
}

export interface LabProgressState {
  completedTasks: string[];
  hintsRevealed: Record<string, number>; // taskId -> highest tier revealed (1..4)
  completed: boolean;
  completedAt?: string;
  noHintBonusClaimed?: boolean;
  // Lab-specific persisted state
  commandLog?: string[];
  observations?: Record<string, string | boolean>;
  linuxPermissions?: Record<string, string>;
  assessmentDraft?: AssessmentReportDraft;
}

export interface AssessmentFindingDraft {
  id: string;
  title: string;
  selectedSeverity: string;
  observation: string;
  impact: string;
  remediation: string;
  verified: boolean;
}

export interface AssessmentReportDraft {
  title: string;
  scopeConfirmed: boolean;
  exploredEvidenceIds: string[];
  findings: Record<string, AssessmentFindingDraft>;
  submitted: boolean;
  submittedAt?: string;
}

export interface StudentProfile {
  displayName: string;
  avatarId: string;
  onboarded: boolean;
  createdAt: string;
}

export interface StudentProgressState {
  version: number;
  profile: StudentProfile;
  xp: number;
  streakCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedNodes: string[];
  awardedActivities: string[]; // Prevents duplicate XP awards
  unlockedAchievements: Record<string, string>; // achievementId -> ISO timestamp
  labProgress: Record<LabId, LabProgressState>;
  dailyMissionCompletedDate: string | null;
  activityHistory: ActivityHistoryEntry[];
}

export interface LessonConceptCard {
  term: string;
  summary: string;
  detail: string;
}

export interface CommandRefItem {
  command: string;
  purpose: string;
  example: string;
}

export interface KnowledgeCheckItem {
  id: string;
  type: 'match' | 'order' | 'identify' | 'scenario';
  prompt: string;
  // For 'identify' and 'scenario'
  options?: { id: string; label: string; feedback: string }[];
  correctOptionId?: string;
  // For 'order'
  steps?: { id: string; label: string }[];
  correctOrder?: string[];
  // For 'match'
  pairs?: { id: string; left: string; right: string }[];
  explanation: string;
}

export interface LessonSection {
  heading: string;
  body: string;
  codeBlock?: string;
  diagramType?: 'recon-flow' | 'http-cycle' | 'packet-layers' | 'linux-perms' | 'va-lifecycle';
  conceptCards?: LessonConceptCard[];
  commands?: CommandRefItem[];
}

export interface InteractiveActivityData {
  kind: 'port-matcher' | 'http-anatomy' | 'packet-layers' | 'chmod-calc' | 'cvss-matrix';
  title: string;
  instructions: string;
}

export interface LearningNode {
  id: string;
  unitId: UnitId;
  order: number;
  type: NodeType;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  xpReward: number;
  byteIntro: string;
  byteMilestoneNote?: string;
  // Lesson content
  sections?: LessonSection[];
  knowledgeCheck?: KnowledgeCheckItem;
  // Activity content
  activityData?: InteractiveActivityData;
  // Practice content
  practiceChallenges?: KnowledgeCheckItem[];
  // Lab link
  labId?: LabId;
}

export interface CurriculumUnit {
  id: UnitId;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: 'blue' | 'teal' | 'gold' | 'violet';
  milestoneXp: number;
  labId: LabId;
  nodes: LearningNode[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  conditionText: string;
  xpReward: number;
  category: 'learning' | 'labs' | 'mastery' | 'companion';
  iconName: string;
}

export interface LabDefinition {
  id: LabId;
  unitId: UnitId;
  number: string;
  missionName: string;
  title: string;
  targetName: string;
  targetAddress: string;
  difficulty: 'Beginner' | 'Foundational' | 'Intermediate';
  estimatedMinutes: number;
  xpBonus: number;
  story: string;
  objectives: string[];
  tasks: LabTaskDefinition[];
  suggestedQuestions: string[];
}

export interface ByteContext {
  section: NavSection;
  unitId?: UnitId;
  nodeId?: string;
  labId?: LabId;
  activeTaskId?: string;
  latestOutput?: string;
}
