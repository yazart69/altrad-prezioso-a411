'use client'
import { Users, UserPlus, Shield, HardHat, MoreVertical, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TeamProps {
  project: any;
  personnel: any[];
  isAdmin: boolean;
  onUpdate: (proj: any) => void;
}

export default function ProjectTeam({ project, personnel, isAdmin, onUpdate }: TeamProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // 1. Filtrer l'équipe ACTUELLE (ceux dont l'ID est dans project.equipe)
  // project.equipe est stocké en JSONB, on s'attend à un tableau d'IDs ["uuid1", "uuid2"]
  const teamIds = Array.isArray(project?.equipe) ? project.equipe : [];
  
  const currentTeam = personnel.filter(p => teamIds.includes(p.id));
  
  // 2. Filtrer le personnel DISPONIBLE (ceux qui ne sont PAS dans l'équipe)
  const availablePersonnel = personnel.filter(p => !teamIds.includes(p.id));

  // Fonction d'ajout (Liaison Intelligente)
  const handleAddMember = async (userId: string, currentStatus: string) => {
    // Avertissement si pas disponible
    if (currentStatus !== 'disponible') {
      if (!confirm(`ATTENTION : Cet agent est marqué comme "${currentStatus.toUpperCase()}". Voulez-vous vraiment l'ajouter au chantier ?`)) {
        return;
      }
    }

    const newEquipe = [...teamIds, userId];
    
    // Mise à jour en base
    const { data, error } = await supabase
      .from('projects')
      .update({ equipe: newEquipe })
      .eq('id', project.id)
      .select()
      .single();

    if (!error && data) {
      onUpdate(data);
      setIsAdding(false);
    } else {
      alert("Erreur lors de l'ajout.");
    }
  };

  // Fonction de suppression
  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Retirer cet agent du chantier ?")) return;

    const newEquipe = teamIds.filter((id: string) => id !== userId);
    
    const { data, error } = await supabase
      .from('projects')
      .update({ equipe: newEquipe })
      .eq('id', project.id)
      .select()
      .single();

    if (!error && data) onUpdate(data);
  };

  return (
    <div className="bg-btp-card/30 rounded-[2rem] border border-white/5 backdrop-blur-xl p-6 shadow-2xl overflow-hidden relative group flex flex-col h-full">
      {/* Effet d'ambiance */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-btp-cyan/5 rounded-full blur-[80px] group-hover:bg-btp-cyan/10 transition-all duration-700"></div>

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-btp-pink/10 rounded-xl text-btp-pink shadow-[0_0_15px_rgba(255,0,122,0.1)]">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Effectif Chantier</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Gestion des accès</p>
          </div>
        </div>
        <span className="text-[10px] font-black text-btp-cyan bg-btp-cyan/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-btp-cyan/20">
          {currentTeam.length} Présents
        </span>
      </div>

      {/* LISTE DES MEMBRES ACTUELS */}
      <div className="flex flex-col gap-3 mb-6 relative z-10 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-[150px]">
        {currentTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Aucun personnel assigné</p>
          </div>
        ) : (
          currentTeam.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item">
              <div className="flex items-center gap-4">
                {/* Avatar avec indicateur de rôle */}
                <div className="w-10 h-10 rounded-xl bg-btp-dark border border-white/10 flex items-center justify-center relative shadow-inner">
                  {member.role === 'admin' ? <Shield size={16} className="text-btp-pink" /> : <HardHat size={16} className="text-gray-400" />}
                  {/* Pastille de statut */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-btp-dark ${
                    member.status === 'disponible' ? 'bg-green-500' : 
                    member.status === 'conges' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{member.nom}</p>
                    {/* ALERTE VISUELLE SI PAS DISPO */}
                    {member.status !== 'disponible' && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1 ${
                        member.status === 'conges' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        <AlertTriangle size={8} /> {member.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase italic">{member.role} • {member.matricule}</p>
                </div>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-500 text-gray-600 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ZONE D'AJOUT (ADMIN SEULEMENT) */}
      {isAdmin && (
        <div className="relative pt-4 border-t border-white/5 z-10 mt-auto">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-btp-cyan/50 hover:bg-btp-cyan/5 text-gray-500 hover:text-btp-cyan transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <UserPlus size={14} /> Assigner du personnel
            </button>
          ) : (
            <div className="bg-btp-dark rounded-xl border border-white/10 p-2 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Sélectionner un agent</span>
                <button onClick={() => setIsAdding(false)} className="text-[9px] text-red-500 font-bold hover:underline">ANNULER</button>
              </div>
              
              <div className="max-h-[150px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {availablePersonnel.length === 0 ? (
                  <p className="text-[9px] text-gray-600 text-center py-2">Tout le monde est déjà assigné.</p>
                ) : (
                  availablePersonnel.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddMember(p.id, p.status)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group/opt text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'disponible' ? 'bg-green-500' : 
                          p.status === 'conges' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-[10px] font-bold uppercase ${p.status !== 'disponible' ? 'text-gray-500' : 'text-gray-300'}`}>
                          {p.nom}
                        </span>
                      </div>
                      
                      {/* Icône d'alerte dans le menu si pas dispo */}
                      {p.status !== 'disponible' && (
                        <AlertTriangle size={12} className={p.status === 'conges' ? 'text-blue-500' : 'text-red-500'} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
