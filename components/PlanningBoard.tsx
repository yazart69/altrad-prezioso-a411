'use client'
import { useState } from 'react';
import { Calendar, Printer, Send, Phone, MapPin, User } from 'lucide-react';

interface PlanningProps {
  projects: any[];
  personnel: any[];
}

export default function PlanningBoard({ projects, personnel }: PlanningProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Générer les jours de la semaine (Lundi -> Vendredi)
  const getDaysOfWeek = (date: Date) => {
    const days = [];
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1); // Trouver le lundi
    
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentWeek);

  // Fonction d'impression
  const handlePrint = () => {
    window.print();
  };

  // Simulation envoi SMS
  const handleSendSMS = () => {
    const recipientCount = projects.reduce((acc, p) => acc + (p.equipe?.length || 0), 0);
    alert(`📢 SIMULATION ENVOI SMS\n\n${recipientCount} convocations envoyées aux équipes.\nContenu : "Planning semaine disponible. Merci de consulter l'application."`);
  };

  // Récupérer les infos complètes des membres d'une équipe
  const getTeamDetails = (teamIds: string[]) => {
    if (!Array.isArray(teamIds)) return [];
    return personnel.filter(p => teamIds.includes(p.id));
  };

  return (
    <div className="flex flex-col gap-6 h-full print:bg-white print:text-black">
      {/* Header Planning */}
      <div className="flex justify-between items-center bg-btp-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl print:border-none print:p-0">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter print:text-black">Planning Hebdomadaire</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest print:text-gray-600">
            Semaine du {weekDays[0].toLocaleDateString()} au {weekDays[4].toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-4 print:hidden">
          <button 
            onClick={handleSendSMS}
            className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-600/30 px-4 py-3 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center gap-2 text-[10px]"
          >
            <Send size={14} /> Envoyer SMS
          </button>
          <button 
            onClick={handlePrint}
            className="bg-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center gap-2 text-[10px]"
          >
            <Printer size={14} /> Imprimer
          </button>
        </div>
      </div>

      {/* Grille du Planning */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 gap-6">
          {projects.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
               <p className="text-gray-500 font-bold uppercase">Aucun chantier actif cette semaine</p>
             </div>
          ) : (
            projects.map((proj) => {
              const teamMembers = getTeamDetails(proj.equipe);
              
              return (
                <div key={proj.id} className="bg-btp-card/30 border border-white/5 rounded-2xl p-6 break-inside-avoid print:border-gray-300 print:bg-white">
                  {/* Info Chantier */}
                  <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4 print:border-gray-300">
                    <div>
                      <h3 className="text-lg font-black text-btp-cyan uppercase italic tracking-tight print:text-black">{proj.nom}</h3>
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase">{proj.ville || 'Localisation non définie'}</span>
                      </div>
                    </div>
                    {/* Chef de chantier (Premier trouvé ou marqué comme tel) */}
                    {teamMembers.length > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Responsable</p>
                        <p className="text-xs font-bold text-white uppercase print:text-black">
                          {teamMembers.find(m => m.role === 'chef_chantier')?.nom || teamMembers[0].nom}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vue Semaine Simplifiée */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {weekDays.map((day, idx) => (
                      <div key={idx} className="bg-btp-dark/50 border border-white/5 rounded-xl p-3 text-center print:bg-gray-100 print:border-gray-200">
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                        <p className="text-sm font-black text-white print:text-black">{day.getDate()}</p>
                        {/* Indicateur de présence (Simulé pour l'instant : tout le monde est là toute la semaine) */}
                        <div className="mt-2 flex justify-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Liste des Opérateurs */}
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Équipe Affectée</p>
                    <div className="flex flex-wrap gap-3">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5 print:border-gray-300 print:bg-gray-50">
                          <User size={12} className="text-btp-cyan print:text-black" />
                          <span className="text-[10px] font-bold text-gray-200 uppercase print:text-black">{member.nom}</span>
                          <span className="text-[8px] bg-black/30 px-1.5 rounded text-gray-500 font-mono print:hidden">{member.matricule}</span>
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <span className="text-[10px] text-red-500 italic font-bold">⚠️ Aucune équipe assignée</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
