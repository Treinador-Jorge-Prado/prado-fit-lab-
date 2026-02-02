
import React, { useState, useMemo } from 'react';
import { VideoContent } from '../types';
import { Icons } from '../constants';
import VideoModal from './VideoModal';

interface VideoLibraryProps {
  videos: VideoContent[];
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);

  const categories = ['Todos', 'Recados', 'Execução', 'Dieta', 'Mentalidade'];

  const filteredVideos = useMemo(() => {
    let result = activeCategory === 'Todos' 
      ? videos 
      : videos.filter(v => v.categoria === activeCategory);
    
    // Always put pinned videos first
    return [...result].sort((a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0));
  }, [videos, activeCategory]);

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32">
      {selectedVideo && (
        <VideoModal 
          videoUrl={selectedVideo.url} 
          title={selectedVideo.titulo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}

      {/* Header */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Exclusivo Team Prado</p>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Mundo Prado Fit</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeCategory === cat 
                ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <div 
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="group relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer shadow-xl flex flex-col"
          >
            {/* Thumbnail Area */}
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={video.thumbnail_url || `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                alt={video.titulo} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                  <Icons.Play className="w-8 h-8 fill-current" />
                </div>
              </div>

              {video.fixado && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Icons.Pin className="w-3 h-3 text-slate-950" />
                  <span className="text-[8px] font-black text-slate-950 uppercase tracking-widest">Destaque</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  {video.categoria}
                </span>
              </div>
            </div>

            {/* Info Area */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                {video.titulo}
              </h3>
              <div className="flex items-center gap-3 mt-4">
                <Icons.Clock className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Postado em {new Date(video.data_postagem).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="py-20 text-center space-y-4 border-2 border-dashed border-slate-900 rounded-[40px]">
          <Icons.Play className="w-12 h-12 text-slate-800 mx-auto" />
          <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Nenhum vídeo nesta categoria.</p>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
