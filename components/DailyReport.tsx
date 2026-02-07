import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Send, CheckCircle, Clock, MapPin, 
  FileText, Mail, LogOut, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const DailyReport = ({ project, user, tasks, photos, notes }: any) => {
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleFinishDay = async () => {
    if (sigCanvas.current?.isEmpty()) return alert("La signature de départ est obligatoire.");

    setLoading(true);
    const departureTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

    // 1. Enregistrement du pointage de départ
    const { error } = await supabase.from('pointages').insert([{
      chantier_id: project.id,
      user_nom: `${user.nom} ${user.prenom}`,
      type: 'Départ',
      heure: new Date().toISOString(),
      signature: signatureData
    }]);

    if (error) {
      alert("Erreur de sauvegarde : " + error.message);
      setLoading(false);
      return;
    }

    // 2. Préparation du contenu de l'Email / WhatsApp
    const doneTasks = tasks.filter((t: any) => t.done).map((t: any) => `- ${t.label}`).join('%0A');
    const photoCount = photos.length;
    
    const subject = `RAPPORT DE CHANTIER - ${project.nom.toUpperCase()} - ${new Date().toLocaleDateString()}`;
    const body = `
Bonjour Ertugrul,%0A%0A
Voici le rapport de fin de journée pour le chantier : ${project.nom}%0A
--------------------------------------------------%0A
👤 Opérateur : ${user.nom} ${user.prenom}%0A
⏰ Heure de départ : ${departureTime}%0A%0A
✅ TÂCHES TERMINÉES :%0A
${doneTasks || "Aucune tâche cochée"}%0A%0A
📝 NOTES DU JOUR :%0A
${notes || "Aucune note particulière"}%0A%0A
📸 PHOTOS : ${photoCount} ajoutées au dossier.%0A%0A
--------------------------------------------------%0A
Rapport généré automatiquement par Altrad PREZIOSO A411.
    `.replace(/ /g, '%20');

    // 3. Envoi immédiat (Ouvre l'appli mail par défaut)
    window.location.href = `mailto:Ertugrul.yasar@altrad.com?subject=${subject}&body=${body}`;
    
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-50 rounded-full">
          <LogOut className="w-8 h-8 text-red-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase">Fin de Journée</h2>
          <p className="text-slate-500 font-medium">Validez vos heures et envoyez le rapport.</p>
        </div>

        {/* Récapitulatif visuel */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Tâches Faites</p>
            <p className="text-xl font-black text-slate-800">{tasks.filter((t:any)=>t.done).length}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase">Heure Actuelle</p>
            <p className="text-xl font-black text-slate-800">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
          </div>
        </div>

        {/* Signature de sortie */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black text-slate-400 uppercase">Signature de départ</label>
            <button onClick={() => sigCanvas.current?.clear()} className="text-[10px] font-black text-red-500 uppercase">Effacer</button>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor='black'
              canvasProps={{className: 'w-full h-40 cursor-crosshair'}}
            />
          </div>
        </div>

        <button 
          onClick={handleFinishDay}
          disabled={loading}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95"
        >
          {loading ? "Génération..." : "SIGNER & ENVOYER LE RAPPORT"}
          <Send className="w-6 h-6" />
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Destinataire : Ertugrul.yasar@altrad.com
        </p>
      </div>
    </div>
  );
};

export default DailyReport;