'use client'
import { useState } from 'react';
import { Package, Plus, Minus, AlertTriangle, ShoppingCart, Search } from 'lucide-react';

interface InventoryProps {
  project: any;
  inventory: any[];
  onUpdateItem: (id: string, delta: number) => void;
  onReportNeed: (text: string) => void;
  isAdmin: boolean;
}

export default function Inventory({ project, inventory, onUpdateItem, onReportNeed, isAdmin }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = inventory.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-btp-card/30 rounded-[2rem] border border-white/5 backdrop-blur-xl p-6 shadow-2xl">
      {/* Header du Module */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-btp-cyan/10 rounded-xl text-btp-cyan">
            <Package size={20} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Logistique & Stocks</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">
          {inventory.length} Articles
        </span>
      </div>

      {/* Barre de Recherche Rapide */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
        <input 
          type="text" 
          placeholder="RECHERCHER MATÉRIEL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-btp-cyan/50 transition-colors"
        />
      </div>

      {/* Liste des Articles */}
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 mb-6">
        {filteredItems.map((item) => {
          const isLow = item.quantity_current <= item.threshold_alert;
          
          return (
            <div key={item.id} className="group bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-black text-gray-100 uppercase tracking-tight mb-1">{item.item_name}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Seuil critique : {item.threshold_alert}</p>
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 text-btp-pink animate-pulse">
                    <AlertTriangle size={12} />
                    <span className="text-[8px] font-black uppercase tracking-tighter italic">Réappro. urgent</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {/* Jauge visuelle */}
                <div className="flex-1 mr-4">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isLow ? 'bg-btp-pink shadow-[0_0_10px_#ff007a]' : 'bg-btp-cyan shadow-[0_0_10px_#00f2ff]'}`}
                      style={{ width: `${Math.min(100, (item.quantity_current / item.quantity_initial) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Contrôles de Quantité (Admin uniquement) */}
                <div className="flex items-center gap-3 bg-btp-dark/50 rounded-xl p-1 border border-white/5">
                  <button 
                    onClick={() => onUpdateItem(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-btp-pink/20 hover:text-btp-pink text-gray-500 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={`text-sm font-black w-6 text-center ${isLow ? 'text-btp-pink' : 'text-white'}`}>
                    {item.quantity_current}
                  </span>
                  <button 
                    onClick={() => onUpdateItem(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-btp-cyan/20 hover:text-btp-cyan text-gray-500 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton Commande Urgente */}
      <button 
        onClick={() => {
          const res = prompt("Quel matériel manque-t-il sur le chantier ?");
          if (res) onReportNeed(res);
        }}
        className="w-full group bg-gradient-to-r from-btp-pink/20 to-btp-cyan/20 border border-white/10 hover:border-btp-cyan/50 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500"
      >
        <ShoppingCart size={18} className="text-btp-cyan group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-btp-cyan transition-colors">Signaler un besoin urgent</span>
      </button>
    </div>
  );
}
