
import { PlanilhaTreino, LoadEntry } from './types';

/**
 * Simula a persistência de dados no Firestore ou Supabase.
 */
export const salvarTreino = async (alunoId: string, dadosTreino: PlanilhaTreino): Promise<{ success: boolean; data?: PlanilhaTreino }> => {
  console.log(`[Persistência] Salvando treino para aluno ${alunoId}...`, dadosTreino);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    const savedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const updatedWorkouts = [...savedWorkouts.filter((w: any) => w.id !== dadosTreino.id), dadosTreino];
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    
    return { success: true, data: dadosTreino };
  } catch (error) {
    console.error("Erro ao persistir treino:", error);
    return { success: false };
  }
};

export const salvarCarga = async (entry: LoadEntry): Promise<boolean> => {
  try {
    const history = JSON.parse(localStorage.getItem('load_history') || '[]');
    history.push(entry);
    localStorage.setItem('load_history', JSON.stringify(history));
    return true;
  } catch (e) {
    return false;
  }
};

export const getHistoricoCargas = (studentId: string, exerciseId: string): LoadEntry[] => {
  const history: LoadEntry[] = JSON.parse(localStorage.getItem('load_history') || '[]');
  return history
    .filter(h => h.studentId === studentId && h.exerciseId === exerciseId)
    .sort((a, b) => a.timestamp - b.timestamp);
};
