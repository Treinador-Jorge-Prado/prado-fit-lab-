
import React, { useState, useEffect, useRef } from 'react';
import { User, EvolutionEntry, Biometrics, CheckIn, PlanilhaTreino } from '../types';
import { Icons } from '../constants';
import { supabase } from '../supabaseService';

interface ProfileViewProps {
  student: User;
  evolutionHistory: EvolutionEntry[];
  onUpdateBiometrics: (metrics: Biometrics) => void;
  checkins?: CheckIn[];
  onUploadShape?: (file: File) => Promise<void>;
  isTrainerMode?: boolean;
  onBack?: () => void;
  workout?: PlanilhaTreino;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  student, evolutionHistory, onUpdateBiometrics, checkins = [], onUploadShape, isTrainerMode, onBack, workout 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [muralFotos, setMuralFotos] = useState<any[]>([]);
  const [isLoadingGaleria, setIsLoadingGaleria] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  
  // Load tracking states
  const [historicoCargas, setHistoricoCargas] = useState<any[]>([]);
  const [todosRegistrosCargas, setTodosRegistrosCargas] = useState<any[]>([]); 
  const [isLoadingCargas, setIsLoadingCargas] = useState(true);
  const [listaExercicios, setListaExercicios] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [recordeAtual, setRecordeAtual] = useState<number | null>(null);
  const [miniHistorico, setMiniHistorico] = useState<any[]>([]);
  const [showMiniHistorico, setShowMiniHistorico] = useState(false);
  
  // Modal de Histórico Gráfico
  const [exercicioSelecionado, setExercicioSelecionado] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // PR Celebration State
  const [showPRBanner, setShowPRBanner] = useState(false);
  const [prDetails, setPrDetails] = useState({ exercise: '', oldWeight: 0, newWeight: 0 });

  // Form states
  const [novoExercicio, setNovoExercicio] = useState('');
  const [novaCarga, setNovaCarga] = useState('');
  const [isSavingCarga, setIsSavingCarga] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const buscarDados = async () => {
    if (!student?.id) return;
    setIsLoadingGaleria(true);
    setIsLoadingCargas(true);
    
    // 1. Mural de Fotos
    const { data: fotos, error: errorFotos } = await supabase
      .from('evolucao_fotos')
      .select('*')
      .eq('aluno_id', student.id);
    
    if (!errorFotos) {
      const ordenadas = (fotos || []).sort((a, b) => 
        new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime()
      );
      setMuralFotos(ordenadas);
    }

    // 2. Histórico de Cargas
    const { data: cargas, error: errorCargas } = await supabase
      .from('historico_cargas')
      .select('*')
      .eq('aluno_id', student.id)
      .order('data_registro', { ascending: false });

    if (!errorCargas && cargas) {
      setTodosRegistrosCargas(cargas);

      const uniqueRecordsMap = new Map();
      cargas.forEach(item => {
        const nomeUpper = item.exercicio.toUpperCase();
        if (!uniqueRecordsMap.has(nomeUpper)) {
          uniqueRecordsMap.set(nomeUpper, item);
        }
      });
      setHistoricoCargas(Array.from(uniqueRecordsMap.values()));

      const nomesExFromHist = new Set(cargas.map(c => c.exercicio.toUpperCase()));
      const nomesExFromWorkout = new Set<string>();
      
      if (workout?.divisoes) {
        workout.divisoes.forEach(d => {
          d.exercicios.forEach(ex => nomesExFromWorkout.add(ex.nome.toUpperCase()));
        });
      }

      setListaExercicios(Array.from(new Set([...nomesExFromHist, ...nomesExFromWorkout])));
    }

    setIsLoadingGaleria(false);
    setIsLoadingCargas(false);
  };

  useEffect(() => {
    buscarDados();
  }, [student.id]);

