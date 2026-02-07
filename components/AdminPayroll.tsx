'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Download, AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';

interface PayrollProps {
  project: any;
}

export default function AdminPayroll({ project }: PayrollProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les pointages
  const fetchLogs = async () => {
    setLoading(true);
    // On récupère les pointages + les infos du profil associé
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles:user_id (nom, matricule, role)
      `)
      .eq('project_id', project.id)
      .order('check_in', { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [project]);

  // Fonction utilitaire pour formater la durée
  const formatDuration = (hours: number | null) => {
    if (!hours) return '--:--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m < 10 ? '0' + m : m}`;
  };

  // Fonction utilitaire pour l'heure
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fonction Export CSV
  const handleExport = () => {
    const headers = ['Date', 'Nom', 'Matricule', 'Arrivée', 'Départ', 'Total Heures', 'Statut'];
    const rows = logs.map(log => [
      new Date(log.check_in).toLocaleDateString(),
      log.profiles?.nom,
      log.profiles?.matricule,
      formatTime(log.check_in),
      formatTime(log.check_out),
      log.total_heures ? log.total_heures.toFixed(2) : '0',
      log.check_out ? 'Validé' : 'En cours/Oubli'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Pointages_${project.nom}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-btp-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestion des Heures</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Validation & Paie</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-600/30 px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-colors flex items-center gap-2 text-[10px]"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      {/* Tableau des Pointages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex flex-col gap-3">
          {logs.map((log) => {
            const isComplete = !!log.check_out;
            const isLate = !isComplete && new Date().getHours() > 18; // Considéré comme oubli si pas pointé après 18h

            return (
              <div key={log.id} className="bg-btp-card/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                
                {/* Info Utilisateur */}
                <div className="flex items-center gap-4 w-1/4">
                  <div className="w-10 h-10 rounded-xl bg-btp-dark border border-white/10 flex items-center justify-center font-black text-gray-500">
                    {log.profiles?.nom?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase">{log.profiles?.nom}</h3>
                    <p className="text-[9px] text-gray-500 font-mono">{log.profiles?.matricule}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex flex-col items-center w-1/6">
                   <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                     <Calendar size={10} /> {new Date(log.check_in).toLocaleDateString()}
                   </span>
                </div>

                {/* Horaires Arrivée / Départ */}
                <div className="flex items-center gap-8 w-1/3 justify-center">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Arrivée</p>
                    <p className="text-sm font-bold text-green-400">{formatTime(log.check_in)}</p>
                  </div>
                  <div className="w-8 h-0.5 bg-white/10"></div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Départ</p>
                    {isComplete ? (
                      <p className="text-sm font-bold text-red-400">{formatTime(log.check_out)}</p>
                    ) : (
                      <p className={`text-xs font-black uppercase ${isLate ? 'text-btp-pink animate-pulse' : 'text-btp-amber'}`}>
                        {isLate ? 'Oubli ?' : 'En cours'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total Heures */}
                <div className="w-1/6 text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    isComplete 
                    ? 'bg-btp-cyan/5 border-btp-cyan/20 text-btp-cyan' 
                    : 'bg-white/5 border-white/10 text-gray-500'
                  }`}>
                    <Clock size={14} />
                    <span className="font-black text-sm">{formatDuration(log.total_heures)}</span>
                  </div>
                </div>

                {/* Indicateur GPS (Petit bonus visuel) */}
                <div className="ml-4">
                    {log.gps_lat_in && (
                        <a 
                          href={`https://www.google.com/maps?q=${log.gps_lat_in},${log.gps_lng_in}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-gray-600 hover:text-white transition-colors"
                          title="Voir position GPS"
                        >
                            <MapPin size={14} />
                        </a>
                    )}
                </div>

              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-gray-500 font-bold uppercase">Aucun pointage enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Petite icône map pin manquante dans l'import
function MapPin({size}: {size:number}) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
}
