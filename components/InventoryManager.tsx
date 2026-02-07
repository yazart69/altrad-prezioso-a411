import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingCart, Minus, Plus, AlertTriangle, 
  Truck, CheckCircle, ClipboardList, History, Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StockItem {
  id: string;
  label: string;
  quantite_initiale: number;
  quantite_actuelle: number;
  unite: string; // sacs, litres, m², etc.
  seuil_alerte: number;
}

interface BesoinUrgent {
  id: string;
  article: string;
  auteur: string;
  statut: 'A commander' | 'Commandé' | 'Livré';
}

const InventoryManager = ({ project, user }: { project: any, user: any }) => {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [besoins, setBesoins] = useState<BesoinUrgent[]>([]);
  const [newBesoin, setNewBesoin] = useState("");

  useEffect(() => {
    fetchStock();
  }, [project.id]);

  const fetchStock = async () => {
    // Récupération du stock lié au chantier
    const { data } = await supabase.from('stock_chantier').select('*').eq('chantier_id', project.id);
    if (data) setInventory(data);
    
    // Récupération des besoins urgents
    const { data: bData } = await supabase.from('besoins_urgents').select('*').eq('chantier_id', project.id);
    if (bData) setBesoins(bData);
  };

  const updateQuantity = async (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(0, item.quantite_actuelle + delta);
    setInventory(inventory.map(i => i.id === itemId ? { ...i, quantite_actuelle: newQty } : i));

    await supabase.from('stock_chantier').update({ quantite_actuelle: newQty }).eq('id', itemId);
  };

  const addBesoin = async () => {
    if (!newBesoin) return;
    const { data, error } = await supabase.from('besoins_urgents').insert([{
      chantier_id: project.id,
      article: newBesoin,
      auteur: user.nom,
      statut: 'A commander'
    }]);
    if (!error) {
      setNewBesoin("");
      fetchStock();
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* 1. STOCK CONSOMMABLE */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Package className="text-blue-600" /> SUIVI CONSOMMABLES
        </h3>

        <div className="space-y-4">
          {inventory.map(item => (
            <div key={item.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
              item.quantite_actuelle <= item.seuil_alerte ? 'border-red-100 bg-red-50' : 'border-slate-50 bg-slate-50'
            }`}>
              <div>
                <p className="font-black text-slate-800 uppercase text-sm">{item.label}</p>
                <p className="text-[10px] font-bold text-slate-400">RESTANT : {item.quantite_actuelle} {item.unite}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className={`w-12 text-center font-black text-xl ${item.quantite_actuelle <= item.seuil_alerte ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.quantite_actuelle}
                </span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. BESOINS URGENTS (Bouton Commander) */}
      <div className="bg-orange-500 text-white rounded-[2rem] p-6 shadow-xl shadow-orange-200">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <ShoppingCart className="text-white" /> BESOINS URGENTS
        </h3>
        
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Ex: 2 rouleaux scotch bleu..." 
            className="flex-1 px-4 py-4 rounded-2xl bg-white/20 border-none placeholder:text-white/60 text-white font-bold focus:ring-2 focus:ring-white outline-none"
            value={newBesoin}
            onChange={(e) => setNewBesoin(e.target.value)}
          />
          <button 
            onClick={addBesoin}
            className="bg-white text-orange-600 px-6 rounded-2xl font-black hover:bg-slate-100 transition-colors"
          >
            COMMANDER
          </button>
        </div>

        {/* Liste des commandes en cours */}
        <div className="space-y-2">
          {besoins.map(b => (
            <div key={b.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${b.statut === 'Commandé' ? 'bg-blue-300' : 'bg-white animate-pulse'}`}></div>
              <span className="text-xs font-bold flex-1">{b.article}</span>
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded-md">{b.statut}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ALERTE ADMIN (Badge Rouge pour l'accueil) */}
      {besoins.some(b => b.statut === 'A commander') && (
        <div className="flex items-center gap-3 p-4 bg-red-100 text-red-700 rounded-2xl border-2 border-red-200 animate-bounce">
          <AlertTriangle />
          <p className="text-xs font-black uppercase">Attention : Commande urgente en attente !</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;