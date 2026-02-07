'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Login from '@/components/Auth';
import Sidebar from '@/components/Sidebar'; // Assurez-vous que Sidebar est bien dans components/
import { 
  Users, 
  Clock, 
  Package, 
  CheckSquare, 
  AlertCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({
    present: 0,
    heures: 0,
    materiel: 0,
    tasksTodo: 0,
    tasksDone: 0
  });

  // Chargement des données simplifié et robuste
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      // 1. Tâches
      const { data: t } = await supabase.from('tasks').select('*');
      // 2. Pointages
      const { data: a } = await supabase.from('attendance').select('*');
      // 3. Matériel
      const { data: i } = await supabase.from('inventory').select('*');

      if (t && a && i) {
        const today = new Date().toISOString().split('T')[0];
        setStats({
          present: a.filter(x => x.check_in.startsWith(today) && !x.check_out).length,
          heures: Math.round(a.reduce((acc, curr) => acc + (curr.total_heures || 0), 0)),
          materiel: i.length,
          tasksTodo: t.filter(x => x.status !== 'done').length,
          tasksDone: t.filter(x => x.status === 'done').length
        });
      }
    };
    loadData();
  }, [user]);

  if (!user) return (
    <div className="h-screen w-full flex items-center justify-center bg-flat-bg">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-flat-sidebar">Connexion Chantier</h2>
        <Login onLoginSuccess={setUser} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-flat-bg overflow-hidden font-sans">
      
      {/* 1. BARRE LATÉRALE (FIXE) */}
      <div className="flex-none z-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      </div>

      {/* 2. CONTENU PRINCIPAL (DÉFILANT) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden ml-20"> {/* ml-20 compense la largeur de la sidebar */}
        
        {/* HEADER */}
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm flex-none">
          <div>
            <h1 className="text-2xl font-bold text-flat-sidebar">Tableau de Bord</h1>
            <p className="text-sm text-gray-500">Chantier A411 • Vue d'ensemble</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">{user.nom}</p>
              <p className="text-xs text-green-500 font-bold bg-green-100 px-2 py-0.5 rounded-full inline-block">EN LIGNE</p>
            </div>
            <div className="h-10 w-10 bg-flat-sidebar rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user.nom.charAt(0)}
            </div>
          </div>
        </header>

        {/* CONTENU SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* CARTE 1: EFFECTIF (Saumon) */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-flat-primary flex items-center justify-between hover:shadow-lg transition-shadow">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Effectif Présent</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.present}</p>
              </div>
              <div className="p-3 bg-flat-primary/10 rounded-xl text-flat-primary">
                <Users size={24} />
              </div>
            </div>

            {/* CARTE 2: HEURES (Bleu) */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-flat-accent flex items-center justify-between hover:shadow-lg transition-shadow">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Heures Cumulées</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.heures}h</p>
              </div>
              <div className="p-3 bg-flat-accent/10 rounded-xl text-flat-accent">
                <Clock size={24} />
              </div>
            </div>

            {/* CARTE 3: MATERIEL (Jaune) */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-flat-warning flex items-center justify-between hover:shadow-lg transition-shadow">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Matériel Sorti</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.materiel}</p>
              </div>
              <div className="p-3 bg-flat-warning/10 rounded-xl text-flat-warning">
                <Package size={24} />
              </div>
            </div>

            {/* CARTE 4: AVANCEMENT (Vert Menthe) */}
            <div className="bg-white rounded-2xl p-6 shadow-card border-l-4 border-flat-secondary flex items-center justify-between hover:shadow-lg transition-shadow">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tâches Finies</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.tasksDone}</p>
              </div>
              <div className="p-3 bg-flat-secondary/10 rounded-xl text-flat-secondary">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>

          {/* SECTION CENTRALE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* GRAPHIQUE / ACTIVITÉ (Prend 2 colonnes) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 h-96 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <TrendingUp size={20} className="text-flat-primary" />
                  Productivité Chantier
                </h3>
              </div>
              {/* Zone Graphique Fictive Propre */}
              <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-flat-primary/20 to-transparent"></div>
                 <p className="text-gray-400 font-medium z-10">Graphique d'activité hebdomadaire</p>
                 {/* Courbe SVG Simple */}
                 <svg className="absolute bottom-0 left-0 w-full h-2/3" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path d="M0 50 L10 40 L30 45 L50 20 L70 30 L100 10 V50 H0 Z" fill="rgba(255, 118, 117, 0.2)" />
                    <path d="M0 50 L10 40 L30 45 L50 20 L70 30 L100 10" stroke="#ff7675" strokeWidth="0.5" fill="none" />
                 </svg>
              </div>
            </div>

            {/* ALERTS & INFO (Prend 1 colonne) */}
            <div className="bg-white rounded-2xl shadow-card p-6 h-96 flex flex-col">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <AlertCircle size={20} className="text-flat-warning" />
                 Alertes & Infos
               </h3>
               
               <div className="space-y-3 overflow-y-auto">
                 {/* Alerte 1 */}
                 <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                   <p className="text-xs font-bold text-red-500 uppercase">Sécurité</p>
                   <p className="text-sm text-gray-700 mt-1">Port du harnais obligatoire zone B.</p>
                 </div>
                 {/* Alerte 2 */}
                 <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                   <p className="text-xs font-bold text-blue-500 uppercase">Météo</p>
                   <p className="text-sm text-gray-700 mt-1">Vent fort prévu cet après-midi.</p>
                 </div>
                 {/* Localisation */}
                 <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <MapPin className="text-flat-sidebar" />
                    <div>
                      <p className="text-xs font-bold text-gray-500">Localisation</p>
                      <p className="text-sm font-bold text-gray-800">Tour A - La Défense</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
