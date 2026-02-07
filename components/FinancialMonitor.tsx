'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertOctagon, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FinanceProps {
  project: any;
}

export default function FinancialMonitor({ project }: FinanceProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalCost: 0,
    budgetHours: project.budget_heures || 0,
    projectedCost: 0 // Projection fin de chantier
  });

  useEffect(() => {
    calculateFinance();
  }, [project]);

  const calculateFinance = async () => {
    setLoading(true);

    // 1. Récupérer tous les pointages du projet
    const { data: attendance } = await supabase
      .from('attendance')
      .select('total_heures, user_id')
      .eq('project_id', project.id)
      .not('check_out', 'is', null); // Seulement les heures validées

    // 2. Récupérer les taux horaires des gars
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, taux_horaire');

    if (attendance && profiles) {
      let hours = 0;
      let cost = 0;

      attendance.forEach((att) => {
        const h = Number(att.total_heures) || 0;
        const userProfile = profiles.find(p => p.id === att.user_id);
        const rate = userProfile?.taux_horaire || 0; // Si pas de taux, on compte 0€

        hours += h;
        cost += (h * rate);
      });

      setStats({
        totalHours: hours,
        totalCost: cost,
        budgetHours: project.budget_heures || 0,
        projectedCost: 0 
      });
    }
    setLoading(false);
  };

  // Calcul du pourcentage d'avancement budgétaire
  const progress = stats.budgetHours > 0 ? (stats.totalHours / stats.budgetHours) * 100 : 0;
  const isOverBudget = progress > 100;

  // Données pour le graphique
  const chartData = [
    { name: 'Consommé', value: Math.round(stats.totalHours), color: isOverBudget ? '#ef4444' : '#00f2ff' },
    { name: 'Restant', value: Math.max(0, stats.budgetHours - stats.totalHours), color: '#161821' }
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header Finance */}
      <div className="flex justify-between items-center bg-btp-card/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Rentabilité Chantier</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Analyse financière temps réel</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-gray-500 font-black uppercase">Budget Vendu</p>
           <p className="text-xl font-black text-white">{stats.budgetHours} Heures</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* CARTE 1 : LA JAUGE D'HEURES (Visualisation) */}
        <div className="col-span-12 md:col-span-4 bg-btp-card/30 rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-center relative">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest absolute top-6 left-6">Consommation Heures</h3>
          
          <div className="w-64 h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            {/* Texte Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black italic ${isOverBudget ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {Math.round(progress)}%
              </span>
              <span className="text-[9px] text-gray-500 font-bold uppercase">du budget</span>
            </div>
          </div>
          
          {isOverBudget && (
             <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-xl mt-[-20px] mb-4">
               <AlertOctagon size={16} />
               <span className="text-[10px] font-black uppercase">Dépassement !</span>
             </div>
          )}
        </div>

        {/* CARTE 2 : LES CHIFFRES CLÉS (Coût Argent) */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-6">
          
          {/* Total Heures */}
          <div className="bg-btp-dark/50 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between group hover:border-btp-cyan/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Clock size={24} />
              </div>
              <span className="text-[10px] text-gray-500 font-mono">REAL TIME</span>
            </div>
            <div>
              <p className="text-4xl font-black text-white mb-1">{stats.totalHours.toFixed(1)} <span className="text-lg text-gray-600">h</span></p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Heures Travaillées</p>
            </div>
          </div>

          {/* Coût Financier (Main d'œuvre) */}
          <div className="bg-btp-dark/50 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between group hover:border-btp-amber/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-btp-amber/10 rounded-2xl text-btp-amber">
                <DollarSign size={24} />
              </div>
              <span className="text-[10px] text-gray-500 font-mono">ESTIMATION</span>
            </div>
            <div>
              <p className="text-4xl font-black text-white mb-1">{stats.totalCost.toFixed(0)} <span className="text-lg text-gray-600">€</span></p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coût Main d'Oeuvre</p>
              <p className="text-[8px] text-gray-600 mt-2 italic">*Basé sur les taux horaires configurés</p>
            </div>
          </div>

          {/* Marge Restante (Heures) */}
          <div className="col-span-2 bg-gradient-to-r from-btp-card to-btp-dark rounded-[2rem] p-8 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Marge Restante (Heures)</p>
              <div className="flex items-baseline gap-2">
                 <span className={`text-5xl font-black italic ${stats.budgetHours - stats.totalHours < 0 ? 'text-red-500' : 'text-green-500'}`}>
                   {(stats.budgetHours - stats.totalHours).toFixed(1)}
                 </span>
                 <span className="text-xl font-bold text-gray-600">h</span>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${stats.budgetHours - stats.totalHours < 0 ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
               {stats.budgetHours - stats.totalHours < 0 ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