  // Chart Rendering Logic
  useEffect(() => {
    if (exercicioSelecionado && chartRef.current && todosRegistrosCargas.length > 0) {
      const registrosFiltrados = todosRegistrosCargas
        .filter(r => r.exercicio.toUpperCase() === exercicioSelecionado.toUpperCase())
        .sort((a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime());

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore - Chart is loaded globally in index.html
        chartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: registrosFiltrados.map(r => new Date(r.data_registro).toLocaleDateString('pt-BR')),
            datasets: [{
              label: 'Carga (kg)',
              data: registrosFiltrados.map(r => r.carga),
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#f97316',
              pointBorderColor: '#fff',
              pointHoverRadius: 6,
              fill: true,
              tension: 0.4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Inter', weight: 'bold' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 12,
                displayColors: false
              }
            },
            scales: {
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b', font: { weight: 'bold', size: 10 } }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { weight: 'bold', size: 10 } }
              }
            }
          }
        });
      }
    }
  }, [exercicioSelecionado, todosRegistrosCargas]);

  // Autocomplete & PR logic
  useEffect(() => {
    const exUpper = novoExercicio.toUpperCase().trim();
    if (exUpper.length > 1) {
      const filtered = listaExercicios.filter(ex => ex.includes(exUpper) && ex !== exUpper);
      setSugestoes(filtered.slice(0, 5));

      const match = todosRegistrosCargas.filter(r => r.exercicio.toUpperCase() === exUpper);
      if (match.length > 0) {
        const currentPR = Math.max(...match.map(r => r.carga));
        setRecordeAtual(currentPR);
        setMiniHistorico(match.slice(0, 3));
      } else {
        setRecordeAtual(null);
        setMiniHistorico([]);
      }
    } else {
      setSugestoes([]);
      setRecordeAtual(null);
      setMiniHistorico([]);
    }
  }, [novoExercicio, listaExercicios, todosRegistrosCargas]);

  const handleSaveCarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoExercicio || !novaCarga) return;

    const cargaNumerica = parseFloat(novaCarga.replace(/[^0-9.]/g, ''));
    if (isNaN(cargaNumerica)) return;

    const exercicioFinal = novoExercicio.toUpperCase().trim();
    setIsSavingCarga(true);

    try {
      if (recordeAtual !== null && cargaNumerica > recordeAtual) {
        setPrDetails({ exercise: exercicioFinal, oldWeight: recordeAtual, newWeight: cargaNumerica });
        setShowPRBanner(true);
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 200]);
        setTimeout(() => setShowPRBanner(false), 4000);
      }

      const hoje = new Date().toISOString().split('T')[0];
      const { data: registrosHoje } = await supabase
        .from('historico_cargas')
        .select('id')
        .eq('aluno_id', student.id)
        .eq('exercicio', exercicioFinal)
        .gte('data_registro', `${hoje}T00:00:00`)
        .lte('data_registro', `${hoje}T23:59:59`)
        .single();

      if (registrosHoje) {
        await supabase.from('historico_cargas').update({ carga: cargaNumerica }).eq('id', registrosHoje.id);
      } else {
        await supabase.from('historico_cargas').insert([{
          aluno_id: student.id,
          exercicio: exercicioFinal,
          carga: cargaNumerica,
          data_registro: new Date().toISOString()
        }]);
      }

      await buscarDados();
      setNovoExercicio('');
      setNovaCarga('');
      setShowMiniHistorico(false);
    } catch (err) {
      console.error('Erro ao salvar carga:', err);
    } finally {
      setIsSavingCarga(false);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const diff = Date.now() - created;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return `Há ${days} dias`;
  };

  const studentCheckins = checkins.filter(c => c.studentId === student.id);

  // Helper for Table Delta Calculation
  const getProgressDelta = (registros: any[], index: number) => {
    if (index === registros.length - 1) return null;
    const diff = registros[index].carga - registros[index + 1].carga;
    return diff;
  };

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-700 pb-32 max-w-2xl mx-auto relative">
      
      {/* BANNER DE RECORDE (PR) */}
      {showPRBanner && (
        <div className="fixed top-10 left-0 right-0 z-[300] flex justify-center px-6 pointer-events-none">
          <div className="bg-orange-500 text-slate-950 p-6 rounded-[32px] shadow-[0_0_80px_rgba(249,115,22,0.6)] border-4 border-white/30 animate-in slide-in-from-top-20 duration-500 flex flex-col items-center text-center backdrop-blur-md">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Icons.Activity className="w-8 h-8 animate-pulse text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none">NOVO RECORDE NO LAB! 🔥</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 px-4 opacity-90">
              {prDetails.exercise}: {prDetails.oldWeight}kg → <span className="text-white text-sm">{prDetails.newWeight}kg</span>
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO GRÁFICO */}
      {exercicioSelecionado && (
        <div className="fixed inset-0 z-[400] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setExercicioSelecionado(null)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{exercicioSelecionado}</h3>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Icons.Activity className="w-3 h-3" /> Análise de Evolução Lab
                </p>
              </div>
              <button 
                onClick={() => setExercicioSelecionado(null)}
                className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Gráfico */}
              <div className="h-64 bg-slate-950/40 rounded-[32px] p-6 border border-slate-800/50 relative">
                <canvas ref={chartRef}></canvas>
              </div>

              {/* Tabela de Progressão */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logs de Performance</h4>
                  <span className="text-[10px] font-black text-slate-700 uppercase">{todosRegistrosCargas.filter(r => r.exercicio.toUpperCase() === exercicioSelecionado.toUpperCase()).length} Registros</span>
                </div>
                
                <div className="bg-slate-950/30 rounded-[32px] border border-slate-800/30 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800/50">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Data</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Carga</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Evolução</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {todosRegistrosCargas
                        .filter(r => r.exercicio.toUpperCase() === exercicioSelecionado.toUpperCase())
                        .map((r, i, arr) => {
                          const delta = getProgressDelta(arr, i);
                          return (
                            <tr key={r.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                                {new Date(r.data_registro).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 text-sm font-black text-white">
                                {r.carga}kg
                              </td>
                              <td className="px-6 py-4 text-right">
                                {delta !== null ? (
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${delta >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {delta >= 0 ? '+' : ''}{delta}kg
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">Início</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Team Prado Lab Analytics</p>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DE PERFIL */}
      <div className="flex flex-col items-center text-center space-y-5 pt-8 relative">
        {isTrainerMode && onBack && (
          <button onClick={onBack} className="absolute top-8 left-0 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
            ← Voltar ao Painel
          </button>
        )}
        
        <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 p-1 overflow-hidden shadow-2xl relative group">
          <img 
            src={student?.url_shape_atual || student?.profileImage || `https://ui-avatars.com/api/?name=${student?.name}&background=f97316&color=fff&size=200`} 
            className="w-full h-full object-cover rounded-full bg-slate-800"
            alt="Destaque Atual"
            referrerPolicy="no-referrer"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center rounded-full">
               <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{student?.name}</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">
            {isTrainerMode ? 'Inspeção de Performance' : 'Membro Team Prado'}
          </p>
        </div>
      </div>

      {/* DASHBOARD RÁPIDO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Treinos no Lab</p>
          <p className="text-3xl font-black text-white">{studentCheckins.length}</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 text-right">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-right">Mural Evolução</p>
          <p className="text-3xl font-black text-orange-500">{muralFotos.length}</p>
        </div>
      </div>

      {/* PROGRESSÃO DE FORÇA */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Activity className="w-4 h-4 text-orange-500" /> 📈 Progressão de Força
          </h2>
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Clique p/ Analisar</span>
        </div>

        {/* Formulário Inteligente (Apenas Aluno) */}
        {!isTrainerMode && (
          <div className="relative">
            <form onSubmit={handleSaveCarga} className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Campo Exercício com Autocomplete */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exercício</label>
                    {recordeAtual && (
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-1">
                        <Icons.Check className="w-3 h-3" /> PR: {recordeAtual}kg
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" required placeholder="NOME DO MOVIMENTO"
                    value={novoExercicio}
                    onChange={e => setNovoExercicio(e.target.value)}
                    onFocus={() => setShowMiniHistorico(false)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase focus:border-orange-500 outline-none transition-all placeholder:text-slate-800 text-sm"
                  />
                  {sugestoes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                      {sugestoes.map(s => (
                        <button 
                          key={s} type="button" 
                          onClick={() => setNovoExercicio(s)}
                          className="w-full px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase hover:bg-orange-500 hover:text-slate-950 transition-all border-b border-slate-800 last:border-0"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campo Carga com Mini Histórico */}
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Carga (kg)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" required placeholder="PESO"
                      value={novaCarga}
                      onChange={e => setNovaCarga(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black focus:border-orange-500 outline-none transition-all placeholder:text-slate-800 text-sm pr-12"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowMiniHistorico(!showMiniHistorico)}
                      disabled={miniHistorico.length === 0}
                      className={`absolute right-4 p-2 rounded-xl transition-all ${showMiniHistorico ? 'bg-orange-500 text-slate-950' : 'text-slate-600 hover:text-orange-500'}`}
                    >
                      <Icons.Clock className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mini Histórico Popup */}
                  {showMiniHistorico && miniHistorico.length > 0 && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Últimas Marcas</p>
                      <div className="space-y-2">
                        {miniHistorico.map((h, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-slate-900 pb-1 last:border-0">
                            <span className="text-[10px] font-black text-white">{h.carga}kg</span>
                            <span className="text-[8px] font-bold text-slate-700">{new Date(h.data_registro).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit" disabled={isSavingCarga}
                className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSavingCarga ? 'PROCESSANDO LAB...' : 'ATUALIZAR REGISTRO'}
              </button>
            </form>
          </div>
        )}

        {/* Grid de Cards de Recordes (Clicáveis para Gráfico) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingCargas ? (
            <div className="col-span-full py-10 text-center animate-pulse">
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Auditando dados de força...</p>
            </div>
          ) : historicoCargas.length > 0 ? (
            historicoCargas.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setExercicioSelecionado(item.exercicio)}
                className={`p-6 bg-slate-900/60 border rounded-[32px] group transition-all flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer ${
                  recordeAtual === item.carga && novoExercicio.toUpperCase() === item.exercicio.toUpperCase() 
                  ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                  : 'border-slate-800 hover:border-orange-500/40 hover:scale-[1.02]'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-white uppercase text-xs tracking-tight leading-none mb-1 group-hover:text-orange-400 transition-colors">{item.exercicio}</h4>
                    <Icons.Activity className={`w-3 h-3 ${item.carga >= 100 ? 'text-orange-500' : 'text-slate-700'}`} />
                  </div>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                    {getDaysAgo(item.data_registro || item.created_at)}
                  </p>
                </div>
                <div className="relative z-10 flex items-end justify-between">
                  <span className="text-3xl font-black text-white italic tracking-tighter">{item.carga}kg</span>
                  <div className="text-[8px] font-black text-orange-500/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Gráfico →</div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform">
                   <Icons.Dumbbell className="w-16 h-16" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[32px]">
               <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Nenhum recorde de elite detectado.</p>
            </div>
          )}
        </div>
      </div>

      {/* MURAL DE EVOLUÇÃO (HISTÓRICO) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Camera className="w-4 h-4 text-orange-500" /> Galeria Lab Histórico
          </h2>
          
          {!isTrainerMode && (
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUploadShape) {
                  setIsUploading(true);
                  onUploadShape(file).finally(() => setIsUploading(false));
                }
              }} />
              <button 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-2 shadow-xl shadow-orange-500/5"
              >
                {isUploading ? <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Icons.Plus className="w-3 h-3" />}
                {isUploading ? 'SINCRONIZANDO...' : 'ATUALIZAR SHAPE'}
              </button>
            </div>
          )}
        </div>
        
        {isLoadingGaleria ? (
          <div className="h-48 flex flex-col items-center justify-center bg-slate-900/40 rounded-[32px] border border-slate-800 border-dashed animate-pulse">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Acessando Galeria Lab...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {muralFotos.length > 0 ? (
              muralFotos.map((foto) => (
                <div key={foto.id} className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group transition-all duration-500 hover:scale-[1.02]">
                  <img src={foto.url_foto} alt="Evolução" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setFotoSelecionada(foto.url_foto)} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">{foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : 'Sem Data'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-24 text-center bg-slate-900/40 rounded-[32px] border border-dashed border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nenhuma foto registrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PROTOCOLO ATIVO */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
          <Icons.Dumbbell className="w-4 h-4 text-orange-500" /> Protocolo Ativo
        </h2>
        {workout ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[32px] shadow-inner">
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{workout.nome_da_planilha}</h3>
             <div className="flex gap-2 mt-6">
                {workout.divisoes.map(d => (
                   <span key={d.letra} className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-black text-orange-500">
                     {d.letra}
                   </span>
                ))}
             </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/20 border border-slate-800 rounded-[32px]">
             <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest">Aguardando Protocolo do Jorge.</p>
          </div>
        )}
      </div>

      {/* Modal de Zoom Foto */}
      {fotoSelecionada && (
        <div 
          className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setFotoSelecionada(null)}
        >
          <img src={fotoSelecionada} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" alt="Zoom" />
        </div>
      )}
    </div>
  );
};

export default ProfileView;
