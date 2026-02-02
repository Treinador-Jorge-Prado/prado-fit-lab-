
import React, { useState, useMemo } from 'react';
import { User, PlanilhaTreino, CheckIn } from '../types';
import { Icons } from '../constants';
import MapaDePresenca from './MapaDePresenca';
import AdicionarMembro from './AdicionarMembro';
import EditarMembro from './EditarMembro';

interface PersonalDashboardProps {
  students: User[];
  workouts: PlanilhaTreino[];
  onOpenWorkoutEditor: (studentId: string) => void;
  onAddMember: (member: User) => void;
  onUpdateMember: (member: User) => void;
  checkins: CheckIn[];
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ 
  students, 
  workouts, 
  onOpenWorkoutEditor, 
  onAddMember,
  onUpdateMember,
  checkins 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Stats Calculations
  const activeCount = students.length;

  const attendanceRateToday = useMemo(() => {
    if (students.length === 0) return 0;
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const trainedToday = new Set(
      checkins
        .filter(c => new Date(c.timestamp).getTime() >= startOfDay)
        .map(c => c.studentId)
    );
    return Math.round((trainedToday.size / students.length) * 100);
  }, [students, checkins]);

  const alertMembers = useMemo(() => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    return students.filter(student => {
      const lastCheckin = [...checkins]
        .filter(c => c.studentId === student.id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (!lastCheckin) {
        return (student.startDate || 0) < threeDaysAgo;
      }
      return lastCheckin.timestamp < threeDaysAgo;
    });
  }, [students, checkins]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}min`;
    }
    return `${mins}min`;
  };

  const getDurationStatus = (seconds?: number) => {
    if (!seconds) return { color: 'text-slate-500', anomaly: false };
    const mins = seconds / 60;
    if (mins < 30 || mins > 90) return { color: 'text-orange-500', anomaly: true };
    if (mins >= 45 && mins <= 75) return { color: 'text-emerald-500', anomaly: false };
    return { color: 'text-amber-500', anomaly: false };
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {showAddModal && (
        <AdicionarMembro 
          onClose={() => setShowAddModal(false)} 
          onSave={(m) => onAddMember(m)} 
        />
      )}

      {editingStudent && (
        <EditarMembro 
          member={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={(m) => onUpdateMember(m)}
        />
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Gestão Treinador Jorge</p>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Lab Performance</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl transition-all shadow-2xl shadow-orange-500/20 uppercase text-xs tracking-widest active:scale-95"
        >
          <Icons.Plus className="w-5 h-5" />
          Novo Membro Team Prado
        </button>
      </div>

      {/* CARDS DE GESTÃO JORGE PRADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 shadow-xl group hover:border-orange-500/30 transition-all">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Membros Ativos Team Prado</p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-black text-white tracking-tighter">{activeCount}</p>
            <span className="text-[10px] font-black text-orange-500 uppercase">Integrados</span>
          </div>
        </div>

        <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 shadow-xl group hover:border-orange-500/30 transition-all">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Taxa de Assiduidade (Hoje)</p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-black text-orange-400 tracking-tighter">{attendanceRateToday}%</p>
            <span className="text-[10px] font-black text-slate-500 uppercase">Engajamento</span>
          </div>
        </div>

        <div className={`p-8 rounded-[32px] border shadow-xl group transition-all ${alertMembers.length > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900 border-slate-800'}`}>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Membros em Alerta (Inativos)</p>
          <div className="flex items-baseline gap-3">
            <p className={`text-5xl font-black tracking-tighter ${alertMembers.length > 0 ? 'text-red-500' : 'text-slate-600'}`}>{alertMembers.length}</p>
            <span className="text-[10px] font-black text-slate-500 uppercase">+3 Dias Off</span>
          </div>
        </div>
      </div>

      {/* MAPA DE PRESENÇA SEMANAL */}
      <MapaDePresenca members={students} checkins={checkins} />

      {/* LISTA DE ALERTAS */}
      {alertMembers.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-[11px] font-black text-red-500 uppercase tracking-[0.3em]">Protocolo de Recuperação</h2>
          </div>
          <div className="grid gap-3">
            {alertMembers.map(member => (
              <div key={member.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <img src={member.profileImage} className="w-8 h-8 rounded-full border border-red-500/20" alt="" />
                   <span className="text-xs font-bold text-slate-200 uppercase tracking-tight">{member.name}</span>
                </div>
                <a 
                  href={`https://wa.me/55${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${member.name.split(' ')[0]}, o Treinador Jorge aqui. Vamos retomar o plano? 🚀`)}`}
                  target="_blank"
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 transition-all"
                >
                  Cobrar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE TODOS OS MEMBROS PARA GESTÃO DE PROTOCOLOS */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Gestão de Protocolos Team Prado</h2>
        </div>

        <div className="grid gap-4">
          {students.map((student) => {
            const studentWorkout = workouts.find(w => w.id_aluno === student.id);
            const studentCheckins = checkins.filter(c => c.studentId === student.id).sort((a,b) => b.timestamp - a.timestamp);
            const lastDuration = studentCheckins[0]?.durationSeconds;
            const status = getDurationStatus(lastDuration);
            
            return (
              <div 
                key={student.id}
                className="group p-6 rounded-[32px] bg-slate-900 border border-slate-800 flex items-center justify-between hover:bg-slate-800/50 hover:border-orange-500/20 transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-800 p-1 overflow-hidden transition-transform group-hover:scale-105">
                      <img src={student.profileImage} className="w-full h-full object-cover rounded-full" alt="" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-900 ${studentWorkout ? 'bg-orange-500' : 'bg-amber-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-white uppercase tracking-tight text-xl group-hover:text-orange-400 transition-colors">{student.name}</h3>
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="p-2 text-slate-600 hover:text-orange-500 transition-colors"
                        title="Editar Membro"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5">
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        {studentWorkout 
                          ? `${studentWorkout.nome_da_planilha} (${studentWorkout.divisoes.length} Blocos)` 
                          : 'Aguardando Prescrição'}
                      </p>
                      {lastDuration && (
                        <div className="flex items-center gap-1.5">
                           <div className="w-1 h-1 rounded-full bg-slate-800" />
                           <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${status.color}`}>
                             Último: {formatDuration(lastDuration)}
                             {status.anomaly && <span title="Tempo anômalo: Checar intensidade">❗</span>}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onOpenWorkoutEditor(student.id)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-all shadow-xl"
                >
                  <Icons.Plus className="w-4 h-4" />
                  Protocolo
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
