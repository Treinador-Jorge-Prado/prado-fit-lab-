
import React, { useState, useEffect, useRef } from 'react';
import { User, EvolutionEntry, Biometrics, CheckIn, PlanilhaTreino } from '../types';
import { Icons } from '../constants';
import { supabase } from '../supabaseService';

interface ProfileViewProps {
  student: User;
  evolutionHistory: EvolutionEntry[];
  onUpdateBiometrics: (metrics: Biometrics) => void;
  checkins?: CheckIn[];
  onUploadShape?: (file: File) => Promise<void>;
  isTrainerMode?: boolean;
  onBack?: () => void;
  workout?: PlanilhaTreino;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  student, evolutionHistory, onUpdateBiometrics, checkins = [], onUploadShape, isTrainerMode, onBack, workout 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [muralFotos, setMuralFotos] = useState<any[]>([]);
  const [isLoadingGaleria, setIsLoadingGaleria] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const buscarFotos = async () => {
      if (!student?.id) return;
      setIsLoadingGaleria(true);
      
      const { data, error } = await supabase
        .from('evolucao_fotos')
        .select('*')
        .eq('aluno_id', student.id);
      
      if (error) {
        console.error("Erro ao buscar mural:", error.message);
        setMuralFotos([]);
      } else {
        // Ordenação via Javascript para evitar erro 400 no banco se a coluna não existir
        const ordenadas = (data || []).sort((a, b) => {
          return new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime();
        });
        console.log("Fotos do Mural carregadas:", ordenadas);
        setMuralFotos(ordenadas);
      }
      setIsLoadingGaleria(false);
    };
    buscarFotos();
  }, [student.id, student.url_shape_atual]);

  const handleDeleteFoto = async (id: string) => {
    // Removi o confirm() para evitar o bloqueio do sandbox
    try {
      const { error } = await supabase
        .from('evolucao_fotos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar:', error.message);
        alert('Erro ao excluir'); 
      } else {
        // Remove da tela imediatamente
        setMuralFotos(current => current.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadShape) {
      setIsUploading(true);
      try {
        await onUploadShape(file);
      } catch (error) {
        console.error("Erro no processamento da imagem:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const studentCheckins = checkins.filter(c => c.studentId === student.id);

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-700 pb-32 max-w-2xl mx-auto">
      
      {/* CABEÇALHO DE PERFIL */}
      <div className="flex flex-col items-center text-center space-y-5 pt-8 relative">
        {isTrainerMode && onBack && (
          <button onClick={onBack} className="absolute top-8 left-0 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
            ← Voltar ao Painel
          </button>
        )}
        
        <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-800 p-1 overflow-hidden shadow-2xl relative group">
          <img 
            src={student?.url_shape_atual || student?.profileImage || `https://ui-avatars.com/api/?name=${student?.name}&background=f97316&color=fff&size=200`} 
            className="w-full h-full object-cover rounded-full bg-slate-800"
            alt="Destaque Atual"
            referrerPolicy="no-referrer"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center rounded-full">
               <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{student?.name}</h1>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">
            {isTrainerMode ? 'Inspeção de Performance' : 'Membro Team Prado'}
          </p>
        </div>
      </div>

      {/* DASHBOARD RÁPIDO */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Treinos no Lab</p>
          <p className="text-3xl font-black text-white">{studentCheckins.length}</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 text-right">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-right">Mural Evolução</p>
          <p className="text-3xl font-black text-orange-500">{muralFotos.length}</p>
        </div>
      </div>

      {/* MURAL DE EVOLUÇÃO (HISTÓRICO) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Icons.Camera className="w-4 h-4 text-orange-500" /> Galeria Lab Histórico
          </h2>
          
          {!isTrainerMode && (
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <button 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-2 shadow-xl shadow-orange-500/5"
              >
                {isUploading ? (
                  <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icons.Plus className="w-3 h-3" />
                )}
                {isUploading ? 'SINCRONIZANDO...' : 'ATUALIZAR SHAPE'}
              </button>
            </div>
          )}
        </div>
        
        {isLoadingGaleria ? (
          <div className="h-48 flex flex-col items-center justify-center bg-slate-900/40 rounded-[32px] border border-slate-800 border-dashed animate-pulse">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Acessando Galeria Lab...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {muralFotos.length > 0 ? (
              muralFotos.map((foto) => (
                <div key={foto.id} className="relative aspect-square rounded-[32px] overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group transition-all duration-500 hover:scale-[1.02]">
                  <img 
                    src={foto.url_foto} 
                    alt="Registro Evolução" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onClick={() => setFotoSelecionada(foto.url_foto)}
                  />
                  
                  {/* Botão de Excluir - Apenas para Alunos */}
                  {!isTrainerMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFoto(foto.id);
                      }}
                      className="absolute top-4 right-4 z-10 p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-xl transform hover:scale-110"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">
                        {foto.created_at ? new Date(foto.created_at).toLocaleDateString('pt-BR') : 'Sem Data'}
                      </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-24 text-center bg-slate-900/40 rounded-[32px] border border-dashed border-slate-800">
                <Icons.Camera className="w-10 h-10 opacity-10 mx-auto mb-4 text-white" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nenhuma foto registrada no histórico.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PROTOCOLO ATIVO */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
          <Icons.Dumbbell className="w-4 h-4 text-orange-500" /> Protocolo Ativo
        </h2>
        {workout ? (
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[32px] shadow-inner">
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{workout.nome_da_planilha}</h3>
             <div className="flex gap-2 mt-6">
                {workout.divisoes.map(d => (
                   <div key={d.letra} className="flex flex-col items-center gap-1">
                     <span className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-black text-orange-500">
                       {d.letra}
                     </span>
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/20 border border-slate-800 rounded-[32px]">
             <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest">Nenhum protocolo prescrito.</p>
          </div>
        )}
      </div>

      {/* Modal de Zoom */}
      {fotoSelecionada && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setFotoSelecionada(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <Icons.X className="w-8 h-8" />
          </button>
          
          <img 
            src={fotoSelecionada} 
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300"
            alt="Visualização completa"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileView;
