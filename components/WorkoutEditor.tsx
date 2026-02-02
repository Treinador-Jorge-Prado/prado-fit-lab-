
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, PlanilhaTreino, SelecedExercise, Exercise, LoadEntry, DivisaoTreino } from '../types';
import { Icons } from '../constants';
import { salvarTreino } from '../persistenceService';
import VideoModal from './VideoModal';

interface WorkoutEditorProps {
  student: User;
  existingWorkout?: PlanilhaTreino;
  exercisesLibrary: Exercise[];
  onSave: (workout: PlanilhaTreino) => void;
  onCancel: () => void;
  loadHistory: LoadEntry[];
}

const HistoryModal: React.FC<{ studentId: string; exerciseId: string; exerciseName: string; onClose: () => void; loadHistory: LoadEntry[] }> = ({ studentId, exerciseId, exerciseName, onClose, loadHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Update chart whenever data changes
  useEffect(() => {
    if (canvasRef.current) {
      const entries = (loadHistory || [])
        .filter(h => h.studentId === studentId && h.exerciseId === exerciseId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore
        new window.Chart(ctx, {
          type: 'line',
          data: {
            // Fix possible 'unknown' type error by adding explicit type for entries map
            labels: entries.map((e: LoadEntry) => new Date(e.timestamp).toLocaleDateString('pt-BR')),
            datasets: [{
              label: 'Carga (kg)',
              data: entries.map((e: LoadEntry) => e.weight),
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 4,
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#475569' } },
              x: { grid: { display: false }, ticks: { color: '#475569' } }
            }
          }
        });
      }
    }
  }, [studentId, exerciseId, loadHistory]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Histórico de Força</h3>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{exerciseName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <Icons.Plus className="rotate-45" />
          </button>
        </div>
        <div className="h-64 relative">
          <canvas ref={canvasRef}></canvas>
        </div>
        <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Gestão Treinador Jorge • Lab Data</p>
      </div>
    </div>
  );
};

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ 
  student, 
  existingWorkout, 
  exercisesLibrary,
  onSave, 
  onCancel,
  loadHistory
}) => {
  const [nomePlanilha, setNomePlanilha] = useState(existingWorkout?.nome_da_planilha || 'NOVO PROTOCOLO');
  const [divisoes, setDivisoes] = useState<DivisaoTreino[]>(existingWorkout?.divisoes || [{ letra: 'A', nome: 'TREINO A', exercicios: [] }]);
  const [activeLetra, setActiveLetra] = useState(divisoes[0]?.letra || 'A');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [previewEx, setPreviewEx] = useState<Exercise | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{ id: string; name: string } | null>(null);

  const activeDivisao = useMemo(() => divisoes.find(d => d.letra === activeLetra) || divisoes[0], [divisoes, activeLetra]);

  const categories = useMemo(() => {
    // Add explicit type and fallback to avoid unknown type issues
    const cats = new Set((exercisesLibrary || []).map(ex => ex.grupo_muscular));
    return ['Todos', ...Array.from(cats).sort()];
  }, [exercisesLibrary]);

  const filteredLibrary = useMemo(() => {
    let result = exercisesLibrary || [];
    if (activeCategory !== 'Todos') result = result.filter(ex => ex.grupo_muscular === activeCategory);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(ex => 
        ex.nome.toLowerCase().includes(lower) || 
        ex.grupo_muscular.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [searchTerm, activeCategory, exercisesLibrary]);

  const groupedLibrary = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredLibrary.forEach(ex => {
      if (!groups[ex.grupo_muscular]) groups[ex.grupo_muscular] = [];
      groups[ex.grupo_muscular].push(ex);
    });
    return groups;
  }, [filteredLibrary]);

  const addExercise = (ex: Exercise) => {
    const newEntry: SelecedExercise = {
      id_exercicio: ex.id,
      nome: ex.nome,
      series: 3,
      repeticoes: '12',
      descanso: '60s',
      observacoes_especificas: '',
      grupo_muscular: ex.grupo_muscular,
      equipamento: ex.equipamento
    };
    
    setDivisoes(prev => prev.map(d => 
      d.letra === activeLetra 
      ? { ...d, exercicios: [...d.exercicios, newEntry] }
      : d
    ));
  };

  const removeExercise = (idx: number) => {
    setDivisoes(prev => prev.map(d => 
      d.letra === activeLetra 
      ? { ...d, exercicios: d.exercicios.filter((_, i) => i !== idx) }
      : d
    ));
  };

  const updateExercise = (idx: number, updates: Partial<SelecedExercise>) => {
    setDivisoes(prev => prev.map(d => 
      d.letra === activeLetra 
      ? { ...d, exercicios: d.exercicios.map((ex, i) => i === idx ? { ...ex, ...updates } : ex) }
      : d
    ));
  };

  const updateDivisaoNome = (nome: string) => {
    setDivisoes(prev => prev.map(d => 
      d.letra === activeLetra ? { ...d, nome: nome.toUpperCase() } : d
    ));
  };

  const addNovaDivisao = () => {
    const proximaLetra = String.fromCharCode(65 + divisoes.length);
    const nova: DivisaoTreino = { letra: proximaLetra, nome: `TREINO ${proximaLetra}`, exercicios: [] };
    setDivisoes([...divisoes, nova]);
    setActiveLetra(proximaLetra);
  };

  const removerDivisao = (letra: string) => {
    if (divisoes.length === 1) return;
    const filtered = divisoes.filter(d => d.letra !== letra);
    const reordered = filtered.map((d, i) => ({ ...d, letra: String.fromCharCode(65 + i) }));
    setDivisoes(reordered);
    setActiveLetra(reordered[0].letra);
  };

  const handleSaveAction = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    // Simular delay de rede/persistência
    await new Promise(resolve => setTimeout(resolve, 1000));

    const payload: PlanilhaTreino = {
      id: existingWorkout?.id || Math.random().toString(36).substr(2, 9),
      id_aluno: student.id,
      personalId: 'p1',
      data_criacao: Date.now(),
      nome_da_planilha: nomePlanilha,
      divisoes: divisoes
    };
    
    const res = await salvarTreino(student.id, payload);
    if (res.success) {
       onSave(payload);
    } else {
       alert("Erro ao salvar protocolo no banco de dados.");
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-32 max-w-5xl mx-auto">
      {previewEx && <VideoModal videoUrl={previewEx.video_url || ''} title={previewEx.nome || ''} onClose={() => setPreviewEx(null)} />}
      
      {selectedHistory && (
        <HistoryModal 
          studentId={student.id} 
          exerciseId={selectedHistory.id} 
          exerciseName={selectedHistory.name} 
          onClose={() => setSelectedHistory(null)}
          loadHistory={loadHistory}
        />
      )}

      {showLibrary && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowLibrary(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Gestão Treinador Jorge</h3>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Adicionar ao Treino {activeLetra}</p>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl transition-all">
                  <Icons.Plus className="rotate-45" />
                </button>
              </div>
              <input 
                type="text" autoFocus placeholder="BUSCAR MOVIMENTO..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-700 uppercase"
              />
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map((cat: string) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${activeCategory === cat ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">
              {Object.entries(groupedLibrary).map(([categoria, items]) => (
                <div key={categoria} className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{categoria}</h4>
                  <div className="grid gap-2">
                    {(items as Exercise[]).map((ex: Exercise) => {
                      const alreadyIn = activeDivisao?.exercicios?.some(item => item.id_exercicio === ex.id);
                      return (
                        <div key={ex.id} className={`p-4 flex items-center justify-between bg-slate-900/50 border rounded-3xl transition-all hover:bg-slate-900 group ${alreadyIn ? 'border-orange-500/30' : 'border-slate-800'}`}>
                          <div className="flex-1">
                            <p className="font-black text-white uppercase text-sm tracking-tight group-hover:text-orange-400 transition-colors">{ex.nome}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{ex.equipamento} • {ex.categoria}</p>
                          </div>
                          <button onClick={() => addExercise(ex)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${alreadyIn ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-orange-500 hover:text-slate-950'}`}>{alreadyIn ? <Icons.Check className="w-5 h-5" /> : <Icons.Plus className="w-5 h-5" />}</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER DO EDITOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-6">
        <div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors group"><span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar</button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20"><Icons.Dumbbell /></div>
             <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{student.name}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Prescrição Múltiplos Blocos</p>
             </div>
          </div>
        </div>
        <button 
          onClick={handleSaveAction} 
          disabled={isSaving} 
          className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-orange-500/20 text-xs uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Sincronizando Lab...' : 'Publicar Protocolo'}
        </button>
      </div>

      <div className="space-y-12">
        {/* NOME DA PLANILHA */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Título da Planilha de Elite</label>
          <input type="text" value={nomePlanilha} onChange={(e) => setNomePlanilha(e.target.value.toUpperCase())} className="w-full bg-slate-950 border-b-2 border-slate-900 focus:border-orange-500 text-white font-black text-4xl py-4 focus:outline-none transition-all uppercase placeholder:text-slate-900" placeholder="EX: FASE 1 - HIPERTROFIA"/>
        </div>

        {/* NAVEGAÇÃO DE DIVISÕES (TABS) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {(divisoes || []).map((d: DivisaoTreino) => (
            <div key={d.letra} className="relative group flex-shrink-0">
              <button 
                onClick={() => setActiveLetra(d.letra)}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl border-2 transition-all ${
                  activeLetra === d.letra 
                  ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-2xl shadow-orange-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-black uppercase opacity-60">Treino</span>
                <span className="text-3xl font-black">{d.letra}</span>
              </button>
              {divisoes.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); removerDivisao(d.letra); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Icons.Plus className="rotate-45 w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={addNovaDivisao}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-3xl border-2 border-dashed border-slate-800 text-slate-700 hover:text-orange-500 hover:border-orange-500 transition-all"
          >
            <Icons.Plus className="w-8 h-8" />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">Add Bloco</span>
          </button>
        </div>

        {/* CONTEÚDO DA DIVISÃO ATIVA */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[40px] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Subtítulo da Divisão {activeLetra}</label>
                <input 
                  type="text" 
                  value={activeDivisao?.nome || ''} 
                  onChange={(e) => updateDivisaoNome(e.target.value)}
                  className="bg-transparent text-2xl font-black text-white uppercase focus:outline-none border-b border-transparent focus:border-orange-500 transition-all"
                />
              </div>
              <button onClick={() => setShowLibrary(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 font-black rounded-2xl hover:bg-orange-500 transition-all text-[10px] uppercase tracking-widest shadow-xl">
                <Icons.Plus className="w-4 h-4" /> Add Exercício
              </button>
            </div>

            <div className="space-y-6">
              {activeDivisao?.exercicios && activeDivisao.exercicios.length > 0 ? (
                // Explicitly typing map parameter to resolve unknown type issues
                activeDivisao.exercicios.map((ex: SelecedExercise, idx: number) => {
                  const hist = (loadHistory || []).filter(h => h.studentId === student.id && h.exerciseId === ex.id_exercicio).sort((a,b) => b.timestamp - a.timestamp);
                  const lastWeight = hist[0]?.weight;

                  return (
                    <div key={`${ex.id_exercicio}-${idx}`} className="p-8 bg-slate-950/50 border border-slate-800 rounded-[32px] space-y-8 relative overflow-hidden group hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors">{ex.nome}</h3>
                          <div className="flex gap-2 mt-1 items-center">
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-lg">{ex.grupo_muscular}</span>
                            {lastWeight && (
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-lg">Last: {lastWeight}kg</span>
                            )}
                            <button 
                              onClick={() => setSelectedHistory({ id: ex.id_exercicio!, name: ex.nome! })}
                              className="text-[9px] font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              <Icons.Activity className="w-3 h-3" /> Histórico
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeExercise(idx)} className="w-10 h-10 rounded-xl bg-slate-950/50 flex items-center justify-center text-slate-700 hover:text-red-500 transition-all"><Icons.Trash className="w-5 h-5" /></button>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Séries</label>
                          <input type="number" value={ex.series} onChange={(e) => updateExercise(idx, { series: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 rounded-xl px-4 py-3 text-white font-black border border-slate-800 focus:border-orange-500 outline-none"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Reps</label>
                          <input type="text" value={ex.repeticoes} onChange={(e) => updateExercise(idx, { repeticoes: e.target.value })} className="w-full bg-slate-950 rounded-xl px-4 py-3 text-white font-black border border-slate-800 focus:border-orange-500 outline-none" placeholder="12-15"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Descanso</label>
                          <input type="text" value={ex.descanso} onChange={(e) => updateExercise(idx, { descanso: e.target.value })} className="w-full bg-slate-950 rounded-xl px-4 py-3 text-white font-black border border-slate-800 focus:border-orange-500 outline-none" placeholder="60s"/>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Obs</label>
                          <input type="text" value={ex.observacoes_especificas} onChange={(e) => updateExercise(idx, { observacoes_especificas: e.target.value })} className="w-full bg-slate-950 rounded-xl px-4 py-3 text-white font-bold border border-slate-800 focus:border-orange-500 outline-none" placeholder="Técnica..."/>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-[32px] space-y-4">
                  <Icons.Dumbbell className="w-10 h-10 text-slate-800" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Nenhum exercício no Bloco {activeLetra}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;
