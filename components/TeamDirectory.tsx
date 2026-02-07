import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Phone, Mail, 
  Calendar, Shield, AlertCircle, CheckCircle2, 
  Clock, X, MoreVertical, Edit2, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase'; // Assure-toi que le lien est correct

// Types pour le personnel
export interface StaffMember {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  role: 'Chef de chantier' | 'Chef d\'équipe' | 'Opérateur' | 'Intérimaire' | 'Sous-traitant' | 'Altrad Autres';
  statut: 'Disponible' | 'En congé' | 'Arrêt maladie' | 'En formation';
  telephone: string;
  email?: string;
  details_statut?: string; // Pour les dates de congés/fin de contrat
}

const TeamDirectory = () => {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Nouvel employé (Formulaire)
  const [newMember, setNewMember] = useState<Partial<StaffMember>>({
    role: 'Opérateur',
    statut: 'Disponible'
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('equipe').select('*').order('nom', { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.matricule || !newMember.nom) return alert("Matricule et Nom obligatoires");

    const { error } = await supabase.from('equipe').insert([newMember]);
    if (error) {
      alert("Erreur lors de l'ajout : " + error.message);
    } else {
      setIsModalOpen(false);
      fetchTeam();
      setNewMember({ role: 'Opérateur', statut: 'Disponible' });
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-100 text-green-700 border-green-200';
      case 'En congé': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Arrêt maladie': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredMembers = members.filter(m => 
    `${m.nom} ${m.prenom} ${m.matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header & Statistiques Rapides */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            ANNUAIRE PERSONNEL
          </h1>
          <p className="text-slate-500 font-medium">Gérez votre équipe et leurs disponibilités en temps réel.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          AJOUTER UN COLLABORATEUR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><UserCheck className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Disponibles</p><p className="text-2xl font-black">{members.filter(m => m.statut === 'Disponible').length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">En Congé</p><p className="text-2xl font-black">{members.filter(m => m.statut === 'En congé').length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl"><AlertCircle className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Arrêt Maladie</p><p className="text-2xl font-black">{members.filter(m => m.statut === 'Arrêt maladie').length}</p></div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Rechercher un nom, un rôle ou un matricule..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des membres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl">
                    {member.nom[0]}{member.prenom[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{member.nom.toUpperCase()} {member.prenom}</h3>
                    <p className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block uppercase">{member.role}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical /></button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matricule (Code)</span>
                  <span className="font-mono font-bold bg-slate-800 text-white px-3 py-1 rounded-lg text-sm">{member.matricule}</span>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4" /> <span className="text-sm font-medium">{member.telephone}</span>
                </div>

                <div className={`mt-4 px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${getStatusColor(member.statut)}`}>
                  <div className={`w-2 h-2 rounded-full bg-current`}></div>
                  {member.statut}
                  {member.details_statut && <span className="text-[10px] opacity-75 ml-auto">({member.details_statut})</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ajout Collaborateur */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">NOUVEAU COLLABORATEUR</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-6 h-6 text-slate-600" /></button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Nom</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" 
                      onChange={e => setNewMember({...newMember, nom: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Prénom</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                      onChange={e => setNewMember({...newMember, prenom: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 text-blue-600">Matricule (Code de connexion)</label>
                  <input required type="text" placeholder="Ex: LOIC2026" className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-blue-700 placeholder:text-blue-300"
                    onChange={e => setNewMember({...newMember, matricule: e.target.value})} />
                  <p className="text-[10px] text-slate-400 font-bold px-1 italic italic">Ce code permettra à l'ouvrier de pointer sur le terrain.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Rôle</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                      onChange={e => setNewMember({...newMember, role: e.target.value as any})}>
                      <option>Chef de chantier</option>
                      <option>Chef d'équipe</option>
                      <option selected>Opérateur</option>
                      <option>Intérimaire</option>
                      <option>Sous-traitant</option>
                      <option>Altrad Autres</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Statut initial</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                      onChange={e => setNewMember({...newMember, statut: e.target.value as any})}>
                      <option>Disponible</option>
                      <option>En congé</option>
                      <option>Arrêt maladie</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Téléphone portable</label>
                  <input required type="tel" placeholder="06.." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    onChange={e => setNewMember({...newMember, telephone: e.target.value})} />
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4 uppercase">
                  Enregistrer dans l'équipe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDirectory;