
import React from 'react';
import { Icons } from '../constants';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
  title: string;
  instructions?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose, title, instructions }) => {
  /**
   * Extrai o ID de 11 caracteres do YouTube de diversos formatos de link:
   * - youtube.com/watch?v=ID
   * - youtu.be/ID
   * - youtube.com/shorts/ID
   * - youtube.com/embed/ID
   */
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&mute=1&showinfo=0`;
    }
    
    // Fallback caso não seja YouTube, tenta o link direto ou retorna vazio
    return url;
  };

  const finalUrl = getEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Overlay para fechar ao clicar fora */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Protocolo de Execução</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-orange-500 text-slate-950 rounded-2xl hover:bg-orange-400 transition-all shadow-lg active:scale-90"
          >
            <Icons.Plus className="rotate-45 w-6 h-6" strokeWidth={3} />
          </button>
        </div>
        
        {/* Conteúdo Principal */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {/* Player de Vídeo */}
          <div className="relative pt-[56.25%] bg-black">
            {finalUrl ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={finalUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-3">
                <Icons.Play className="w-12 h-12 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">Vídeo Indisponível</span>
              </div>
            )}
          </div>

          {/* Instruções Técnicas */}
          <div className="p-8 space-y-6 bg-slate-900">
            {instructions && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Instruções Técnicas do Jorge
                </h4>
                <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-[24px] shadow-inner">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed italic whitespace-pre-wrap">
                    "{instructions}"
                  </p>
                </div>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="w-full py-5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              Entendido, vamos treinar!
            </button>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Team Prado • Biomecânica de Elite</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
