
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
    telefone: '',
    objetivo: 'Hipertrofia',
    dataInicio: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.nome,
      email: formData.email.toLowerCase(),
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

Clique no link abaixo para entrar agora (não precisa de senha):
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
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Integração Team Prado</p>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                    placeholder="Ex: Carlos Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    placeholder="membro@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp (DDD + Número)</label>
                  <input 
                    type="tel" required
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    placeholder="11999999999"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objetivo</label>
                    <select 
                      value={formData.objetivo}
                      onChange={e => setFormData({...formData, objetivo: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-emerald-500 outline-none appearance-none"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98] mt-4"
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
              <p className="text-slate-400 text-sm font-medium">O acesso do {newMemberRef?.name} está ativo com Magic Link.</p>
            </div>

            <div className="space-y-3 pt-4">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-6 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-3xl uppercase tracking-[0.1em] text-sm shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.481 5.229 3.481 8.404c0 6.556-5.332 11.888-11.888 11.888-2.01 0-3.988-.508-5.742-1.472l-6.242 1.637zm6.308-4.308c1.611.956 3.255 1.439 4.887 1.439 5.313 0 9.638-4.325 9.638-9.638s-4.325-9.638-9.638-9.638-9.638 4.325-9.638 9.638c0 1.764.53 3.42 1.532 4.792l-1.002 3.659 3.721-.974zm11.332-6.521c-.287-.144-1.696-.837-1.957-.933-.262-.096-.452-.144-.642.144-.19.287-.736.933-.903 1.124-.167.19-.334.215-.621.071-.287-.144-1.21-.446-2.305-1.424-.853-.759-1.428-1.7-1.595-1.987-.167-.287-.018-.442.126-.584.13-.127.287-.334.43-.502.144-.167.191-.287.287-.478.096-.19.048-.359-.024-.502-.072-.144-.642-1.554-.879-2.127-.23-.556-.465-.48-.642-.489-.166-.008-.357-.01-.548-.01-.19 0-.501.071-.763.359-.262.287-1.002.981-1.002 2.392s1.026 2.775 1.17 2.966c.144.19 2.02 3.085 4.895 4.326.684.296 1.218.473 1.634.605.688.21 1.314.18 1.808.106.551-.082 1.696-.693 1.935-1.363.239-.67.239-1.244.167-1.363-.071-.12-.262-.19-.548-.334z"/></svg>
                Enviar Acesso Automático (WhatsApp)
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
