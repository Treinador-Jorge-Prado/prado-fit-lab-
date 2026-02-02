
import React, { useState } from 'react';
import { Icons } from '../constants';
import { User, UserRole } from '../types';

interface AdicionarMembroProps {
  onClose: () => void;
  onSave: (member: User) => void;
}

const AdicionarMembro: React.FC<AdicionarMembroProps> = ({ onClose, onSave }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [newMemberRef, setNewMemberRef] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    objetivo: 'Hipertrofia',
    dataInicio: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.nome,
      email: formData.email.toLowerCase().trim(),
      password: formData.senha || '1234', // Default fallback
      phone: formData.telefone,
      role: UserRole.STUDENT,
      personalId: 'p1',
      startDate: new Date(formData.dataInicio).getTime(),
      profileImage: `https://ui-avatars.com/api/?name=${formData.nome}&background=10b981&color=fff`
    };
    
    onSave(newMember);
    setNewMemberRef(newMember);
    setIsSuccess(true);
  };

  const getWhatsAppLink = () => {
    if (!newMemberRef) return "#";
    
    // Gerar Magic Token (Base64 do email para este MVP)
    const magicToken = btoa(newMemberRef.email);
    const appUrl = window.location.origin;
    const accessLink = `${appUrl}?token=${magicToken}`;
    
    const cleanedPhone = newMemberRef.phone?.replace(/\D/g, '');
    const message = `Olá ${newMemberRef.name}, aqui é o Treinador Jorge Prado! 
    
Seja bem-vindo ao Team Prado. Seu acesso ao nosso lab exclusivo já está liberado.

Seu login é seu e-mail e sua senha inicial é: ${newMemberRef.password}

Clique no link abaixo para entrar agora:
${accessLink}

Vamos buscar esse resultado! 🚀`;

    return `https://wa.me/55${cleanedPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
        
        {!isSuccess ? (
          <>
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Novo Membro</h3>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Integração Team Prado</p>
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
                    placeholder="Ex: Carlos Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="membro@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha Inicial</label>
                  <input 
                    type="text" required
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="Min. 4 caracteres"
                    minLength={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp (DDD + Número)</label>
                  <input 
                    type="tel" required
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="11999999999"
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
                className="w-full py-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98] mt-4"
              >
                Cadastrar Membro Elite
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-500/10 border-4 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <Icons.Check className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Membro Integrado!</h3>
              <p className="text-slate-400 text-sm font-medium">O acesso do {newMemberRef?.name} está ativo com senha.</p>
            </div>

            <div className="space-y-3 pt-4">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-6 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-3xl uppercase tracking-[0.1em] text-sm shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <Icons.Check className="w-6 h-6" />
                Enviar Credenciais (WhatsApp)
              </a>
              
              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdicionarMembro;
