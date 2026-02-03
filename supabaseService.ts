
import { createClient } from '@supabase/supabase-js';
import { User, VideoContent, PlanilhaTreino } from './types';

const SUPABASE_URL = "https://rdtivctjakolbqpijysn.supabase.co";
const SUPABASE_KEY = "sb_publishable_1uk-KkeSPbLBn_jJv1BgXQ_QlhM3_eC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Gerenciamento de Alunos
export const getAlunos = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*');
  
  if (error) {
    console.error("Erro Supabase Alunos:", error);
    throw new Error("Falha na conexão com o banco de dados.");
  }
  return data || [];
};

export const saveAluno = async (aluno: User) => {
  const { error } = await supabase
    .from('alunos')
    .upsert(aluno);
  
  if (error) throw error;
};

export const updateWorkout = async (studentId: string, workout: PlanilhaTreino) => {
  const { error } = await supabase
    .from('alunos')
    .update({ workout_data: workout })
    .eq('id', studentId);
  
  if (error) throw error;
};

// Gerenciamento de Conteúdos
export const getConteudos = async (): Promise<VideoContent[]> => {
  const { data, error } = await supabase
    .from('conteudos')
    .select('*')
    .order('data_postagem', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const saveConteudo = async (video: VideoContent) => {
  const { error } = await supabase
    .from('conteudos')
    .upsert(video);
  
  if (error) throw error;
};

export const removeConteudo = async (id: string) => {
  const { error } = await supabase
    .from('conteudos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
