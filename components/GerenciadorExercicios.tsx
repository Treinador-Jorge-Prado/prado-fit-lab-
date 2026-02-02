
import React, { useState, useMemo } from 'react';
import { Exercise } from '../types';
import { Icons } from '../constants';

interface GerenciadorExerciciosProps {
  exercises: Exercise[];
  onAddExercise: (ex: Exercise) => void;
  onRemoveExercise: (id: string) => void;
  categories: string[];
  onAddCategory: (cat: string) => void;
}

const GerenciadorExercicios: React.FC<GerenciadorExerciciosProps> = ({ 
  exercises, 
  onAddExercise, 
  onRemoveExercise, 
  categories, 
  onAddCategory 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  
  const [formData, setFormData] = useState({
    nome: '',
    grupo_muscular: categories[0] || 'Peito',
    equipamento: 'Halter',
    instrucoes: '',
    video_url: '',
    categoria: 'Básico' as 'Básico' | 'Intermediário' | 'Avançado'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx: Exercise = {
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      nome: formData.nome,
      grupo_muscular: formData.grupo_muscular,
      equipamento: formData.equipamento,
      instrucoes: formData.instrucoes,
      video_url: formData.video_url,
      categoria: formData.categoria
    };
    onAddExercise(newEx);
    setShowForm(false);
    setFormData({ ...formData, nome: '', instrucoes: '', video_url: '' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      onAddCategory(newCat);
      setNewCat('');
      setShowCatForm(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return activeFilter === 'Todos' 
      ? exercises 
      : exercises.filter(ex => ex.grupo_muscular === activeFilter);
  }, [exercises, activeFilter]);

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Gestão Treinador Jorge</p>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Biblioteca Lab</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCatForm(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl transition-all hover:bg-slate-800 uppercase text-[10px] tracking-widest"
          >
            <Icons.Plus className="w-4 h-4" />
            Nova Categoria
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl transition-all shadow-2xl shadow-orange-500/20 uppercase text-xs tracking-widest active:scale-95"
          >
            <Icons.Plus className="w-5 h-5" />
            Novo Exercício
          </button>
        </div>
      </div>

      {/* FILTROS DE CATEGORIA */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setActiveFilter('Todos')}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
            activeFilter === 'Todos' 
              ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-lg' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeFilter === cat 
                ? 'bg-orange-500 border-orange-500 text-slate-950 shadow-lg' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LISTA DE EXERCÍCIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(ex => (
          <div key={ex.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] flex flex-col justify-between group hover:border-orange-500/30 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest rounded-lg">
                  {ex.grupo_muscular}
                </span>
                <button 
                  onClick={() => onRemoveExercise(ex.id)}
                  className="text-slate-700 hover:text-red-500 transition-colors"
                >
                  <Icons.Trash className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{ex.nome}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{ex.equipamento} • {ex.categoria}</p>
              </div>
              {ex.instrucoes && (
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2 italic">"{ex.instrucoes}"</p>
              )}
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
               {ex.video_url ? (
                 <div className="flex items-center gap-2 text-orange-500">
                    <Icons.Play className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Possui Vídeo</span>
                 </div>
               ) : (
                 <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Sem Vídeo</span>
               )}
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Lab ID: {ex.id.split('-').pop()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ADICIONAR EXERCÍCIO */}
      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Novo Movimento</h3>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Biblioteca Team Prado</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Exercício</label>
                  <input 
                    type="text" required
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="Ex: Supino Reto Barra"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      value={formData.grupo_muscular}
                      onChange={e => setFormData({...formData, grupo_muscular: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-orange-500 outline-none appearance-none"
                    >
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Equipamento</label>
                    <input 
                      type="text"
                      value={formData.equipamento}
                      onChange={e => setFormData({...formData, equipamento: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-orange-500 outline-none"
                      placeholder="Barra, Halter..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instruções Técnicas</label>
                  <textarea 
                    value={formData.instrucoes}
                    onChange={e => setFormData({...formData, instrucoes: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-medium focus:border-orange-500 outline-none h-24"
                    placeholder="Breve instrução de execução..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link Vídeo (YouTube)</label>
                  <input 
                    type="url"
                    value={formData.video_url}
                    onChange={e => setFormData({...formData, video_url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all"
              >
                Cadastrar no Lab
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR CATEGORIA */}
      {showCatForm && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowCatForm(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95">
             <div className="space-y-4">
                <h3 className="text-xl font-black text-white uppercase italic">Nova Categoria</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <input 
                    autoFocus
                    type="text" required
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="Ex: Mobilidade"
                  />
                  <button className="w-full py-4 bg-orange-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs">Criar Categoria</button>
                  <button type="button" onClick={() => setShowCatForm(false)} className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancelar</button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciadorExercicios;
