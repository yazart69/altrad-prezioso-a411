import React, { useState, useEffect } from 'react';
import { 
  HardHat, Plus, Search, MapPin, Calendar, 
  Clock, Shield, FileText, Phone, Users,
  ArrowRight, AlertTriangle, Lock, Unlock,
  Briefcase, DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StaffMember } from './TeamDirectory'; // On importe le type de l'étape 1

interface Project {
  id: string;
  nom: string;
  adresse: string;
  client: string;
  responsable_id: string; // ID lié à la table équipe
  operateurs_ids: string[]; // Liste d'IDs de l'équipe
  budget_heures: number;
  date_debut: string;
  statut: 'En attente' | 'Démarré' | 'Terminé';
  classeur_digital: string[]; // URLs des documents
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Formulaire nouveau projet
  const [newProject, setNewProject] = useState<Partial<Project>>({
    statut: 'En attente',
    operateurs_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: teamData } = await supabase.from('equipe').select('*');
    const { data: projectsData } = await supabase.from('chantiers').select('*');
    if (teamData) setTeam(teamData);
    if (projectsData) setProjects(projectsData);
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('chantiers').insert([newProject]);
    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <HardHat className="w-8 h-8 text-orange-500" />
            GESTION DES CHANTIERS
          </h1>
          <p className="text-slate-500 font-medium italic">"Sécurité, Qualité, Performance"</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-600 transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" />
          OUVRIR UN CHANTIER
        </button>
      </div>

      {/* Liste des Chantiers (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 shadow-sm hover:border-orange-200 transition-all group relative overflow-hidden">
            {/* Badge Statut */}
            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest ${
              project.statut === 'Démarré' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {project.statut}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">{project.nom}</h3>
                <p className="text-sm text-slate-400 font-bold flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {project.adresse}
                </p>
              </div>

              {/* Infos Responsable */}
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-600">
                  {team.find(t => t.id === project.responsable_id)?.nom[0] || '?'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Responsable</p>
                  <p className="font-bold text-slate-700 text-sm">
                    {team.find(t => t.id === project.responsable_id)?.nom || "Non assigné"}
                  </p>
                </div>
                <a href={`tel:${team.find(t => t.id === project.responsable_id)?.telephone}`} className="ml-auto p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-orange-500">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Indicateurs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-[10px] font-black text-blue-400 uppercase">Budget H</p>
                  <p className="text-lg font-black text-blue-700">{project.budget_heures}h</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center">
                  <p className="text-[10px] font-black text-orange-400 uppercase">Équipe</p>
                  <p className="text-lg font-black text-orange-700">{project.operateurs_ids?.length || 0} Gars</p>
                </div>
              </div>

              {/* Bouton d'accès avec Mur de Sécurité */}
              <button className="w-full py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all">
                <Lock className="w-4 h-4" />
                ACCÉDER AU DOSSIER (POINTAGE REQUIS)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Création Chantier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Plus className="p-2 bg-orange-100 text-orange-600 rounded-xl" />
              NOUVEAU CHANTIER
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Nom du Chantier</label>
                  <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold"
                    onChange={e => setNewProject({...newProject, nom: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Client</label>
                  <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold"
                    onChange={e => setNewProject({...newProject, client: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Adresse Exacte</label>
                <input required type="text" placeholder="Lieu d'intervention" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold"
                  onChange={e => setNewProject({...newProject, adresse: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase text-orange-600">Responsable (Chef)</label>
                  <select required className="w-full px-5 py-4 bg-orange-50 border-none rounded-2xl font-bold text-orange-800"
                    onChange={e => setNewProject({...newProject, responsable_id: e.target.value})}>
                    <option value="">-- Choisir un chef --</option>
                    {team.filter(t => t.role.includes('Chef')).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nom} {t.prenom} {t.statut !== 'Disponible' ? `(⚠️ ${t.statut})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Budget Heures Prévu</label>
                  <input required type="number" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold"
                    onChange={e => setNewProject({...newProject, budget_heures: Number(e.target.value)})} />
                </div>
              </div>

              {/* Liste multi-sélection Opérateurs */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Affectation des Opérateurs</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl">
                  {team.map(t => (
                    <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      newProject.operateurs_ids?.includes(t.id) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100'
                    }`}>
                      <input type="checkbox" className="hidden" 
                        onChange={(e) => {
                          const current = newProject.operateurs_ids || [];
                          const updated = e.target.checked ? [...current, t.id] : current.filter(id => id !== t.id);
                          setNewProject({...newProject, operateurs_ids: updated});
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-black">{t.nom}</span>
                        <span className="text-[10px] font-bold opacity-70">{t.role}</span>
                      </div>
                      {t.statut !== 'Disponible' && <AlertTriangle className="w-3 h-3 text-red-500 ml-auto" />}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all mt-4">
                VALIDER L'OUVERTURE DU CHANTIER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;