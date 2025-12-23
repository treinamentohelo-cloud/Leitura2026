
export enum UserRole {
  PROFESSOR = 'PROFESSOR',
  COORDINATION = 'COORDINATION'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface RemedialRecord {
  entryDate: string;
  entryLevel: string;
  exitDate?: string;
  exitLevel?: string;
  durationDays?: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  year: number;
  teacher: string;
  teacherId?: string; // ID do professor responsável
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  readingLevel: string;
  avatarUrl: string;
  inRemedial?: boolean;
  remedialStartDate?: string;
  remedialEntryLevel?: string;
  remedialHistory?: RemedialRecord[];
}

export type ProficiencyLevel = 'Insuficiente' | 'Básico' | 'Adequado' | 'Avançado';

export interface AssessmentCriteria {
  fluency: ProficiencyLevel;
  decoding: ProficiencyLevel;
  comprehension: ProficiencyLevel;
  math?: {
    numberSense: boolean;
    logicReasoning: boolean;
    operations: boolean;
    geometry: boolean;
  };
}

export interface Assessment {
  id: string;
  studentId: string;
  date: string;
  textTitle: string;
  wpm: number;
  accuracy: number;
  comprehension: number;
  mathScore?: number;
  criteria?: AssessmentCriteria;
  notes: string;
  aiFeedback?: string;
  teacherId?: string;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: 'Leitura' | 'Matemática' | 'Socioemocional' | 'Geral';
  weight: number;
}

export interface ReadingMaterial {
  title: string;
  content: string;
  level: string;
  suggestedQuestions: string[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  STUDENTS = 'STUDENTS',
  STUDENT_HISTORY = 'STUDENT_HISTORY',
  ASSESSMENT = 'ASSESSMENT',
  GENERATOR = 'GENERATOR',
  COMPETENCIES = 'COMPETENCIES',
  REMEDIAL = 'REMEDIAL',
  COORDINATION_PANEL = 'COORDINATION_PANEL'
}
