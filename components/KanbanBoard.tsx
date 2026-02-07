'use client'
import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Clock, AlertCircle, CheckCircle2, Circle, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KanbanProps {
  project: any;
  user: any;
}

export default function KanbanBoard({ project, user }: KanbanProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Chargement initial + Abonnement Temps Réel
  useEffect(() => {
    if (!project) return;

    // Charger les tâches existantes
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select(`*, assigned_to (nom, matricule)`)
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });
      
      if (data) setTasks(data);
      setLoading(false);
    };

    fetchTasks();

    // Abonnement aux changements (Live Sync)
    const channel = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${project.id}` }, 
        () => { fetchTasks(); } // On recharge tout bêtement au moindre changement
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [project]);

  // 2. Fonctions d'action
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { error } = await supabase.from('tasks').insert({
      project_id: project.id,
      titre: newTaskTitle,
      status: 'todo',
      assigned_to: user.id, // Assigné à celui qui crée par défaut
      urgence: false
    });

    if (!error) {
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const updateStatus = async (taskId: string, currentStatus: string) => {
    // Logique simple : Todo -> Progress -> Done -> Todo
    let nextStatus = 'todo';
    if (currentStatus === 'todo') nextStatus = 'doing';
    if (currentStatus === 'doing') nextStatus = 'done';
    
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  // 3. Calculs pour la barre de progression
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Colonnes
  const columns = [
    { id: 'todo', title: 'À FAIRE', color: 'border-btp-cyan', textColor: 'text-btp-cyan', glow: 'shadow-[0_0_15px_rgba(0,242,255,0.1)]' },
    { id: 'doing', title: 'EN COURS', color: 'border-btp-amber', textColor: 'text-btp-amber', glow: 'shadow-[0_0_15px_rgba(255,184,0,0.1)]' },
    { id: 'done', title: 'TERMINÉ', color: 'border-green-500', textColor: 'text-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]' }
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* BARRE DE PROGRESSION GLOBALE */}
      <div className="bg-btp-card/50 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex justify-between items-end mb-2 relative z-10">
          <div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Avancement Global</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Objectif Journalier</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-btp-cyan to-white italic">
              {progress}%
            </span>
          </div>
        </div>
        {/* Barre de fond */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-btp-cyan to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_20px_#00f2ff]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {/* Effet d'ambiance */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-btp-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* TABLEAU KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {columns.map(col => {
          const colTasks = tasks.filter(t => (col.id === 'doing' ? t.status === 'doing' : col.id === 'done' ? t.status === 'done' : t.status === 'todo'));

          return (
            <div key={col.id} className={`flex flex-col gap-4 bg-btp-card/20 rounded-[2rem] p-5 border border-white/5 backdrop-blur-md ${col.glow} relative`}>
              {/* Header Colonne */}
              <div className={`flex justify-between items-center pb-3 border-b-2 ${col.color}`}>
                <h4 className={`font-black text-sm uppercase tracking-widest ${col.textColor}`}>{col.title}</h4>
                <span className="bg-white/5 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{colTasks.length}</span>
              </div>

              {/* Liste des Tâches */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
                {colTasks.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-50">
                    <p className="text-[9px] font-bold text-gray-600 uppercase">Vide</p>
                  </div>
                )}
                
                {colTasks.map(task => (
                  <div key={task.id} className="group bg-btp-dark/80 border border-white/5 hover:border-white/20 p-4 rounded-2xl shadow-lg transition-all relative">
                    
                    {/* Header Carte */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] bg-white/5 text-gray-400 px-2 py-1 rounded font-black tracking-widest uppercase truncate max-w-[80px]">
                        {task.assigned_to?.nom || 'Non assigné'}
                      </span>
                      {user.role === 'admin' && (
                        <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    
                    {/* Titre & Action */}
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => updateStatus(task.id, task.status)}
                        className={`mt-0.5 min-w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                          task.status === 'done' 
                          ? 'bg-green-500 border-green-500 text-btp-dark' 
                          : 'border-gray-500 hover:border-btp-cyan text-transparent hover:text-btp-cyan/50'
                        }`}
                      >
                        {task.status === 'done' ? <CheckCircle2 size={12} /> : <Circle size={10} />}
                      </button>
                      <p className={`text-sm font-bold leading-tight ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {task.titre}
                      </p>
                    </div>

                    {/* Footer Carte */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                        <Clock size={12} />
                        <span>{new Date(task.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {task.urgence && (
                        <div className="flex items-center gap-1 text-[9px] text-btp-pink font-black italic uppercase animate-pulse">
                          <AlertCircle size={10} /> Urgent
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton Ajouter (Seulement dans TODO) */}
              {col.id === 'todo' && (
                <div className="mt-auto pt-2">
                  {!isAdding ? (
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-btp-cyan/50 hover:bg-btp-cyan/5 text-gray-500 hover:text-btp-cyan transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus size={14} /> Nouvelle Tâche
                    </button>
                  ) : (
                    <form onSubmit={addTask} className="bg-btp-dark rounded-xl border border-white/10 p-3 animate-in slide-in-from-bottom-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Titre de la tâche..." 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white text-xs font-bold mb-3 placeholder:text-gray-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white">Annuler</button>
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-btp-cyan text-btp-dark text-[10px] font-black uppercase hover:bg-white transition-colors">Ajouter</button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
