
import React from 'react';
import { Icons } from '../constants';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
  title: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose, title }) => {
  // Helper to convert standard YouTube URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 bg-slate-900 border-b border-slate-800">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="relative pt-[56.25%] bg-black">
          {embedUrl ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest">
              Vídeo não disponível
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-900 text-center">
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Prado Fit Lab • Biomecânica Aplicada</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
