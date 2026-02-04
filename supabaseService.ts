
import { createClient } from '@supabase/supabase-js';
import { User, VideoContent, PlanilhaTreino, UserRole } from './types';

const SUPABASE_URL = "https://rdtivctjakolbqpijysn.supabase.co";
const SUPABASE_KEY = "sb_publishable_1uk-KkeSPbLBn_jJv1BgXQ_QlhM3_eC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface EvolucaoFoto {
  id: string;
  aluno_id: string;
  url_foto: string;
  data_criacao: string;
}

export const getAlunos = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('alunos')
    .select('id, nome, email, senha, treinos, url_shape_atual');
  
  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    name: row.nome,
    email: row.email,
    password: row.senha,
    role: UserRole.STUDENT,
    workout_data: row.treinos,
    url_shape_atual: row.url_shape_atual
  } as any));
};

export const getGaleriaFotos = async (alunoId: string): Promise<EvolucaoFoto[]> => {
  const { data, error } = await supabase
    .from('evolucao_fotos')
    .select('*')
    .eq('aluno_id', alunoId);

  if (error) {
    console.error("ERRO AO CARREGAR MURAL:", error.message);
    return [];
  }
  return data || [];
};

export const uploadShapePhoto = async (studentId: string, file: File): Promise<string> => {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `${studentId}/${timestamp}.${fileExt}`;

  // 1. Upload para o bucket 'shapes'
  const { error: uploadError } = await supabase.storage
    .from('shapes')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. URL Pública
  const { data } = supabase.storage
    .from('shapes')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

export const updateWorkout = async (studentId: string, workout: PlanilhaTreino) => {
  const { error } = await supabase
    .from('alunos')
    .update({ treinos: workout })
    .eq('id', studentId);
  if (error) throw error;
};

export const saveAluno = async (aluno: any) => {
  const payload: any = {
    nome: aluno.name || aluno.nome,
    email: aluno.email,
    senha: aluno.password || aluno.senha,
    treinos: aluno.workout_data || aluno.treinos || { A: [], B: [], C: [] },
    url_shape_atual: aluno.url_shape_atual || null
  };
  if (aluno.id && typeof aluno.id === 'string' && aluno.id.length > 20) {
    payload.id = aluno.id;
  }
  const { error } = await supabase.from('alunos').upsert(payload);
  if (error) throw error;
};

export const getConteudos = async (): Promise<VideoContent[]> => {
  const { data, error } = await supabase
    .from('conteudos')
    .select('id, titulo, thumbnail, video_url, descricao');
  if (error) throw error;
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
  const { error } = await supabase.from('conteudos').upsert(payload);
  if (error) throw error;
};

export const removeConteudo = async (id: string) => {
  const { error } = await supabase.from('conteudos').delete().eq('id', id);
  if (error) throw error;
};
