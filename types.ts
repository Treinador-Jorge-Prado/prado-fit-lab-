
export enum UserRole {
  PERSONAL = 'PERSONAL',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  personalId?: string;
  startDate?: number;
  profileImage?: string;
  badges?: Badge[];
  objective?: string;
}

export interface VideoContent {
  id: string;
  titulo: string;
  categoria: 'Execução' | 'Dieta' | 'Mentalidade' | 'Recados';
  url: string;
  data_postagem: number;
  thumbnail_url: string;
  fixado: boolean;
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  dateEarned: number;
}

export interface Biometrics {
  weight: number;
  bodyFat: number;
  waist: number;
  arm: number;
  chest: number;
  thigh: number;
}

export interface EvolutionEntry {
  id: string;
  date: number;
  biometrics: Biometrics;
  photos: {
    front?: string;
    side?: string;
    back?: string;
  };
}

export interface Exercise {
  id: string;
  nome: string;
  grupo_muscular: string;
  equipamento: string;
  instrucoes: string;
  video_url: string;
  categoria: 'Básico' | 'Intermediário' | 'Avançado';
}

export interface SelecedExercise extends Partial<Exercise> {
  id_exercicio: string;
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
  observacoes_especificas?: string;
  carga_atual?: number;
}

export interface LoadEntry {
  id: string;
  studentId: string;
  exerciseId: string;
  weight: number;
  timestamp: number;
}

export interface DivisaoTreino {
  letra: string; // "A", "B", "C"...
  nome: string; // "Membros Superiores"
  exercicios: SelecedExercise[];
}

export interface PlanilhaTreino {
  id: string;
  id_aluno: string;
  personalId: string;
  data_criacao: number;
  nome_da_planilha: string; // Ex: "Protocolo de Definição 2024"
  divisoes: DivisaoTreino[];
}

export interface CheckIn {
  id: string;
  studentId: string;
  workoutId: string;
  letraTreino?: string; // Letra da divisão executada
  timestamp: number;
  durationSeconds?: number; // Tempo total do treino
}
