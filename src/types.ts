export enum AnatomyRole {
  Professor = 'professor',
  Student = 'student',
}

export enum AnatomySex {
  Male = 'male',
  Female = 'female',
}

export enum AnatomySystem {
  Skeletal = 'skeletal',
  Muscular = 'muscular',
  Articular = 'articular',
  Cardiovascular = 'cardiovascular',
  Nervous = 'nervous',
  Respiratory = 'respiratory',
  Digestive = 'digestive',
  Endocrine = 'endocrine',
  Urinary = 'urinary',
  Reproductive = 'reproductive',
  Lymphatic = 'lymphatic',
  Integumentary = 'integumentary',
  Visceral = 'visceral',
  Regional = 'regional',
}

export interface AnatomySystemInfo {
  id: AnatomySystem;
  nameFr: string;
  nameEn: string;
}

export interface AnatomyModelRef {
  system: AnatomySystemInfo;
  sex: AnatomySex;
  url: string;
}

export interface MeshVariant {
  sex?: string;
  mesh_file?: string;
  node?: string;
  match_type?: string;
  confidence?: number;
  semantic_status?: string;
  provenance?: string;
}

export interface AnatomyStructure {
  id: string;
  nameFr: string;
  nameEn: string;
  system: string;
  synonymsFr: string[];
  synonymsEn: string[];
  source: string;
  meshAvailable: boolean;
  meshSex?: string;
  meshFile?: string;
  meshNode?: string;
  meshVariants: MeshVariant[];
  meshMappingStatus: string;
}

export interface AnatomyRelation {
  source: string;
  subject: string;
  predicate: string;
  object: string;
  subjectIri?: string;
  objectIri?: string;
  predicateIri?: string;
  direction: string;
}

export enum ExamQuestionType {
  Quiz = 'quiz',
  Question = 'question',
  Identify3D = 'identify3d',
}

export interface AnatomyExamQuestion {
  id: string;
  text: string;
  type: ExamQuestionType;
  options: string[];
  correctOptionIndex?: number;
  expectedAnswer?: string;
  points: number;
  conceptId?: string;
  conceptNameFr?: string;
  conceptNameEn?: string;
  meshSex?: string;
  meshFile?: string;
  meshNode?: string;
  relationPredicate?: string;
  tags: string[];
  difficulty: number;
}

export interface AnatomyExam {
  id: string;
  title: string;
  description: string;
  questions: AnatomyExamQuestion[];
  durationMinutes: number;
  hideAnatomy: boolean;
  targetSystem?: string;
  isPublished?: boolean;
  targetCohort?: string;
  passingScore?: number;
}

export type ExamAssignment = AnatomyExamAssignment;
export type StudentExamResult = AnatomyExamResult;
export type AcademicClass = AnatomyClass;

export interface AnatomyClass {
  id: string;
  name: string;
  professorId: string;
  description: string;
  studentIds: string[];
}

export interface AnatomyStudent {
  id: string;
  name: string;
  email: string;
  classIds: string[];
}

export enum ExamAssignmentStatus {
  Assigned = 'assigned',
  Started = 'started',
  Submitted = 'submitted',
  Expired = 'expired',
}

export interface AnatomyExamAssignment {
  id: string;
  examId: string;
  classId: string;
  studentId: string;
  assignedAt: Date;
  dueAt?: Date;
  status: ExamAssignmentStatus;
}

export interface AnatomyExamResult {
  id: string;
  examId: string;
  assignmentId: string;
  studentId: string;
  submittedAt: Date;
  score: number;
  maxScore: number;
  percentage: number;
  questionScores: Record<string, number>;
}

export enum AnatomyHistoryType {
  Exam = 'exam',
  Lesson = 'lesson',
  Dissection = 'dissection',
  Quiz = 'quiz',
  Atlas = 'atlas',
}

export interface AnatomyHistoryEntry {
  id: string;
  studentId: string;
  type: AnatomyHistoryType;
  title: string;
  occurredAt: Date;
  score?: number;
  durationSeconds?: number;
}

export interface EntityData {
  id: string;
  name: string;
}
