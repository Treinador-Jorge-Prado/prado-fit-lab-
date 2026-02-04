
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
  onViewProfile: (studentId: string) => void;
  checkins: CheckIn[];
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ 
  students, workouts, onOpenWorkoutEditor, onAddMember, onUpdateMember, onViewProfile, checkins 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32">
      {showAddModal && <AdicionarMembro onClose={() => setShowAddModal(false)} onSave={onAddMember} />}
      {editingStudent && <EditarMembro member={editingStudent} onClose={() => setEditingStudent(null)} onSave={onUpdateMember} />}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Gestão Treinador Jorge</p>
          <h1 className="text-4xl font-black text-white uppercase italic leading-none">Lab Performance</h1>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-slate-950 font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest active:scale-95">
          <Icons.Plus className="w-5 h-5" /> Novo Membro Team Prado
        </button>
      </div>

      <MapaDePresenca members={students} checkins={checkins} />

      <div className="space-y-6">
        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Gestão de Protocolos</h2>
        <div className="grid gap-4">
          {students.map((student) => {
            const studentWorkout = workouts.find(w => w.id_aluno === student.id);
            return (
              <div key={student.id} className="p-6 rounded-[32px] bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-orange-500/40 transition-all group">
                <div className="flex items-center gap-5 cursor-pointer" onClick={() => onViewProfile(student.id)}>
                  <img src={student.profileImage || `https://ui-avatars.com/api/?name=${student.name}&background=f97316&color=fff`} className="w-16 h-16 rounded-full border-2 border-slate-800 object-cover" alt="" />
                  <div>
                    <h3 className="font-black text-white uppercase text-xl group-hover:text-orange-400 transition-colors">{student.name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                      {studentWorkout ? studentWorkout.nome_da_planilha : 'Sem Protocolo Ativo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingStudent(student)} className="p-3 text-slate-600 hover:text-white transition-colors">
                    <Icons.Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => onOpenWorkoutEditor(student.id)} className="px-5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-orange-400 transition-all">
                    Protocolo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
