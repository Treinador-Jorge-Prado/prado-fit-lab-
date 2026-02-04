
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  // Helper: Cálculo de tempo relativo para recordes (Internalizado para evitar erros de escopo)
  const getDaysAgo = (dateString: string) => {
    if (!dateString) return '';
    const data = new Date(dateString);
    const hoje = new Date();
    const diferencaEmTempo = hoje.getTime() - data.getTime();
    const diferencaEmDias = Math.floor(diferencaEmTempo / (1000 * 3600 * 24));
    
    if (diferencaEmDias === 0) return 'Hoje';
    if (diferencaEmDias === 1) return 'Ontem';
    return `Há ${diferencaEmDias} dias`;
  };

  const [isUploading, setIsUploading] = useState(false);
  const [muralFotos, setMuralFotos] = useState<any[]>([]);
  const [isLoadingGaleria, setIsLoadingGaleria] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  
  // Tracking states
  const [historicoCargas, setHistoricoCargas] = useState<any[]>([]);
  const [todosRegistrosCargas, setTodosRegistrosCargas] = useState<any[]>([]); 
  const [isLoadingCargas, setIsLoadingCargas] = useState(true);
  const [listaExercicios, setListaExercicios] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [recordeAtual, setRecordeAtual] = useState<number | null>(null);
  const [miniHistorico, setMiniHistorico] = useState<any[]>([]);
  const [showMiniHistorico, setShowMiniHistorico] = useState(false);
  
  // Elite Dashboard States
  const [exercicioSelecionado, setExercicioSelecionado] = useState<string | null>(null);
  const [metas, setMetas] = useState<Record<string, number>>({});
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');

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
    
    try {
      // 1. Mural de Fotos
      const { data: fotos } = await supabase.from('evolucao_fotos').select('*').eq('aluno_id', student.id);
      if (fotos) {
        setMuralFotos(fotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }

      // 2. Histórico de Cargas
      const { data: cargas } = await supabase.from('historico_cargas')
        .select('*')
        .eq('aluno_id', student.id)
        .order('data_registro', { ascending: false });

      if (cargas) {
        setTodosRegistrosCargas(cargas);
        const uniqueRecordsMap = new Map();
        cargas.forEach(item => {
          const nomeUpper = item.exercicio.toUpperCase();
          if (!uniqueRecordsMap.has(nomeUpper)) uniqueRecordsMap.set(nomeUpper, item);
        });
        setHistoricoCargas(Array.from(uniqueRecordsMap.values()));

        const nomesExFromHist = new Set(cargas.map(c => c.exercicio.toUpperCase()));
        const nomesExFromWorkout = new Set<string>();
        if (workout?.divisoes) {
          workout.divisoes.forEach(d => d.exercicios.forEach(ex => nomesExFromWorkout.add(ex.nome.toUpperCase())));
        }
        setListaExercicios(Array.from(new Set([...nomesExFromHist, ...nomesExFromWorkout])));
      }

      const storedGoals = localStorage.getItem(`goals_${student.id}`);
      if (storedGoals) setMetas(JSON.parse(storedGoals));
    } catch (err) {
      console.error("Erro ao sincronizar Lab:", err);
    } finally {
      setIsLoadingGaleria(false);
      setIsLoadingCargas(false);
    }
  };

  useEffect(() => { buscarDados(); }, [student.id]);

  // Elite Analytics Memoized
  const statsDashboard = useMemo(() => {
    if (!exercicioSelecionado) return null;
    const exUpper = exercicioSelecionado.toUpperCase();
    const history = (todosRegistrosCargas || []).filter(r => r.exercicio.toUpperCase() === exUpper)
      .sort((a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime());
    
    const pr = history.length > 0 ? Math.max(...history.map(r => Number(r.carga) || 0)) : 0;
    const meta = Number(metas[exUpper]) || 0;
    
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() - 30);
    const freq30 = history.filter(r => new Date(r.data_registro) >= trintaDias).length;

    const maxChart = Math.max(pr, meta, 1);

    return { history, pr, meta, freq30, maxChart };
  }, [exercicioSelecionado, todosRegistrosCargas, metas]);

  const handleSaveMeta = () => {
    if (!exercicioSelecionado) return;
    const val = Number(tempGoal);
    if (isNaN(val) || val <= 0) return;
    const newMetas = { ...metas, [exercicioSelecionado.toUpperCase()]: val };
    setMetas(newMetas);
    localStorage.setItem(`goals_${student.id}`, JSON.stringify(newMetas));
    setIsEditingGoal(false);
    setTempGoal('');
  };

  const handleDeleteRegistro = async (id: string) => {
    if (!window.confirm('Excluir este registro permanentemente?')) return;
    const { error } = await supabase.from('historico_cargas').delete().eq('id', id);
    if (!error) await buscarDados();
  };

  // Autocomplete Logic
  useEffect(() => {
    const exUpper = novoExercicio.toUpperCase().trim();
    if (exUpper.length > 1) {
      setSugestoes(listaExercicios.filter(ex => ex.includes(exUpper) && ex !== exUpper).slice(0, 5));
      const match = todosRegistrosCargas.filter(r => r.exercicio.toUpperCase() === exUpper);
      if (match.length > 0) {
        setRecordeAtual(Math.max(...match.map(r => Number(r.carga) || 0)));
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
    const valor = Number(novaCarga.replace(/[^0-9.]/g, ''));
    if (isNaN(valor)) return;
    const exFinal = novoExercicio.toUpperCase().trim();
    setIsSavingCarga(true);
    try {
      if (recordeAtual !== null && valor > recordeAtual) {
        setPrDetails({ exercise: exFinal, oldWeight: recordeAtual, newWeight: valor });
        setShowPRBanner(true);
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 200]);
        setTimeout(() => setShowPRBanner(false), 4000);
      }
      await supabase.from('historico_cargas').insert([{
        aluno_id: student.id,
        exercicio: exFinal,
        carga: valor,
        data_registro: new Date().toISOString()
      }]);
      await buscarDados();
      setNovoExercicio('');
      setNovaCarga('');
    } finally {
      setIsSavingCarga(false);
    }
  };

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-700 pb-32 max-w-2xl mx-auto relative">
      
      {/* BANNER DE RECORDE (PR) */}
      {showPRBanner && (
        <div className="fixed top-10 left-0 right-0 z-[600] flex justify-center px-6 pointer-events-none">
          <div className="bg-orange-500 text-slate-950 p-6 rounded-[32px] shadow-[0_0_80px_rgba(249,115,22,0.6)] border-4 border-white/30 animate-in slide-in-from-top-20 duration-500 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black uppercase italic leading-none">NOVO RECORDE! 🔥</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{prDetails.exercise}: {prDetails.oldWeight}kg → {prDetails.newWeight}kg</p>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO ELITE (À prova de erros) */}
      {exercicioSelecionado && statsDashboard && (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col animate-in fade-in duration-300 overflow-y-auto">
          <div className="p-8 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-20 border-b border-orange-500/10">
            <button 
              onClick={() => setExercicioSelecionado(null)}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors py-4 px-6 bg-slate-900 rounded-2xl border border-slate-800"
            >
              ← Voltar para Evolução
            </button>
            <div className="text-right">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{exercicioSelecionado}</h3>
              <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1">Dashboard de Performance</p>
            </div>
          </div>

          <div className="p-6 space-y-10 max-w-4xl mx-auto w-full">
            {/* Analytics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px]">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Recorde (PR)</p>
                <p className="text-3xl font-black text-white">{statsDashboard.pr}kg</p>
              </div>
              <div className="p-6 bg-slate-900 border border-orange-500/20 rounded-[32px]">
                <p className="text-[8px] font-black text-orange-500 uppercase mb-1">Meta Lab</p>
                {statsDashboard.meta > 0 ? (
                  <p className="text-3xl font-black text-white">{statsDashboard.meta}kg</p>
                ) : (
                  <button onClick={() => setIsEditingGoal(true)} className="text-[10px] font-black text-slate-600 hover:text-orange-500 uppercase">+ Definir Meta</button>
                )}
              </div>
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px]">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Freq. (30d)</p>
                <p className="text-3xl font-black text-white">{statsDashboard.freq30}x</p>
              </div>
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px]">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Projeção</p>
                {statsDashboard.meta > 0 ? (
                  <p className={`text-xs font-black uppercase ${statsDashboard.pr >= statsDashboard.meta ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {statsDashboard.pr >= statsDashboard.meta ? 'META BATIDA! 🏆' : `Faltam ${statsDashboard.meta - statsDashboard.pr}kg`}
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-slate-700 uppercase italic">Aguardando Meta</p>
                )}
              </div>
            </div>

            {/* Gráfico de Barras Customizado */}
            <div className="bg-slate-900/50 border border-orange-500/10 rounded-[40px] p-10 h-80 relative flex items-end justify-between gap-2 overflow-hidden">
              {/* Linha de Meta */}
              {statsDashboard.meta > 0 && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-orange-500/40 z-10 flex items-center justify-end pr-4 pointer-events-none"
                  style={{ bottom: `${(statsDashboard.meta / statsDashboard.maxChart) * 100}%` }}
                >
                  <span className="bg-orange-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full -translate-y-1/2">
                    META: {statsDashboard.meta}kg
                  </span>
                </div>
              )}

              {/* Renderização Segura das Barras */}
              {(statsDashboard.history || []).map((item) => {
                const valorCarga = Number(item.carga) || 0;
                const alturaBarra = (valorCarga / statsDashboard.maxChart) * 100;
                return (
                  <div key={item.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div 
                      className="w-full bg-orange-500/80 rounded-t-xl transition-all duration-700 group-hover:bg-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] relative"
                      style={{ height: `${alturaBarra}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded-lg z-20">
                        {valorCarga}kg
                      </div>
                    </div>
                    <p className="text-[7px] font-black text-slate-600 uppercase mt-2 transform -rotate-45 whitespace-nowrap">
                      {new Date(item.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Tabela de Logs */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Auditória de Cargas</h4>
              <div className="grid gap-3">
                {(statsDashboard.history || []).slice().reverse().map((r) => (
                  <div key={r.id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[50px]">
                        <p className="text-[10px] font-black text-white">{new Date(r.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase">{new Date(r.data_registro).getFullYear()}</p>
                      </div>
                      <span className="text-2xl font-black text-white italic">{Number(r.carga)}kg</span>
                    </div>
                    <button onClick={() => handleDeleteRegistro(r.id)} className="p-3 text-slate-700 hover:text-red-500 transition-colors">
                      <Icons.Trash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Edição Meta */}
          {isEditingGoal && (
            <div className="fixed inset-0 z-[600] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm bg-slate-900 border border-orange-500/20 rounded-[40px] p-8 space-y-6 shadow-2xl">
                <div className="text-center space-y-1">
                  <h4 className="text-xl font-black text-white uppercase italic">Definir Meta Elite</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">{exercicioSelecionado}</p>
                </div>
                <input 
                  type="number" autoFocus placeholder="0"
                  value={tempGoal} onChange={e => setTempGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-black text-3xl text-center focus:border-orange-500 outline-none transition-all"
                />
                <button onClick={handleSaveMeta} className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs">Confirmar Meta</button>
                <button onClick={() => setIsEditingGoal(false)} className="w-full text-[10px] font-black text-slate-600 uppercase">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERFIL HEADER */}
      <div className="flex flex-col items-center text-center space-y-5 pt-8 relative">
        {isTrainerMode && onBack && (
          <button onClick={onBack} className="absolute top-8 left-0 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
            ← Voltar ao Painel
          </button>
        )}
        <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 p-1 overflow-hidden shadow-2xl relative">
          <img 
            src={student?.url_shape_atual || student?.profileImage || `https://ui-avatars.com/api/?name=${student?.name}&background=f97316&color=fff&size=200`} 
            className="w-full h-full object-cover rounded-full"
            alt="Profile"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{student?.name}</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">Membro Team Prado Elite</p>
        </div>
      </div>

      {/* DASHBOARD RÁPIDO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] space-y-1">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Presença Lab</p>
          <p className="text-3xl font-black text-white">{checkins.length}</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] space-y-1 text-right">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-right">Mural Evolução</p>
          <p className="text-3xl font-black text-orange-500">{muralFotos.length}</p>
        </div>
      </div>

      {/* PROGRESSÃO DE FORÇA */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Activity className="w-4 h-4 text-orange-500" /> Progressão de Força
          </h2>
          <span className="text-[8px] font-black text-slate-700 uppercase">Clique no Card para Analisar</span>
        </div>

        {/* INPUT FORM (Somente Aluno) */}
        {!isTrainerMode && (
          <form onSubmit={handleSaveCarga} className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Exercício</label>
                <input 
                  type="text" required placeholder="MOVIMENTO"
                  value={novoExercicio} onChange={e => setNovoExercicio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase focus:border-orange-500 outline-none transition-all text-sm"
                />
                {sugestoes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                    {sugestoes.map(s => (
                      <button key={s} type="button" onClick={() => setNovoExercicio(s)} className="w-full px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase hover:bg-orange-500 hover:text-slate-950 transition-all border-b border-slate-800 last:border-0">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Carga (kg)</label>
                <input 
                  type="text" required placeholder="KG"
                  value={novaCarga} onChange={e => setNovaCarga(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black focus:border-orange-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <button disabled={isSavingCarga} className="w-full py-5 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
              {isSavingCarga ? 'PROCESSANDO...' : 'REGISTRAR PERFORMANCE'}
            </button>
          </form>
        )}

        {/* CARDS DE RECORDES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoadingCargas ? (
            <div className="col-span-full py-10 text-center animate-pulse"><p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Auditando Lab...</p></div>
          ) : (historicoCargas || []).length > 0 ? (
            historicoCargas.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setExercicioSelecionado(item.exercicio)}
                className="p-6 bg-slate-900/60 border border-slate-800 rounded-[32px] group transition-all flex flex-col justify-between h-32 relative overflow-hidden cursor-pointer hover:border-orange-500/40 hover:scale-[1.02]"
              >
                <div className="relative z-10">
                  <h4 className="font-black text-white uppercase text-xs tracking-tight group-hover:text-orange-400 transition-colors">{item.exercicio}</h4>
                  <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">{getDaysAgo(item.data_registro)}</p>
                </div>
                <div className="relative z-10 flex items-end justify-between">
                  <span className="text-3xl font-black text-white italic">{Number(item.carga)}kg</span>
                  <div className="text-[8px] font-black text-orange-500/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analisar Lab →</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[32px]">
               <p className="text-[9px] font-black text-slate-700 uppercase">Nenhum recorde detectado.</p>
            </div>
          )}
        </div>
      </div>

      {/* MURAL DE EVOLUÇÃO */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Camera className="w-4 h-4 text-orange-500" /> Mural Evolução
          </h2>
          {!isTrainerMode && (
            <button 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-2"
            >
              {isUploading ? <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Icons.Plus className="w-3 h-3" />}
              {isUploading ? 'SYNC...' : 'ATUALIZAR SHAPE'}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUploadShape) {
                  setIsUploading(true);
                  onUploadShape(file).finally(() => setIsUploading(false));
                }
              }} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {isLoadingGaleria ? (
            <div className="col-span-2 py-12 animate-pulse text-center"><p className="text-[9px] font-black text-slate-700 uppercase">Acessando Galeria...</p></div>
          ) : (muralFotos || []).length > 0 ? (
            muralFotos.map((foto) => (
              <div key={foto.id} className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group hover:scale-[1.02] transition-all">
                <img src={foto.url_foto} alt="Shape" className="w-full h-full object-cover cursor-zoom-in" onClick={() => setFotoSelecionada(foto.url_foto)} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[8px] font-black text-orange-500 uppercase">{new Date(foto.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-900 rounded-[32px]"><p className="text-slate-700 font-black uppercase text-[10px]">Sem fotos registradas.</p></div>
          )}
        </div>
      </div>

      {/* ZOOM FOTO */}
      {fotoSelecionada && (
        <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in" onClick={() => setFotoSelecionada(null)}>
          <img src={fotoSelecionada} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" alt="Zoom" />
        </div>
      )}
    </div>
  );
};

export default ProfileView;
