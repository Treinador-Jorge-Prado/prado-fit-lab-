
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, PlanilhaTreino, Exercise, CheckIn, EvolutionEntry, Biometrics, VideoContent, LoadEntry } from './types';
import { MOCK_PERSONAL, INITIAL_EXERCISES, MOCK_EVOLUTION } from './mockData';
import PersonalDashboard from './components/PersonalDashboard';
import StudentView from './components/StudentView';
import WorkoutEditor from './components/WorkoutEditor';
import ProfileView from './components/ProfileView';
import VideoLibrary from './components/VideoLibrary';
import VideoManager from './components/VideoManager';
import GerenciadorExercicios from './components/GerenciadorExercicios';
import { Icons } from './constants';
import { getAlunos, saveAluno, getConteudos, saveConteudo, removeConteudo, updateWorkout, uploadShapePhoto, supabase } from './supabaseService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<PlanilhaTreino[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>(['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio']);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [evolution, setEvolution] = useState<EvolutionEntry[]>(MOCK_EVOLUTION);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loadHistory, setLoadHistory] = useState<LoadEntry[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [currentView, setCurrentView] = useState<'LOGIN' | 'DASHBOARD' | 'STUDENT_VIEW' | 'WORKOUT_EDITOR' | 'PROFILE_VIEW' | 'VIDEO_LIBRARY' | 'VIDEO_MANAGER' | 'EXERCISE_MANAGER'>('LOGIN');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const loadSupabaseData = useCallback(async () => {
    try {
      const [remoteStudents, remoteVideos] = await Promise.all([
        getAlunos(),
        getConteudos()
      ]);
      
      setStudents(remoteStudents);
      setVideos(remoteVideos);
      
      const remoteWorkouts = remoteStudents
        .filter(s => (s as any).workout_data)
        .map(s => (s as any).workout_data as PlanilhaTreino);
      setWorkouts(remoteWorkouts);

      return { students: remoteStudents, videos: remoteVideos };
    } catch (error) {
      console.error("FALHA CRÍTICA AO SINCRONIZAR LAB:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const data = await loadSupabaseData();
      
      const storedExercises = localStorage.getItem('lab_exercises');
      setExercises(storedExercises ? JSON.parse(storedExercises) : INITIAL_EXERCISES);

      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && data) {
        const parsedUser = JSON.parse(storedUser);
        const refreshedUser = data.students.find(s => s.id === parsedUser.id) || 
                             (parsedUser.role === UserRole.PERSONAL ? MOCK_PERSONAL : parsedUser);
        
        setCurrentUser(refreshedUser);
        const storedView = localStorage.getItem('currentView');
        if (storedView) setCurrentView(storedView as any);
        else setCurrentView(refreshedUser.role === UserRole.PERSONAL ? 'DASHBOARD' : 'STUDENT_VIEW');
      }
      setIsLoading(false);
    };
    initData();
  }, [loadSupabaseData]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('currentView', currentView);
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentView');
    }
  }, [currentUser, currentView]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const data = await loadSupabaseData();
    if (!data) {
      alert("Erro de conexão.");
      setIsLoggingIn(false);
      return;
    }
    const cleanEmail = identifier.toLowerCase().trim();
    if (loginRole === UserRole.PERSONAL) {
      if (cleanEmail === 'jorge@prado.com' || (cleanEmail === 'admin@teste.com' && password === '123')) {
        setCurrentUser(MOCK_PERSONAL);
        setCurrentView('DASHBOARD');
      } else {
        alert("Acesso Negado.");
      }
    } else {
      const student = data.students.find(s => s.email.toLowerCase().trim() === cleanEmail);
      if (student && student.password === password) {
        setCurrentUser(student);
        setCurrentView('STUDENT_VIEW');
      } else {
        alert("Credenciais inválidas.");
      }
    }
    setIsLoggingIn(false);
  };

  const handleUploadShape = async (file: File) => {
    if (!currentUser) return;
    try {
      const publicUrl = await uploadShapePhoto(currentUser.id, file);
      
      // REGISTRO NO MURAL (O que estava faltando)
      await supabase.from('evolucao_fotos').insert([
        { aluno_id: currentUser.id, url_foto: publicUrl }
      ]);

      // ATUALIZAÇÃO DO PERFIL
      await supabase.from('alunos').update({ url_shape_atual: publicUrl }).eq('id', currentUser.id);

      await loadSupabaseData();
      setCurrentUser(prev => prev ? { ...prev, url_shape_atual: publicUrl } : null);
      alert("Foto registrada no Mural!");
    } catch (e) {
      alert("Erro ao salvar no Mural.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
    setLoginRole(null);
    setSelectedStudentId(null);
  };

  const handleOpenStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('PROFILE_VIEW');
  };

  const studentBeingViewed = currentUser?.role === UserRole.PERSONAL 
    ? students.find(s => s.id === selectedStudentId) 
    : currentUser;

  const currentWorkout = workouts.find(w => w.id_aluno === studentBeingViewed?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-950 text-slate-50">
      {currentView === 'LOGIN' ? (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
          <div className="w-full max-sm:px-4 max-w-sm space-y-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full border border-orange-500/20 flex items-center justify-center">
                <Icons.Activity className="w-10 h-10 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black italic uppercase leading-none">PRADO FIT LAB</h1>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Team Jorge Prado</p>
              </div>
            </div>
            {!loginRole ? (
              <div className="space-y-4">
                <button onClick={() => setLoginRole(UserRole.PERSONAL)} className="w-full p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between hover:border-orange-500/50 transition-all">
                  <span className="font-black uppercase">Painel Jorge</span>
                  <Icons.User className="text-orange-500" />
                </button>
                <button onClick={() => setLoginRole(UserRole.STUDENT)} className="w-full p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between hover:border-orange-500/50 transition-all">
                  <span className="font-black uppercase">Membro Team Prado</span>
                  <Icons.Dumbbell className="text-orange-500" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left animate-in slide-in-from-bottom-4">
                <button type="button" onClick={() => setLoginRole(null)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">← Voltar</button>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="E-mail" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500" />
                <button type="submit" className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Acessar Lab</button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-[60] flex items-center justify-between px-8 py-5 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
            <div className="flex items-center gap-3">
              <Icons.Activity className="text-orange-500 w-6 h-6" />
              <span className="font-black text-lg uppercase italic leading-none">PRADO FIT LAB</span>
            </div>
            <button onClick={logout} className="text-[10px] font-black uppercase text-slate-500">Sair</button>
          </header>

          <main className="max-w-5xl mx-auto">
            {currentView === 'DASHBOARD' && (
              <PersonalDashboard 
                students={students} workouts={workouts} checkins={checkins}
                onOpenWorkoutEditor={(sid) => { setSelectedStudentId(sid); setCurrentView('WORKOUT_EDITOR'); }} 
                onAddMember={async (m) => { await saveAluno(m); await loadSupabaseData(); }}
                onUpdateMember={async (m) => { await saveAluno(m); await loadSupabaseData(); }}
                onViewProfile={handleOpenStudentProfile}
              />
            )}
            {currentView === 'STUDENT_VIEW' && (
              <StudentView 
                student={currentUser!} workout={currentWorkout} 
                onCheckIn={(c) => setCheckins([...checkins, c])}
                onRegisterLoad={(l) => setLoadHistory([...loadHistory, l])}
                loadHistory={loadHistory}
              />
            )}
            {currentView === 'PROFILE_VIEW' && studentBeingViewed && (
              <ProfileView 
                student={studentBeingViewed} 
                evolutionHistory={evolution} checkins={checkins} 
                onUpdateBiometrics={(m) => console.log(m)}
                onUploadShape={handleUploadShape}
                isTrainerMode={currentUser?.role === UserRole.PERSONAL}
                onBack={currentUser?.role === UserRole.PERSONAL ? () => setCurrentView('DASHBOARD') : undefined}
                workout={currentWorkout}
              />
            )}
            {currentView === 'WORKOUT_EDITOR' && selectedStudentId && (
              <WorkoutEditor 
                student={students.find(s => s.id === selectedStudentId)!}
                existingWorkout={workouts.find(w => w.id_aluno === selectedStudentId)}
                exercisesLibrary={exercises}
                onSave={async (w) => { await updateWorkout(w.id_aluno, w); await loadSupabaseData(); setCurrentView('DASHBOARD'); }}
                onCancel={() => setCurrentView('DASHBOARD')}
                loadHistory={loadHistory}
              />
            )}
            {currentView === 'VIDEO_LIBRARY' && <VideoLibrary videos={videos} />}
            {currentView === 'VIDEO_MANAGER' && (
              <VideoManager 
                videos={videos} 
                onAddVideo={async (v) => { await saveConteudo(v); await loadSupabaseData(); }} 
                onUpdateVideo={async (v) => { await saveConteudo(v); await loadSupabaseData(); }}
                onRemoveVideo={async (id) => { await removeConteudo(id); await loadSupabaseData(); }} 
              />
            )}
            {currentView === 'EXERCISE_MANAGER' && (
              <GerenciadorExercicios 
                exercises={exercises} categories={categories}
                onAddExercise={(e) => { setExercises([...exercises, e]); localStorage.setItem('lab_exercises', JSON.stringify([...exercises, e])); }}
                onRemoveExercise={(id) => { const f = exercises.filter(ex => ex.id !== id); setExercises(f); localStorage.setItem('lab_exercises', JSON.stringify(f)); }}
                onAddCategory={(c) => setCategories([...categories, c])}
              />
            )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-around z-50">
            {currentUser?.role === UserRole.PERSONAL ? (
              <>
                <button onClick={() => setCurrentView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${currentView === 'DASHBOARD' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.User className="w-6 h-6" /><span className="text-[8px] uppercase font-black">Membros</span>
                </button>
                <button onClick={() => setCurrentView('EXERCISE_MANAGER')} className={`flex flex-col items-center gap-1 ${currentView === 'EXERCISE_MANAGER' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.Dumbbell className="w-6 h-6" /><span className="text-[8px] uppercase font-black">Lab</span>
                </button>
                <button onClick={() => setCurrentView('VIDEO_MANAGER')} className={`flex flex-col items-center gap-1 ${currentView === 'VIDEO_MANAGER' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.Play className="w-6 h-6" /><span className="text-[8px] uppercase font-black">Aulas</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentView('STUDENT_VIEW')} className={`flex flex-col items-center gap-1 ${currentView === 'STUDENT_VIEW' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.Dumbbell className="w-6 h-6" /><span className="text-[8px] uppercase font-black">Treino</span>
                </button>
                <button onClick={() => setCurrentView('PROFILE_VIEW')} className={`flex flex-col items-center gap-1 ${currentView === 'PROFILE_VIEW' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.User className="w-6 h-6" /><span className="text-[8px] uppercase font-black">Evolução</span>
                </button>
                <button onClick={() => setCurrentView('VIDEO_LIBRARY')} className={`flex flex-col items-center gap-1 ${currentView === 'VIDEO_LIBRARY' ? 'text-orange-500' : 'text-slate-500'}`}>
                  <Icons.Play className="w-6 h-6" /><span className="text-[8px] uppercase font-black tracking-widest">Aulas</span>
                </button>
              </>
            )}
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
