
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, PlanilhaTreino, Exercise, CheckIn, EvolutionEntry, Biometrics, VideoContent, LoadEntry } from './types';
import { MOCK_PERSONAL, MOCK_STUDENTS, INITIAL_EXERCISES, MOCK_EVOLUTION } from './mockData';
import PersonalDashboard from './components/PersonalDashboard';
import StudentView from './components/StudentView';
import WorkoutEditor from './components/WorkoutEditor';
import ProfileView from './components/ProfileView';
import VideoLibrary from './components/VideoLibrary';
import VideoManager from './components/VideoManager';
import GerenciadorExercicios from './components/GerenciadorExercicios';
import { Icons } from './constants';
import { salvarCarga } from './persistenceService';

const App: React.FC = () => {
  // State Initialization
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<PlanilhaTreino[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>(['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio']);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [evolution, setEvolution] = useState<EvolutionEntry[]>(MOCK_EVOLUTION);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loadHistory, setLoadHistory] = useState<LoadEntry[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  
  // Auth Form State
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Navigation State
  const [currentView, setCurrentView] = useState<'LOGIN' | 'DASHBOARD' | 'STUDENT_VIEW' | 'WORKOUT_EDITOR' | 'PROFILE_VIEW' | 'VIDEO_LIBRARY' | 'VIDEO_MANAGER' | 'EXERCISE_MANAGER'>('LOGIN');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Persistence Synchronizer
  const syncStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Erro ao sincronizar ${key}:`, e);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Carregar Base de Dados (Prioridade LocalStorage > Mocks)
        const storedStudents = localStorage.getItem('students');
        const loadedStudents: User[] = storedStudents ? JSON.parse(storedStudents) : MOCK_STUDENTS;
        
        const storedExercises = localStorage.getItem('lab_exercises');
        const loadedExercises: Exercise[] = storedExercises ? JSON.parse(storedExercises) : INITIAL_EXERCISES;

        const storedCategories = localStorage.getItem('lab_categories');
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        
        setStudents(loadedStudents);
        setExercises(loadedExercises);
        setWorkouts(JSON.parse(localStorage.getItem('workouts') || '[]'));
        setCheckins(JSON.parse(localStorage.getItem('checkins') || '[]'));
        setVideos(JSON.parse(localStorage.getItem('video_library') || '[]'));
        setLoadHistory(JSON.parse(localStorage.getItem('load_history') || '[]'));

        // 2. Persistência de Sessão (Tratamento F5)
        const storedUser = localStorage.getItem('currentUser');
        const storedView = localStorage.getItem('currentView');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          if (storedView) setCurrentView(storedView as any);
          else setCurrentView(parsedUser.role === UserRole.PERSONAL ? 'DASHBOARD' : 'STUDENT_VIEW');
        }

        // 3. Validação de Magic Token (Acesso sem senha)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
          setIsValidatingToken(true);
          await new Promise(resolve => setTimeout(resolve, 800)); 
          try {
            const decodedEmail = atob(token).toLowerCase().trim();
            const student = loadedStudents.find(s => s.email.toLowerCase().trim() === decodedEmail);
            if (student) {
              setCurrentUser(student);
              setCurrentView('STUDENT_VIEW');
              localStorage.setItem('currentUser', JSON.stringify(student));
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) { console.error("Protocolo Inválido", e); }
          setIsValidatingToken(false);
        }
      } catch (error) {
        console.error("Falha na inicialização do Lab:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Update storage on session change
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cleanEmail = identifier.toLowerCase().trim();
    const cleanPass = password.trim();

    if (loginRole === UserRole.PERSONAL) {
      if (cleanEmail === 'jorge@prado.com' || (cleanEmail === 'admin@teste.com' && cleanPass === '123')) {
        setCurrentUser(MOCK_PERSONAL);
        setCurrentView('DASHBOARD');
      } else {
        alert("Acesso Negado: Credenciais Jorge Prado inválidas.");
      }
    } else {
      // Emergency/Dev login
      if (cleanEmail === 'aluno@teste.com' && cleanPass === '123') {
        const student = students[0];
        setCurrentUser(student);
        setCurrentView('STUDENT_VIEW');
        setIsLoggingIn(false);
        return;
      }

      const student = students.find(s => s.email.toLowerCase().trim() === cleanEmail);
      if (student) {
        setCurrentUser(student);
        setCurrentView('STUDENT_VIEW');
      } else {
        alert("E-mail não cadastrado no Team Prado. Verifique com o Treinador Jorge.");
      }
    }
    setIsLoggingIn(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
    setLoginRole(null);
    setIdentifier('');
    setPassword('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentView');
  };

  // handlers com persistência automática
  const handleAddMember = (newMember: User) => {
    const updated = [...students, newMember];
    setStudents(updated);
    syncStorage('students', updated);
  };

  const handleUpdateMember = (updatedMember: User) => {
    const updated = students.map(s => s.id === updatedMember.id ? updatedMember : s);
    setStudents(updated);
    syncStorage('students', updated);
    if (currentUser?.id === updatedMember.id) setCurrentUser(updatedMember);
  };

  const handleAddExercise = (newEx: Exercise) => {
    const updated = [...exercises, newEx];
    setExercises(updated);
    syncStorage('lab_exercises', updated);
  };

  const handleRemoveExercise = (id: string) => {
    const updated = exercises.filter(ex => ex.id !== id);
    setExercises(updated);
    syncStorage('lab_exercises', updated);
  };

  const handleAddCategory = (cat: string) => {
    const updated = [...categories, cat];
    setCategories(updated);
    syncStorage('lab_categories', updated);
  };

  const handleAddVideo = (newVideo: VideoContent) => {
    const updated = [newVideo, ...videos];
    setVideos(updated);
    syncStorage('video_library', updated);
  };

  const handleRemoveVideo = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    syncStorage('video_library', updated);
  };

  const handleSaveWorkout = (workout: PlanilhaTreino) => {
    const updated = [...workouts.filter(w => w.id_aluno !== workout.id_aluno), workout];
    setWorkouts(updated);
    syncStorage('workouts', updated);
    setCurrentView('DASHBOARD');
  };

  const addCheckIn = (checkin: CheckIn) => {
    const updated = [...checkins, checkin];
    setCheckins(updated);
    syncStorage('checkins', updated);
  };

  const handleRegisterLoad = async (entry: LoadEntry) => {
    await salvarCarga(entry);
    setLoadHistory(prev => [...prev, entry]);
  };

  const handleUpdateBiometrics = (metrics: Biometrics) => {
    const newEntry: EvolutionEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      biometrics: metrics,
      photos: {}
    };
    setEvolution(prev => [newEntry, ...prev]);
  };

  if (isLoading || isValidatingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-orange-500">
            <Icons.Activity className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-orange-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">
            {isValidatingToken ? 'Protocolo de Acesso Prado' : 'Prado Fit Lab • Sincronizando'}
          </p>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Performance & Biomecânica</p>
        </div>
      </div>
    );
  }

  if (currentView === 'LOGIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-sm:px-4 max-w-sm space-y-12">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-orange-500/10 flex items-center justify-center rounded-[24px] border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
              <Icons.Dumbbell className="text-orange-500" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                PRADO <span className="text-orange-400">FIT LAB</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Performance System</p>
            </div>
          </div>

          {!loginRole ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setLoginRole(UserRole.PERSONAL)}
                className="w-full flex items-center justify-between p-6 rounded-[32px] bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition-all group shadow-xl text-left"
              >
                <div>
                  <p className="font-black text-white text-lg uppercase tracking-tight">Gestão Treinador Jorge</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Área de Prescrição</p>
                </div>
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                  <Icons.User />
                </div>
              </button>

              <button
                onClick={() => setLoginRole(UserRole.STUDENT)}
                className="w-full flex items-center justify-between p-6 rounded-[32px] bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition-all group shadow-xl text-left"
              >
                <div>
                  <p className="font-black text-white text-lg uppercase tracking-tight">Membro Team Prado</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acessar Meu Treino</p>
                </div>
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                  <Icons.Dumbbell />
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={() => setLoginRole(null)} disabled={isLoggingIn} className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" /></svg>
                  Voltar
                </button>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Acesso Restrito</span>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Seu E-mail de Acesso"
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all"
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl shadow-2xl shadow-orange-500/10 uppercase tracking-widest text-sm disabled:opacity-70 transition-all"
              >
                {isLoggingIn ? 'Autenticando...' : 'Entrar no Lab'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-950">
      <header className="sticky top-0 z-[60] flex items-center justify-between px-8 py-5 bg-slate-950/90 backdrop-blur-xl border-b border-slate-900">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
            <Icons.Dumbbell />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">PRADO <span className="text-orange-400">LAB</span></span>
        </div>
        <button onClick={logout} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Sair</button>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {currentView === 'DASHBOARD' && (
          <PersonalDashboard 
            students={students} 
            workouts={workouts} 
            onOpenWorkoutEditor={(sid) => { setSelectedStudentId(sid); setCurrentView('WORKOUT_EDITOR'); }} 
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            checkins={checkins}
          />
        )}

        {currentView === 'WORKOUT_EDITOR' && selectedStudentId && (
          <WorkoutEditor 
            student={students.find(s => s.id === selectedStudentId)!}
            existingWorkout={workouts.find(w => w.id_aluno === selectedStudentId)}
            exercisesLibrary={exercises}
            onSave={handleSaveWorkout}
            onCancel={() => setCurrentView('DASHBOARD')}
            loadHistory={loadHistory}
          />
        )}

        {currentView === 'EXERCISE_MANAGER' && (
          <GerenciadorExercicios 
            exercises={exercises}
            categories={categories}
            onAddExercise={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
            onAddCategory={handleAddCategory}
          />
        )}

        {currentView === 'VIDEO_MANAGER' && (
          <VideoManager 
            videos={videos} 
            onAddVideo={handleAddVideo} 
            onRemoveVideo={handleRemoveVideo} 
          />
        )}

        {currentView === 'STUDENT_VIEW' && (
          <StudentView 
            student={currentUser!} 
            workout={workouts.find(w => w.id_aluno === currentUser?.id)} 
            onCheckIn={addCheckIn}
            onRegisterLoad={handleRegisterLoad}
            loadHistory={loadHistory}
          />
        )}

        {currentView === 'PROFILE_VIEW' && (
          <ProfileView 
            student={currentUser!} 
            evolutionHistory={evolution} 
            onUpdateBiometrics={handleUpdateBiometrics}
            checkins={checkins}
          />
        )}

        {currentView === 'VIDEO_LIBRARY' && (
          <VideoLibrary videos={videos} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around z-50">
        {currentUser?.role === UserRole.PERSONAL ? (
          <>
            <button onClick={() => setCurrentView('DASHBOARD')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'DASHBOARD' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.User className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Membros</span>
            </button>
            <button onClick={() => setCurrentView('EXERCISE_MANAGER')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'EXERCISE_MANAGER' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.Dumbbell className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Exercícios</span>
            </button>
            <button onClick={() => setCurrentView('VIDEO_MANAGER')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'VIDEO_MANAGER' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.Play className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Conteúdo</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setCurrentView('STUDENT_VIEW')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'STUDENT_VIEW' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.Dumbbell className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Treino</span>
            </button>
            <button onClick={() => setCurrentView('VIDEO_LIBRARY')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'VIDEO_LIBRARY' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.Play className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Mundo Fit</span>
            </button>
            <button onClick={() => setCurrentView('PROFILE_VIEW')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'PROFILE_VIEW' ? 'text-orange-500' : 'text-slate-500'}`}>
              <Icons.User className="w-6 h-6" /><span className="text-[9px] uppercase font-black tracking-widest">Perfil</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default App;
