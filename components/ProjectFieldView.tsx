import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Camera, BookOpen, Image as ImageIcon, 
  Plus, X, Maximize2, CloudSun, AlertCircle, Send,
  CheckCircle2, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  label: string;
  done: boolean;
  updatedBy: string;
}

const ProjectFieldView = ({ project, user }: { project: any, user: any }) => {
  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // Pour le Lightbox
  const [loading, setLoading] = useState(false);

  // Calcul de progression automatique
  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) 
    : 0;

  // 1. Gestion des Tâches (Sync Live)
  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, done: !t.done, updatedBy: user.nom } : t
    );
    setTasks(updatedTasks);
    await supabase.from('chantiers').update({ tasks: updatedTasks }).eq('id', project.id);
  };

  // 2. Gestion des Photos
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    // Ici on simulerait l'upload vers Supabase Storage
    const file = e.target.files[0];
    const newPhoto = {
      url: URL.createObjectURL(file), // En réel : URL du bucket
      author: user.nom,
      date: new Date().toLocaleDateString()
    };
    setPhotos([newPhoto, ...photos]);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Barre de Progression Royale */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">AVANCEMENT</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Temps réel</p>
          </div>
          <span className="text-4xl font-black text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION TÂCHES */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare className="text-blue-500" /> TÂCHES DU JOUR
          </h3>
          <div className="space-y-3">
            {tasks.map(task => (
              <button 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  task.done ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-transparent text-slate-600'
                }`}
              >
                {task.done ? <CheckCircle2 className="fill-green-500 text-white" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300" />}
                <span className="font-bold">{task.label}</span>
                {task.done && <span className="ml-auto text-[10px] font-black opacity-50">PAR: {task.updatedBy}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION ALBUM PHOTO */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Camera className="text-orange-500" /> ALBUM CHANTIER
            </h3>
            <label className="bg-orange-500 text-white p-2 rounded-xl cursor-pointer hover:bg-orange-600 transition-colors">
              <Plus />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedPhoto(photo.url)}
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity relative group"
              >
                <img src={photo.url} alt="Chantier" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="text-white w-5 h-5" />
                </div>
              </div>
            ))}
            {loading && <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>}
          </div>
        </div>
      </div>

      {/* JOURNAL DE BORD */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <BookOpen className="text-orange-400" /> JOURNAL DE BORD
        </h3>
        <textarea 
          placeholder="Notez ici les événements (Météo, retard, visites client...)"
          className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-orange-500 min-h-[120px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
        <button className="mt-3 w-full py-3 bg-orange-500 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
          <Send className="w-4 h-4" /> ENREGISTRER LA NOTE
        </button>
      </div>

      {/* LIGHTBOX (Visionneuse plein écran) */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X className="w-8 h-8" />
          </button>
          <img src={selectedPhoto} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="Plein écran" />
        </div>
      )}
    </div>
  );
};

export default ProjectFieldView;