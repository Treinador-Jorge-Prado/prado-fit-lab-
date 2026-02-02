
import React from 'react';
import { User, CheckIn } from '../types';
import { Icons } from '../constants';

interface MapaDePresencaProps {
  members: User[];
  checkins: CheckIn[];
}

const MapaDePresenca: React.FC<MapaDePresencaProps> = ({ members, checkins }) => {
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  const getTreinouNoDia = (memberId: string, offsetDia: number) => {
    const hoje = new Date();
    const diaAlvo = new Date();
    diaAlvo.setDate(hoje.getDate() - (hoje.getDay() === 0 ? 6 : hoje.getDay() - 1) + offsetDia);
    diaAlvo.setHours(0, 0, 0, 0);

    return checkins.find(c => {
      const dataCheckin = new Date(c.timestamp);
      dataCheckin.setHours(0, 0, 0, 0);
      return c.studentId === memberId && dataCheckin.getTime() === diaAlvo.getTime();
    });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Consistência Semanal • Team Prado</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Treinou</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Off</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-6 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800/50">Membro</th>
              {diasSemana.map(dia => (
                <th key={dia} className="p-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800/50">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                <td className="p-6 border-b border-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-sm font-black text-slate-200 uppercase tracking-tight group-hover:text-orange-400 transition-colors">
                      {member.name.split(' ')[0]}
                    </span>
                  </div>
                </td>
                {[0, 1, 2, 3, 4, 5, 6].map(diaIdx => {
                  const checkin = getTreinouNoDia(member.id, diaIdx);
                  return (
                    <td key={diaIdx} className="p-6 border-b border-slate-800/30 text-center">
                      <div className={`mx-auto w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        checkin 
                          ? 'bg-orange-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                          : 'bg-slate-950/50 border border-slate-800 text-slate-800'
                      }`}>
                        {checkin ? (
                          <span className="text-[10px] font-black">{checkin.letraTreino || <Icons.Check className="w-4 h-4" />}</span>
                        ) : (
                          <span className="text-[10px] font-black opacity-20">X</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MapaDePresenca;
