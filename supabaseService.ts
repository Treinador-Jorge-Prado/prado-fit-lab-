
import { createClient } from '@supabase/supabase-js';
import { User, VideoContent, PlanilhaTreino, UserRole } from './types';

const SUPABASE_URL = "https://rdtivctjakolbqpijysn.supabase.co";
const SUPABASE_KEY = "sb_publishable_1uk-KkeSPbLBn_jJv1BgXQ_QlhM3_eC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Gerenciamento de Alunos
export const getAlunos = async (): Promise<User[]> => {
  // Selecionando exatamente as colunas do banco
  const { data, error } = await supabase
    .from('alunos')
    .select('id, nome, email, senha, treinos');
  
  if (error) {
    console.error("ERRO SUPABASE (SELECT ALUNOS):", error.message, error.details);
    throw error;
  }

  // Mapeia o retorno do banco (colunas PT) para a interface da aplicação
  return (data || []).map(row => ({
    id: row.id,
    name: row.nome,
    email: row.email,
    password: row.senha,
    role: UserRole.STUDENT,
    workout_data: row.treinos // Campo JSON com a planilha de treinos
  } as any));
};

// Gerenciamento de Alunos - CORRIGIDO
export const saveAluno = async (aluno: any) => {
  const payload: any = {
    nome: aluno.name || aluno.nome,
    email: aluno.email,
    senha: aluno.password || aluno.senha,
    treinos: aluno.workout_data || aluno.treinos || { A: [], B: [], C: [] }
  };

  // Importante: Só enviamos o ID se ele for um UUID válido (gerado pelo Supabase)
  // Isso evita o erro de "invalid input syntax for type uuid"
  if (aluno.id && typeof aluno.id === 'string' && aluno.id.length > 20) {
    payload.id = aluno.id;
  }

  const { error } = await supabase
    .from('alunos')
    .upsert(payload);
  
  if (error) {
    console.error("ERRO SUPABASE (SAVE ALUNO):", error.message);
    alert("Erro ao salvar no banco: " + error.message);
    throw error;
  }
};

export const updateWorkout = async (studentId: string, workout: PlanilhaTreino) => {
  const { error } = await supabase
    .from('alunos')
    .update({ treinos: workout })
    .eq('id', studentId);
  
  if (error) {
    console.error("ERRO SUPABASE (UPDATE TREINOS):", error.message, error.details);
    throw error;
  }
};

// Gerenciamento de Conteúdos
export const getConteudos = async (): Promise<VideoContent[]> => {
  // Selecionando conforme schema solicitado
  const { data, error } = await supabase
    .from('conteudos')
    .select('id, titulo, thumbnail, video_url, descricao');
  
  if (error) {
    console.error("ERRO SUPABASE (SELECT CONTEUDOS):", error.message, error.details);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    titulo: row.titulo,
    thumbnail_url: row.thumbnail,
    url: row.video_url,
    descricao: row.descricao,
    data_postagem: Date.now(),
    fixado: false,
    categoria: 'Geral'
  }));
};

// Gerenciamento de Conteúdos - CORRIGIDO
export const saveConteudo = async (video: any) => {
  const payload: any = {
    titulo: video.titulo,
    thumbnail: video.thumbnail_url || video.thumbnail,
    video_url: video.url || video.video_url,
    descricao: video.descricao
  };

  if (video.id && typeof video.id === 'string' && video.id.length > 20) {
    payload.id = video.id;
  }

  const { error } = await supabase
    .from('conteudos')
    .upsert(payload);
  
  if (error) {
    console.error("ERRO SUPABASE (SAVE CONTEUDO):", error.message);
    throw error;
  }
};

export const removeConteudo = async (id: string) => {
  const { error } = await supabase
    .from('conteudos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("ERRO SUPABASE (DELETE CONTEUDO):", error.message, error.details);
    throw error;
  }
};
