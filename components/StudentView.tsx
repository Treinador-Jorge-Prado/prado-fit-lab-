
import React, { useState, useEffect, useRef } from 'react';
import { User, PlanilhaTreino, CheckIn, Exercise, LoadEntry, DivisaoTreino, SelecedExercise } from '../types';
import { Icons } from '../constants';
import { supabase } from '../supabaseService';

interface StudentViewProps {
  student: User;
  workouts: PlanilhaTreino[];
  onCheckIn: (checkin: CheckIn) => void;
  onRegisterLoad: (entry: LoadEntry) => void;
  loadHistory: LoadEntry[];
  onUpdateProfile?: (updated: User) => void;
}

const PasswordModal: React.FC<{ student: User; onClose: () => void; onSave: (updated: User) => void }> = ({ student, onClose, onSave }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPass !== student.password) {
      setError('Senha atual incorreta.');
      return;
    }

    if (newPass.length < 4) {
      setError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    onSave({ ...student, password: newPass });
    setSuccess(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95">
        {!success ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                <Icons.User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Minha Conta</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha Atual</label>
                <input 
                  type="password" required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
                <input 
                  type="password" required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                />
              </div>

              {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-1">{error}</p>}
            </div>

            <button className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Salvar Alterações</button>
            <button type="button" onClick={onClose} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancelar</button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4 animate-in zoom-in">
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Icons.Check className="w-8 h-8" />
            </div>
            <p className="text-white font-black uppercase tracking-tighter text-lg">Senha atualizada!</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">O Lab Prado sincronizou seus dados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentView: React.FC<StudentViewProps> = ({ student, workouts = [], onCheckIn, onRegisterLoad, loadHistory, onUpdateProfile }) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [activeLetra, setActiveLetra] = useState<string | null>(null);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  const [exerciseLoads, setExerciseLoads] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [finalDuration, setFinalDuration] = useState<number>(0);
  const [prCelebration, setPrCelebration] = useState<{ exercise: string; weight: number } | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const stopwatchInterval = useRef<number | null>(null);

  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const restInterval = useRef<number | null>(null);

  const workout = workouts.find(w => w.id === selectedWorkoutId);

  useEffect(() => {
    if (isWorkoutStarted && !isPaused) {
      stopwatchInterval.current = window.setInterval(() => {
        setStopwatchSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);
    }
    return () => { if (stopwatchInterval.current) clearInterval(stopwatchInterval.current); };
  }, [isWorkoutStarted, isPaused]);

  useEffect(() => {
    if (restSeconds !== null && restSeconds > 0) {
      restInterval.current = window.setInterval(() => {
        setRestSeconds(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (restSeconds === 0) {
      if (restInterval.current) clearInterval(restInterval.current);
      if ('vibrate' in navigator) navigator.vibrate(500);
      setRestSeconds(null);
    }
    return () => { if (restInterval.current) clearInterval(restInterval.current); };
  }, [restSeconds]);

  useEffect(() => {
    if (!activeLetra && workout?.divisoes?.[0]) {
      setActiveLetra(workout.divisoes[0].letra);
    }
  }, [workout, activeLetra]);

  const activeDivisao = workout?.divisoes?.find(d => d.letra === activeLetra);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setIsWorkoutStarted(true);
    setStopwatchSeconds(0);
    setIsPaused(false);
  };

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
  };

  const toggleCheck = (id: string) => {
    setCheckedExercises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFinish = async () => {
    if (!workout || !activeDivisao) return;
    
    setIsCompleting(true);
    const currentDuration = stopwatchSeconds;
    setFinalDuration(currentDuration);

    const cargasParaSalvar: any[] = [];
    const timestampRegistro = new Date().toISOString();

    activeDivisao.exercicios?.forEach((ex, idx) => {
      const exId = ex.id_exercicio;
      const key = `${exId}-${idx}`;
      const loadStr = exerciseLoads[key];
      if (loadStr) {
        const weight = parseFloat(loadStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(weight)) {
          const nomeExercicioUpper = ex.nome.toUpperCase().trim();
          
          cargasParaSalvar.push({
            aluno_id: student.id,
            exercicio: nomeExercicioUpper,
            carga: weight,
            data_registro: timestampRegistro
          });

          const previousMax = Math.max(0, ...loadHistory
            .filter(h => h.studentId === student.id && h.exerciseId === exId)
            .map(h => h.weight));

          if (weight > previousMax && previousMax > 0) {
            setPrCelebration({ exercise: nomeExercicioUpper, weight });
          }

          onRegisterLoad({
            id: Math.random().toString(36).substr(2, 9),
            studentId: student.id,
            exerciseId: exId,
            weight,
            timestamp: Date.now()
          });
        }
      }
    });

    if (cargasParaSalvar.length > 0) {
      try {
        const { error } = await supabase.from('historico_cargas').insert(cargasParaSalvar);
        if (error) console.error("Erro Supabase:", error.message);
      } catch (err) {
        console.error("Erro ao sincronizar cargas automáticas:", err);
      }
    }

    onCheckIn({
      id: Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      workoutId: workout.id,
      letraTreino: activeLetra || undefined,
      timestamp: Date.now(),
      durationSeconds: currentDuration
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsWorkoutStarted(false);
    setIsCompleting(false);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="p-6 h-[80vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
        {prCelebration && (
          <div className="fixed top-20 left-0 right-0 px-6 z-[200] animate-bounce">
             <div className="bg-orange-500 text-slate-950 p-4 rounded-2xl shadow-2xl font-black uppercase text-xs tracking-widest border-2 border-white/20">
               🔥 Recorde Pessoal Batido! <br/> {prCelebration.exercise}: {prCelebration.weight}kg
             </div>
          </div>
        )}
        <div className="w-28 h-28 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
          <Icons.Check className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Sessão Concluída</h2>
          <p className="text-orange-500 font-black text-2xl tracking-widest font-mono">{formatTime(finalDuration)}</p>
          <p className="text-slate-400 font-medium text-lg italic mt-4">"A consistência supera a perfeição."</p>
        </div>
        <button 
          onClick={() => {
            setIsFinished(false);
            setPrCelebration(null);
            setCheckedExercises({});
            setExerciseLoads({});
            setStopwatchSeconds(0);
            setSelectedWorkoutId(null);
            setActiveLetra(null);
          }}
          className="px-8 py-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-slate-300 font-black uppercase tracking-widest hover:text-white transition-all mt-4"
        >
          Voltar aos Protocolos
        </button>
      </div>
    );
  }

  // Visualização da Lista de Protocolos
  if (!selectedWorkoutId) {
    return (
      <div className="p-6 space-y-10 max-w-2xl mx-auto animate-in fade-in duration-500 pb-32">
        {showAccountModal && (
          <PasswordModal 
            student={student} 
            onClose={() => setShowAccountModal(false)} 
            onSave={onUpdateProfile || (() => {})} 
          />
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Protocolos</h1>
            <p className="text-orange-400 font-black uppercase tracking-widest text-[10px]">Team Prado Elite Systems</p>
          </div>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-500 transition-all"
          >
            <Icons.User className="w-6 h-6" />
          </button>
        </div>

        <div className="grid gap-6">
          {workouts.length > 0 ? (
            workouts.map((w) => (
              <div 
                key={w.id}
                className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] hover:border-orange-500/40 transition-all group shadow-2xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Elite Protocol</span>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-orange-400 transition-colors">
                      {w.nome_da_planilha}
                    </h2>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <Icons.Dumbbell className="text-slate-700 w-6 h-6" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <div className="flex -space-x-2">
                    {w.divisoes?.map(d => (
                      <div key={d.letra} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {d.letra}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">
                    {w.divisoes?.length} Divisões • {w.divisoes?.reduce((acc, d) => acc + (d.exercicios?.length || 0), 0)} Exercícios
                  </span>
                </div>

                <button 
                  onClick={() => setSelectedWorkoutId(w.id)}
                  className="w-full py-5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                >
                  Iniciar Treino
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/20 space-y-6">
              <div className="p-6 bg-slate-900 text-slate-700 rounded-full">
                 <Icons.Dumbbell className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black uppercase tracking-widest text-sm italic">Nenhum protocolo prescrito</p>
                <p className="text-slate-500 italic text-xs">O Treinador Prado ainda não liberou sua carga de trabalho de elite.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Visualização do Treino Ativo (após seleção)
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500 pb-32">
      {isWorkoutStarted && (
        <div className="fixed top-20 left-0 right-0 z-50 px-6 animate-in slide-in-from-top-4">
           <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl border-2 border-orange-500/30 rounded-[32px] p-4 flex items-center justify-between shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Tempo de Sessão</span>
                <span className="text-2xl font-black text-white font-mono tracking-tighter">
                  {formatTime(stopwatchSeconds)}
                </span>
              </div>
              
              {restSeconds !== null ? (
                <div className="flex flex-col items-center bg-orange-500 text-slate-950 px-6 py-2 rounded-2xl animate-pulse">
                  <span className="text-[8px] font-black uppercase tracking-widest">Descanso</span>
                  <span className="text-xl font-black font-mono">{restSeconds}s</span>
                </div>
              ) : (
                <div className="flex gap-2">
                   {[30, 60, 90].map(s => (
                     <button 
                       key={s}
                       onClick={() => startRestTimer(s)}
                       className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black hover:bg-orange-500 hover:text-slate-950 transition-all"
                     >
                       {s}s
                     </button>
                   ))}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPaused ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {isPaused ? <Icons.Play className="w-5 h-5 fill-current" /> : <div className="w-5 h-5 flex gap-1 justify-center items-center"><div className="w-1 h-4 bg-current"></div><div className="w-1 h-4 bg-current"></div></div>}
                </button>
              </div>
           </div>
        </div>
      )}

      <div className={`space-y-4 ${isWorkoutStarted ? 'pt-24' : ''}`}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              if (isWorkoutStarted && !window.confirm("Abandonar treino em andamento?")) return;
              setSelectedWorkoutId(null);
              setIsWorkoutStarted(false);
            }} 
            className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
          >
            ← Protocolos
          </button>
          <div className="text-right">
            <h1 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">{workout?.nome_da_planilha}</h1>
            <p className="text-orange-400 font-black uppercase tracking-widest text-[8px] mt-1">Sessão Ativa</p>
          </div>
        </div>

        {!isWorkoutStarted && (
           <button 
             onClick={startWorkout}
             className="w-full py-8 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-[40px] text-2xl uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-4 group"
           >
             <Icons.Play className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
             Iniciar Bloco
           </button>
        )}

        {workout && workout.divisoes?.length > 0 && !isWorkoutStarted && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {workout.divisoes.map(d => (
              <button
                key={d.letra}
                onClick={() => {
                  setActiveLetra(d.letra);
                  setCheckedExercises({});
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center ${
                  activeLetra === d.letra
                  ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[8px] uppercase tracking-tighter opacity-70">Treino</span>
                <span className="text-2xl">{d.letra}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeDivisao && isWorkoutStarted ? (
        <div className="grid gap-6">
          <div className="p-6 bg-slate-900/60 border-2 border-slate-800 rounded-[32px] space-y-1 relative overflow-hidden group">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Executando Agora</p>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{activeDivisao.nome}</h2>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
               <Icons.Dumbbell className="w-24 h-24" />
            </div>
          </div>

          <div className="space-y-5">
            {activeDivisao.exercicios?.length > 0 ? (
              activeDivisao.exercicios.map((ex, idx) => {
                const exId = ex.id_exercicio;
                const key = `${exId}-${idx}`;
                
                const userHistory = loadHistory
                  .filter(h => h.studentId === student.id && h.exerciseId === exId)
                  .sort((a, b) => b.timestamp - a.timestamp);
                const lastLoad = userHistory[0]?.weight;

                return (
                  <div 
                    key={key}
                    className={`p-6 rounded-[32px] border-2 transition-all duration-500 shadow-xl ${
                      checkedExercises[key] 
                        ? 'bg-orange-500/5 border-orange-500/40 opacity-50 grayscale scale-[0.98]' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 mr-2">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase tracking-tighter">{ex.grupo_muscular}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-tighter">{ex.equipamento}</span>
                          {lastLoad && <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-tighter">PR: {lastLoad}kg</span>}
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{ex.nome}</h3>
                        {ex.instrucoes && (
                          <p className="mt-2 text-xs font-medium text-slate-400 italic leading-relaxed">
                            "{ex.instrucoes}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {ex.video_url && (
                          <button 
                            onClick={() => window.open(ex.video_url, '_blank')}
                            className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-950 flex items-center justify-center transition-all flex-shrink-0"
                            title="Ver Vídeo Tutorial"
                          >
                            <Icons.Play className="w-6 h-6 fill-current" />
                          </button>
                        )}
                        <button 
                          onClick={() => toggleCheck(key)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 flex-shrink-0 ${
                            checkedExercises[key]
                              ? 'bg-orange-500 text-slate-950'
                              : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                          }`}
                        >
                          <Icons.Check className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Séries</p>
                        <p className="text-lg font-black text-white">{ex.series}</p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Reps</p>
                        <p className="text-lg font-black text-white">{ex.repeticoes}</p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 overflow-hidden">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Descanso</p>
                        <p className="text-[11px] font-black text-orange-400 truncate">{ex.descanso || '---'}</p>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-2xl border border-orange-500/20">
                        <p className="text-[8px] text-orange-500 uppercase font-black tracking-widest mb-1">Peso (kg)</p>
                        <input 
                          type="number"
                          placeholder="0"
                          value={exerciseLoads[key] || ''}
                          onChange={(e) => setExerciseLoads({...exerciseLoads, [key]: e.target.value})}
                          className="w-full bg-transparent text-lg font-black text-white focus:outline-none placeholder:text-slate-800"
                        />
                      </div>
                    </div>

                    {ex.observacoes_especificas && (
                       <div className="px-4 py-2 bg-slate-800/50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 italic">Obs Jorge: {ex.observacoes_especificas}</p>
                       </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-slate-900/40 rounded-[32px] border border-slate-800">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Nenhum exercício prescrito para este bloco.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleFinish}
            disabled={isCompleting || Object.values(checkedExercises).filter(Boolean).length === 0}
            className="w-full mt-6 py-6 bg-slate-950 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-slate-950 text-xl font-black rounded-3xl transition-all shadow-2xl shadow-orange-500/10 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
          >
            {isCompleting ? 'Sincronizando Sessão...' : 'Finalizar Sessão'}
          </button>
        </div>
      ) : (
        !isWorkoutStarted && (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/20 space-y-6">
            <div className="p-6 bg-slate-900 text-slate-700 rounded-full">
               <Icons.Dumbbell className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-black uppercase tracking-widest text-sm italic">Divisão não selecionada</p>
              <p className="text-slate-500 italic text-xs">Selecione uma letra do treino para carregar os exercícios de elite.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default StudentView;
