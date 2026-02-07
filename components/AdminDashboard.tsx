import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Activity, AlertCircle, 
  Map as MapIcon, ShoppingCart, Users, HardHat,
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalStaff: 0,
    urgentOrders: 0,
    globalProgress: 0
  });

  const [recentPointages, setRecentPointages] = useState([]);

  useEffect(() => {
    // Simulation de récupération de données consolidées
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Logique de récupération Supabase pour les KPIs
    // On récupère le nombre de chantiers, les commandes statut 'A commander', etc.
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Console de Supervision
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> 
            Données synchronisées en temps réel — Altrad PREZIOSO
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-slate-700 uppercase">Système Live</span>
        </div>
      </div>

      {/* RANGÉE 1 : LES CARTES DE PERFORMANCE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-blue-50 p-8 rounded-full group-hover:bg-blue-100 transition-colors">
            <HardHat className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Chantiers Actifs</p>
          <h3 className="text-4xl font-black text-slate-900">12</h3>
          <div className="mt-4 flex items-center gap-1 text-green-600 font-bold text-xs">
            <ArrowUpRight className="w-4 h-4" /> +2 cette semaine
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-orange-50 p-8 rounded-full group-hover:bg-orange-100 transition-colors">
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Avancement Global</p>
          <h3 className="text-4xl font-black text-slate-900">68%</h3>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[68%]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-red-50 p-8 rounded-full group-hover:bg-red-100 transition-colors">
            <ShoppingCart className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Besoins Urgents</p>
          <h3 className="text-4xl font-black text-red-600">4</h3>
          <div className="mt-4 flex items-center gap-1 text-red-500 font-bold text-xs animate-pulse">
            <AlertCircle className="w-4 h-4" /> Action requise immédiate
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-slate-900 p-8 rounded-full">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Effectif Terrain</p>
          <h3 className="text-4xl font-black text-slate-900">34</h3>
          <p className="mt-4 text-[10px] font-bold text-slate-400">Total : 42 agents enregistrés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : DERNIERS MOUVEMENTS GPS */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <MapIcon className="text-blue-500" /> TRACABILITÉ GÉOGRAPHIQUE
            </h3>
            <button className="text-xs font-black text-blue-600 uppercase border-b-2 border-blue-600">Voir la carte complète</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-blue-600">
                  <MapPin />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-black text-slate-800 uppercase">Farid Messal</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Il y a 12 min</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Chantier : Raffinerie Total A411</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">
                  Arrivée OK
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : ALERTES & COMMANDES */}
        <div className="bg-slate-900 rounded-[3rem] p-8 shadow-xl text-white">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <ShoppingCart className="text-orange-400" /> LOGISTIQUE URGENTE
          </h3>
          
          <div className="space-y-6">
            <div className="p-5 bg-white/10 rounded-[2rem] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <p className="text-[10px] font-black text-orange-400 uppercase mb-2">Chantier Airbus S4</p>
              <p className="font-bold text-sm mb-3">5 rouleaux de scotch de masquage HP</p>
              <button className="w-full py-2 bg-orange-500 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 transition-colors">
                Marquer comme commandé
              </button>
            </div>

            <div className="p-5 bg-white/10 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Chantier Port Autonome</p>
              <p className="font-bold text-sm mb-3">Location Nacelle 12m (Fin prévue demain)</p>
              <button className="w-full py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-colors">
                Prolonger / Clôturer
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-orange-500/20 rounded-[2rem] border border-orange-500/30 flex items-center gap-4">
            <AlertCircle className="text-orange-400 w-8 h-8" />
            <p className="text-xs font-medium leading-relaxed">
              <span className="font-black block uppercase">Rappel Facturation</span>
              N'oubliez pas de valider les heures de la semaine avant vendredi 16h.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;