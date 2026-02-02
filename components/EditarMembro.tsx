
import React, { useState } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface EditarMembroProps {
  member: User;
  onClose: () => void;
  onSave: (updatedMember: User) => void;
}

const EditarMembro: React.FC<EditarMembroProps> = ({ member, onClose, onSave }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: member.name,
    email: member.email,
    telefone: member.phone || '',
    objetivo: member.objective || 'Hipertrofia',
    dataInicio: new Date(member.startDate || Date.now()).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simular feedback de processamento
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedMember: User = {
      ...member,
      name: formData.nome,
      email: formData.email.toLowerCase().trim(),
      phone: formData.telefone,
      objective: formData.objetivo,
      startDate: new Date(formData.dataInicio).getTime(),
    };
    
    onSave(updatedMember);
    setIsUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Editar Cadastro</h3>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Gestão Treinador Jorge</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            <Icons.Plus className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <input 
                type="text" required
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
              <input 
                type="tel" required
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objetivo</label>
                <select 
                  value={formData.objetivo}
                  onChange={e => setFormData({...formData, objetivo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-orange-500 outline-none appearance-none"
                >
                  <option>Hipertrofia</option>
                  <option>Emagrecimento</option>
                  <option>Performance</option>
                  <option>Saúde</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Início</label>
                <input 
                  type="date"
                  value={formData.dataInicio}
                  onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isUpdating}
            className="w-full py-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isUpdating ? 'Atualizando Lab...' : 'Atualizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarMembro;
