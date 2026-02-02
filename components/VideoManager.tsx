
import React, { useState } from 'react';
import { VideoContent } from '../types';
import { Icons } from '../constants';

interface VideoManagerProps {
  videos: VideoContent[];
  onAddVideo: (video: VideoContent) => void;
  onRemoveVideo: (id: string) => void;
}

const VideoManager: React.FC<VideoManagerProps> = ({ videos, onAddVideo, onRemoveVideo }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'Recados',
    url: '',
    thumbnail_url: '',
    fixado: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVideo: VideoContent = {
      id: Math.random().toString(36).substr(2, 9),
      titulo: formData.titulo,
      categoria: formData.categoria as any,
      url: formData.url,
      thumbnail_url: formData.thumbnail_url,
      data_postagem: Date.now(),
      fixado: formData.fixado
    };
    onAddVideo(newVideo);
    setShowForm(false);
    setFormData({ titulo: '', categoria: 'Recados', url: '', thumbnail_url: '', fixado: false });
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Gestão Treinador Jorge</p>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Content Manager</h1>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 uppercase text-xs tracking-widest active:scale-95"
        >
          <Icons.Plus className="w-5 h-5" />
          Cadastrar Conteúdo
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Novo Vídeo</h3>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Exclusivo Team Prado</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Vídeo</label>
                  <input 
                    type="text" required
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    placeholder="Ex: Guia de Nutrição Básica"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      value={formData.categoria}
                      onChange={e => setFormData({...formData, categoria: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-emerald-500 outline-none appearance-none"
                    >
                      <option>Recados</option>
                      <option>Execução</option>
                      <option>Dieta</option>
                      <option>Mentalidade</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.fixado}
                        onChange={e => setFormData({...formData, fixado: e.target.checked})}
                        className="w-5 h-5 bg-slate-950 border-slate-800 rounded accent-emerald-500"
                      />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-400">Fixar no Topo</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL do Vídeo (YouTube)</label>
                  <input 
                    type="url" required
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL da Thumbnail (Opcional)</label>
                  <input 
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-emerald-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all"
              >
                Publicar no Mundo Prado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="space-y-6">
        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Conteúdos Ativos</h2>
        <div className="grid gap-4">
          {videos.map(video => (
            <div key={video.id} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] flex items-center justify-between group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-20 aspect-video rounded-xl bg-slate-950 overflow-hidden relative">
                   <img src={video.thumbnail_url || `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/default.jpg`} className="w-full h-full object-cover opacity-60" alt="" />
                   {video.fixado && <div className="absolute top-1 right-1"><Icons.Pin className="w-3 h-3 text-emerald-500" /></div>}
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-lg">{video.titulo}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{video.categoria}</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">• {new Date(video.data_postagem).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onRemoveVideo(video.id)}
                className="p-4 text-slate-700 hover:text-red-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
