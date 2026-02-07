'use client'
import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Maximize2, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PhotoAlbumProps {
  project: any;
  user: any;
  photos: any[]; // On passera la liste des documents type 'photo'
  onPhotoAdded: () => void;
}

export default function PhotoAlbum({ project, user, photos, onPhotoAdded }: PhotoAlbumProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null); // Pour la Lightbox
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction d'upload vers Supabase Storage
  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload du fichier dans le bucket 'photos'
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // 3. Créer l'entrée dans la table 'documents'
      const { error: dbError } = await supabase.from('documents').insert({
        project_id: project.id,
        name: `Photo par ${user.nom}`,
        url: publicUrl,
        type: 'photo',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      if (dbError) throw dbError;

      // Succès
      onPhotoAdded();

    } catch (error: any) {
      alert("Erreur Upload : Avez-vous créé le bucket 'photos' public dans Supabase ?\n" + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-btp-card/30 rounded-[2rem] border border-white/5 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
        {/* Effet visuel */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
              <Camera size={20} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Album Chantier</h3>
          </div>
          
          {/* Bouton invisible qui déclenche l'input file */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-2 rounded-xl transition-colors"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span className="text-[9px] font-black uppercase tracking-widest">Ajouter</span>
          </button>
          
          {/* Input caché compatible Mobile (Caméra + Galerie) */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Force la caméra arrière sur mobile si possible
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>

        {/* Grille des photos (Mode Album) */}
        <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
          {photos.filter(d => d.type === 'photo').length === 0 ? (
            <div className="col-span-3 py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
              <ImageIcon size={24} className="mx-auto text-gray-600 mb-2" />
              <p className="text-[9px] text-gray-500 font-bold uppercase">Aucune photo</p>
            </div>
          ) : (
            photos.filter(d => d.type === 'photo').map((photo) => (
              <div 
                key={photo.id} 
                className="aspect-square rounded-xl bg-btp-dark border border-white/10 overflow-hidden relative group/img cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.url} alt="Chantier" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={16} className="text-white" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- LIGHTBOX (Plein Écran) --- */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>

          <img 
            src={selectedPhoto.url} 
            alt="Plein écran" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          />

          <div className="mt-6 text-center">
            <p className="text-sm font-black text-white uppercase tracking-widest">{selectedPhoto.name}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase">{new Date(selectedPhoto.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </>
  );
}
