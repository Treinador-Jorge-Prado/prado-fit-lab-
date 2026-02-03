
import React from 'react';
import { VideoContent } from '../types';
import { Icons } from '../constants';

interface VideoLibraryProps {
  videos: VideoContent[];
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos }) => {
  const handleOpenVideo = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700 pb-32 max-w-5xl mx-auto">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Mundo Prado Fit</p>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Conteúdo Exclusivo</h1>
        <p className="text-slate-500 text-xs font-medium max-w-md italic">Aulas, recados e protocolos de biomecânica aplicada diretamente pelo Treinador Jorge Prado.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.length > 0 ? (
          videos.map(video => (
            <div 
              key={video.id}
              onClick={() => handleOpenVideo(video.url)}
              className="group relative bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer shadow-xl flex flex-col"
            >
              {/* Thumbnail com Overlay */}
              <div className="relative aspect-video overflow-hidden shrink-0">
                <img 
                  src={video.thumbnail_url} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" 
                  alt={video.titulo} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                
                {/* Ícone de Play Centralizado */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-orange-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Icons.Play className="w-8 h-8 fill-current" />
                  </div>
                </div>

                {video.fixado && (
                  <div className="absolute top-4 right-4 bg-orange-500 p-2 rounded-xl shadow-lg">
                    <Icons.Pin className="w-4 h-4 text-slate-950" />
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="p-6 space-y-3 flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{video.categoria}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(video.data_postagem).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight group-hover:text-orange-400 transition-colors">
                    {video.titulo}
                  </h3>
                </div>
                
                {video.descricao && (
                  <p className="text-slate-400 text-xs font-medium leading-relaxed italic whitespace-pre-wrap line-clamp-3">
                    {video.descricao}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-900 rounded-[40px] space-y-4">
             <div className="p-5 bg-slate-900 w-fit mx-auto rounded-full text-slate-700">
                <Icons.Play className="w-8 h-8" />
             </div>
             <p className="text-slate-600 font-black uppercase text-xs tracking-widest">O Lab está sendo atualizado pelo Jorge.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;
