
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, EvolutionEntry, Biometrics, CheckIn } from '../types';
import { Icons } from '../constants';

interface ProfileViewProps {
  student: User;
  evolutionHistory: EvolutionEntry[];
  onUpdateBiometrics: (metrics: Biometrics) => void;
  checkins?: CheckIn[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ student, evolutionHistory, onUpdateBiometrics, checkins = [] }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const [formMetrics, setFormMetrics] = useState<Biometrics>({
    weight: evolutionHistory?.[0]?.biometrics?.weight || 0,
    bodyFat: evolutionHistory?.[0]?.biometrics?.bodyFat || 0,
    waist: evolutionHistory?.[0]?.biometrics?.waist || 0,
    arm: evolutionHistory?.[0]?.biometrics?.arm || 0,
    chest: evolutionHistory?.[0]?.biometrics?.chest || 0,
    thigh: evolutionHistory?.[0]?.biometrics?.thigh || 0,
  });

  const studentCheckins = useMemo(() => {
    return checkins
      .filter(c => c.studentId === student.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [checkins, student.id]);

  const avgDuration = useMemo(() => {
    const withDuration = studentCheckins.filter(c => c.durationSeconds);
    if (withDuration.length === 0) return 0;
    const total = withDuration.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    return Math.round(total / withDuration.length / 60);
  }, [studentCheckins]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  const getDurationAnomaly = (seconds?: number) => {
    if (!seconds) return false;
    const mins = seconds / 60;
    return mins < 30 || mins > 90;
  };

  useEffect(() => {
    if (chartRef.current && (evolutionHistory?.length ?? 0) > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // @ts-ignore
        chartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: evolutionHistory.map(e => new Date(e.date).toLocaleDateString('pt-BR', { month: 'short' })).reverse(),
            datasets: [{
              label: 'Peso Lab (kg)',
              data: evolutionHistory.map(e => e.biometrics.weight).reverse(),
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.05)',
              borderWidth: 4,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#f97316',
              pointBorderColor: '#020617',
              pointBorderWidth: 3,
              pointRadius: 6,
              pointHoverRadius: 9
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { weight: 'bold', size: 14 },
                padding: 16,
                cornerRadius: 16,
                displayColors: false,
              }
            },
            scales: {
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: '#475569', font: { weight: 'bold' } }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#475569', font: { weight: 'bold' } }
              }
            }
          }
        });
      }
    }
  }, [evolutionHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBiometrics(formMetrics);
    setShowUpdateModal(false);
  };

  const latest = evolutionHistory?.[0]?.biometrics;

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-1000 pb-32 max-w-2xl mx-auto">
      
      {/* 1. CABEÇALHO (IDENTIDADE TEAM PRADO) */}
      <div className="flex flex-col items-center text-center space-y-5 pt-8">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full bg-slate-900 border-[8px] border-slate-800 p-1.5 overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.1)] transition-transform duration-500 group-hover:scale-105">
            <img 
              src={student?.profileImage || `https://ui-avatars.com/api/?name=${student?.name}&background=f97316&color=fff&size=200`} 
              alt={student?.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute -bottom-1 right-3 w-12 h-12 bg-orange-500 rounded-full border-[5px] border-slate-950 flex items-center justify-center text-slate-950 shadow-2xl">
            <Icons.Check className="w-6 h-6" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{student?.name}</h1>
          <div className="inline-flex items-center px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full shadow-lg">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">Membro Team Prado</span>
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pt-2 opacity-60">
            Performance System • Ativo desde {new Date(student?.startDate || Date.now()).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* STATS DE TEMPO */}
      <div className="grid grid-cols-2 gap-5">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-3 relative overflow-hidden group hover:border-orange-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tempo Médio</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">{avgDuration || '--'}</span>
              <span className="text-xs font-black text-slate-600 uppercase">min</span>
            </div>
            <Icons.Clock className="absolute -right-6 -bottom-6 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform" />
          </div>

          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-3 relative overflow-hidden group hover:border-orange-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Consistência</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-orange-400">{studentCheckins.length}</span>
              <span className="text-xs font-black text-slate-600 uppercase">treinos</span>
            </div>
            <Icons.Activity className="absolute -right-6 -bottom-6 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform" />
          </div>
      </div>

      {/* HISTÓRICO DE SESSÕES */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Clock className="w-4 h-4 text-orange-400" /> Sessões de Elite
          </h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-xl">
          {studentCheckins.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {studentCheckins.slice(0, 5).map((session) => (
                <div key={session.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black">
                      {session.letraTreino || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">Treino {session.letraTreino || 'Manual'}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(session.timestamp).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black tracking-tighter ${getDurationAnomaly(session.durationSeconds) ? 'text-orange-500' : 'text-slate-200'}`}>
                      {formatDuration(session.durationSeconds)}
                      {getDurationAnomaly(session.durationSeconds) && <span className="ml-1" title="Sessão fora do padrão">❗</span>}
                    </p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Duração</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhuma sessão registrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. MURAL DE EVOLUÇÃO (ANTES E DEPOIS) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Camera className="w-4 h-4 text-orange-400" /> Mural de Evolução
          </h2>
          <button className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/5 px-4 py-2 rounded-xl border border-orange-500/10 hover:bg-orange-500/20 transition-all">
            Atualizar Shape
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 h-64 sm:h-80">
          <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl group">
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-50 grayscale transition-all duration-1000 group-hover:opacity-70 group-hover:scale-110" 
              alt="Baseline" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-5 left-5">
              <span className="px-3 py-1 bg-slate-950/90 border border-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">Baseline</span>
            </div>
          </div>
          
          <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border-2 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.05)] group">
            <img 
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
              alt="Atual" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-5 left-5">
              <span className="px-3 py-1 bg-orange-500 rounded-lg text-[9px] font-black text-slate-950 uppercase tracking-widest shadow-xl">Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BIOMETRIA LAB (CARDS E GRÁFICO) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Activity className="w-4 h-4 text-orange-400" /> Biometria Lab
          </h2>
          <button 
            onClick={() => setShowUpdateModal(true)}
            className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-orange-400 hover:border-orange-500 transition-all shadow-xl"
          >
            <Icons.Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-3 relative overflow-hidden group hover:border-orange-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Peso Lab</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">{latest?.weight || '--'}</span>
              <span className="text-xs font-black text-slate-600 uppercase">kg</span>
            </div>
          </div>

          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-3 relative overflow-hidden group hover:border-orange-500/30 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">% Gordura</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-orange-400">{latest?.bodyFat || '--'}</span>
              <span className="text-xs font-black text-slate-600 uppercase">% bf</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[40px] h-72 shadow-inner relative overflow-hidden">
           <div className="absolute top-6 left-8 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Curva de Peso Analítica</p>
           </div>
           <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Modal de Atualização */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowUpdateModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Check-in Biometria</h3>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Coleta de Performance</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peso (kg)</label>
                  <input 
                    type="number" step="0.1" required
                    value={formMetrics.weight}
                    onChange={e => setFormMetrics({...formMetrics, weight: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-black text-2xl focus:border-orange-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">% Gordura</label>
                  <input 
                    type="number" step="0.1" required
                    value={formMetrics.bodyFat}
                    onChange={e => setFormMetrics({...formMetrics, bodyFat: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-orange-400 font-black text-2xl focus:border-orange-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.25em] text-sm shadow-2xl shadow-orange-500/20 transition-all active:scale-[0.98] mt-4 mb-2"
              >
                Registrar Evolução
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
