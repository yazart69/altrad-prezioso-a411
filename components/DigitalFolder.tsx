'use client'
import { useState, useRef } from 'react';
import { FileText, Download, ExternalLink, Upload, FolderOpen, Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FolderProps {
  project: any;
}

export default function DigitalFolder({ project }: FolderProps) {
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les documents au montage (ou via un useEffect parent idéalement, ici on le fait en local pour simplifier)
  useState(() => {
    if (project?.id) fetchDocs();
  });

  async function fetchDocs() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', project.id)
      .neq('type', 'photo'); // On exclut les photos, on ne veut que les fichiers
    if (data) setDocs(data);
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload Storage (Bucket 'files')
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}/${Date.now()}.${fileExt}`;
      
      // Note: Assurez-vous d'avoir créé le bucket 'files' dans Supabase
      const { error: uploadError } = await supabase.storage
        .from('files') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      // 2. Insert DB
      // On détecte le type (Plan, Sécurité, etc.) selon le nom ou par défaut
      let type = 'Autre';
      if (file.name.toLowerCase().includes('plan')) type = 'Plan';
      if (file.name.toLowerCase().includes('securite') || file.name.toLowerCase().includes('ppsps')) type = 'Sécurité';
      if (file.name.toLowerCase().includes('procedure')) type = 'Procédure';

      await supabase.from('documents').insert({
        project_id: project.id,
        name: file.name,
        url: publicUrl,
        type: type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      fetchDocs(); // Rafraichir la liste
    } catch (error: any) {
      alert("Erreur Upload (Vérifiez que le bucket 'files' existe et est public) : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.from('documents').delete().eq('id', id);
    fetchDocs();
  };

  return (
    <div className="bg-btp-card/30 rounded-[2rem] border border-white/5 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group flex flex-col h-full min-h-[300px]">
      {/* Effet visuel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-btp-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-btp-cyan/10 transition-all duration-700"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-btp-cyan/10 rounded-xl text-btp-cyan">
            <FolderOpen size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Classeur Digital</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Plans & Sécurité</p>
          </div>
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-2 rounded-xl transition-all"
        >
          {uploading ? <Loader2 size={14} className="animate-spin text-btp-cyan" /> : <Upload size={14} className="text-btp-cyan" />}
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Ajouter PDF</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" />
      </div>

      {/* Liste des Documents */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/5 rounded-2xl opacity-50">
            <FolderOpen size={24} className="text-gray-600 mb-2" />
            <p className="text-[9px] font-bold text-gray-500 uppercase">Dossier vide</p>
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="group/item flex items-center justify-between p-3 bg-btp-dark/40 border border-white/5 hover:border-btp-cyan/30 rounded-xl transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Icône selon le type */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  doc.type === 'Sécurité' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  doc.type === 'Plan' ? 'bg-btp-cyan/10 border-btp-cyan/20 text-btp-cyan' :
                  'bg-gray-700/30 border-white/10 text-gray-400'
                }`}>
                  {doc.type === 'Sécurité' ? <ShieldAlert size={18} /> : <FileText size={18} />}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-white uppercase truncate max-w-[150px]" title={doc.name}>
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] px-1.5 rounded font-bold uppercase ${
                      doc.type === 'Sécurité' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'
                    }`}>
                      {doc.type}
                    </span>
                    <span className="text-[8px] text-gray-600 font-mono">{doc.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 hover:bg-btp-cyan/20 hover:text-btp-cyan text-gray-500 rounded-lg transition-colors"
                  title="Ouvrir"
                >
                  <ExternalLink size={14} />
                </a>
                <button 
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-500 text-gray-600 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Alerte de mise à jour (Fausse info temps réel pour l'immersion, ou vraie si on connecte la date) */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-gray-500 uppercase tracking-widest">
        <span>Documents synchronisés</span>
        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Live</span>
      </div>
    </div>
  );
}
