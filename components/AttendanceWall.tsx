import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  MapPin, Clock, ShieldCheck, Map, 
  AlertCircle, ChevronRight, Lock, 
  Unlock, CheckCircle2, Navigation
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AttendanceWallProps {
  project: any;
  user: any; // L'ouvrier connecté via son matricule
  onUnlocked: () => void; // Fonction pour débloquer l'accès au reste de l'app
}

const AttendanceWall = ({ project, user, onUnlocked }: AttendanceWallProps) => {
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Fonction pour capturer la position GPS
  const getCoordinates = () => {
    setGpsStatus('fetching');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsStatus('success');
        },
        () => {
          setGpsStatus('error');
          alert("Erreur GPS : Veuillez activer la localisation.");
        }
      );
    }
  };

  const handleValidation = async () => {
    if (sigCanvas.current?.isEmpty()) return alert("La signature est obligatoire.");
    if (!location) return alert("La localisation GPS est obligatoire pour valider l'arrivée.");

    setLoading(true);
    const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');

    const { error } = await supabase.from('pointages').insert([{
      chantier_id: project.id,
      user_nom: `${user.nom} ${user.prenom}`,
      type: 'Arrivée',
      heure: new Date().toISOString(),
      gps: location,
      signature: signatureData
    }]);

    if (!error) {
      onUnlocked(); // Débloque l'interface du chantier
    } else {
      alert("Erreur lors du pointage : " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-8">
        
        {/* En-tête de sécurité */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-orange-100 rounded-3xl mb-2">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Accès Verrouillé</h1>
          <p className="text-slate-500 font-medium">Veuillez valider votre arrivée sur le chantier :</p>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl inline-block font-bold mt-2">
            {project.nom}
          </div>
        </div>

        {/* Bloc Signature */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 space-y-4">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Signature de l'opérateur
            </label>
            <button 
              onClick={() => sigCanvas.current?.clear()}
              className="text-[10px] font-black text-red-500 uppercase hover:underline"
            >
              Effacer
            </button>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor='black'
              canvasProps={{className: 'w-full h-48 cursor-crosshair'}}
            />
          </div>

          {/* Bouton GPS */}
          <button 
            onClick={getCoordinates}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
              gpsStatus === 'success' 
              ? 'bg-green-100 text-green-700 border-2 border-green-200' 
              : 'bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-100'
            }`}
          >
            {gpsStatus === 'fetching' ? (
              <span className="animate-pulse">Localisation en cours...</span>
            ) : gpsStatus === 'success' ? (
              <><CheckCircle2 className="w-5 h-5" /> Localisation OK</>
            ) : (
              <><Navigation className="w-5 h-5" /> Activer le GPS</>
            )}
          </button>

          {location && (
            <div className="text-center">
              <p className="text-[10px] font-mono text-slate-400">
                Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}
              </p>
              <a 
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                className="text-[10px] text-blue-500 font-bold underline flex items-center justify-center gap-1 mt-1"
              >
                <Map className="w-3 h-3" /> Voir sur la carte
              </a>
            </div>
          )}
        </div>

        {/* Validation Finale */}
        <button 
          onClick={handleValidation}
          disabled={loading || gpsStatus !== 'success'}
          className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
            loading || gpsStatus !== 'success' 
            ? 'bg-slate-300 text-white cursor-not-allowed' 
            : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-orange-200'
          }`}
        >
          {loading ? "Enregistrement..." : "SIGNER & DÉBLOQUER"}
          <ChevronRight className="w-6 h-6" />
        </button>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Heure du pointage : {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default AttendanceWall;