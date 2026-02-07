'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [matricule, setMatricule] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('matricule', matricule.toUpperCase())
      .single();

    if (data) {
      onLoginSuccess(data);
    } else {
      alert("Matricule inconnu. Vérifiez l'orthographe (ex: LOIC2026)");
    }
  };

  return (
    <div className="bg-btp-card backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-sm">
      <h2 className="text-2xl font-black mb-6 text-center tracking-tight">CONNEXION</h2>
      <input 
        type="text" 
        placeholder="VOTRE MATRICULE" 
        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl mb-6 text-center font-bold tracking-widest focus:border-btp-cyan outline-none transition-all"
        value={matricule}
        onChange={(e) => setMatricule(e.target.value)}
      />
      <button 
        onClick={handleLogin}
        className="w-full bg-gradient-to-r from-btp-cyan to-blue-600 py-4 rounded-xl font-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
      >
        ACCÉDER AU DASHBOARD
      </button>
    </div>
  );
}