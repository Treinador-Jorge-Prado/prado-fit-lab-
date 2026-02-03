
import React, { useState } from 'react';
import { VideoContent } from '../types';
import { Icons } from '../constants';

interface VideoManagerProps {
  videos: VideoContent[];
  onAddVideo: (video: VideoContent) => void;
  onUpdateVideo: (video: VideoContent) => void;
  onRemoveVideo: (id: string) => void;
}

const VideoManager: React.FC<VideoManagerProps> = ({ videos, onAddVideo, onUpdateVideo, onRemoveVideo }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Execução',
    url: '',
    thumbnail_url: '',
    fixado: false
  });

  const handleOpenEdit = (video: VideoContent) => {
    setFormData({
      titulo: video.titulo,
      descricao: video.descricao || '',
      categoria: video.categoria,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      fixado: video.fixado
    });
    setEditingId(video.id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ titulo: '', descricao: '', categoria: 'Execução', url: '', thumbnail_url: '', fixado: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updatedVideo: VideoContent = {
        ...videos.find(v => v.id === editingId)!,
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        url: formData.url,
        thumbnail_url: formData.thumbnail_url,
        fixado: formData.fixado
      };
      onUpdateVideo(updatedVideo);
    } else {
      const newVideo: VideoContent = {
        id: Math.random().toString(36).substr(2, 9),
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        url: formData.url,
        thumbnail_url: formData.thumbnail_url,
        data_postagem: Date.now(),
        fixado: formData.fixado
      };
      onAddVideo(newVideo);
    }
    handleClose();
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Área do Treinador</p>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Gestão de Conteúdo</h1>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl transition-all shadow-2xl shadow-orange-500/20 uppercase text-xs tracking-widest active:scale-95"
        >
          <Icons.Plus className="w-5 h-5" />
          Novo Conteúdo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={handleClose} />
          <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                  {editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                </h3>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Prado Fit Lab</p>
              </div>
              <button onClick={handleClose} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <Icons.Plus className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Conteúdo</label>
                  <input 
                    type="text" required
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="Ex: Guia de Agachamento Perfeito"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição do Conteúdo</label>
                  <textarea 
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-medium focus:border-orange-500 outline-none h-24 resize-none"
                    placeholder="Explique do que se trata este vídeo para seus alunos..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link do Vídeo (YouTube)</label>
                  <input 
                    type="url" required
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL da Thumbnail (Imagem)</label>
                  <input 
                    type="url" required
                    value={formData.thumbnail_url}
                    onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-orange-500 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.fixado}
                      onChange={e => setFormData({...formData, fixado: e.target.checked})}
                      className="w-5 h-5 bg-slate-950 border-slate-800 rounded accent-orange-500"
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-orange-400">Destaque</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.2em] text-sm shadow-2xl transition-all"
              >
                {editingId ? 'Salvar Alterações' : 'Publicar Conteúdo'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {videos.length > 0 ? (
          videos.map(video => (
            <div key={video.id} className="p-4 bg-slate-900 border border-slate-800 rounded-[24px] flex items-center justify-between group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-lg bg-slate-950 overflow-hidden">
                  <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-60" alt="" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-sm">{video.titulo}</h3>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest line-clamp-1 max-w-[200px]">{video.descricao || 'Sem descrição'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEdit(video)}
                  className="p-3 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  <Icons.Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onRemoveVideo(video.id)}
                  className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Icons.Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-[32px]">
             <Icons.Play className="w-10 h-10 text-slate-800 mx-auto mb-4" />
             <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhum conteúdo publicado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManager;
