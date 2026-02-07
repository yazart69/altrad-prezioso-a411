import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, HardHat, Users, Calendar, 
  Package, Settings, LogOut, Menu, Bell, User
} from 'lucide-react';

// Importation de nos modules créés précédemment
import AdminDashboard from './components/AdminDashboard';
import ProjectManagement from './components/ProjectManagement';
import TeamDirectory from './components/TeamDirectory';
import InventoryManager from './components/InventoryManager';
import AttendanceWall from './components/AttendanceWall';
import ProjectFieldView from './components/ProjectFieldView';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null); // Utilisateur connecté
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false); // État du mur de pointage

  // --- LOGIQUE DE CONNEXION PAR MATRICULE ---
  const handleLogin = (matricule: string) => {
    // En production, vérification dans Supabase
    if (matricule === 'ADMIN') {
      setUser({ nom: 'Yasar', prenom: 'Ertugrul', role: 'Admin' });
      setIsAdmin(true);
      setActiveTab('dashboard');
    } else {
      // Simulation pour un opérateur
      setUser({ nom: 'Messal', prenom: 'Farid', role: 'Opérateur', matricule });
      setIsAdmin(false);
      setActiveTab('projects');
    }
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR LATÉRALE (Fidèle à la photo) */}
      <aside className="w-20 lg:w-72 bg-slate-900 h-full flex flex-col p-4 transition-all border-r border-white/5">
        <div className="flex items-center gap-3 px-2 mb-12 mt-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">A</div>
          <span className="hidden lg:block text-white font-black text-xl tracking-tighter">ALTRAD <span className="text-orange-500">A411</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {isAdmin && (
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Tableau de bord" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
          )}
          <NavItem 
            icon={<HardHat />} 
            label="Chantiers" 
            active={activeTab === 'projects'} 
            onClick={() => { setActiveTab('projects'); setIsUnlocked(false); }} 
          />
          {isAdmin && (
            <NavItem 
              icon={<Users />} 
              label="Équipe" 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')} 
            />
          )}
          <NavItem 
            icon={<Package />} 
            label="Matériel" 
            active={activeTab === 'stock'} 
            onClick={() => setActiveTab('stock')} 
          />
        </nav>

        <div className="mt-auto p-2 bg-white/5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-orange-400 font-bold">
            {user.prenom[0]}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-white text-xs font-black truncate uppercase">{user.nom}</p>
            <p className="text-slate-500 text-[10px] font-bold">{user.role}</p>
          </div>
          <button onClick={() => setUser(null)} className="hidden lg:block ml-auto text-slate-500 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Barre du haut */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
           <h2 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em]">
            Section / {activeTab}
           </h2>
           <div className="flex items-center gap-4">
              <button className="p-2 bg-slate-50 rounded-xl text-slate-400 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        {/* Vues dynamiques */}
        <div className="flex-1">
          {activeTab === 'dashboard' && <AdminDashboard />}
          
          {activeTab === 'projects' && !selectedProject && (
            <ProjectManagement onSelectProject={(p) => setSelectedProject(p)} />
          )}

          {activeTab === 'projects' && selectedProject && !isUnlocked && !isAdmin && (
            <AttendanceWall 
              project={selectedProject} 
              user={user} 
              onUnlocked={() => setIsUnlocked(true)} 
            />
          )}

          {activeTab === 'projects' && selectedProject && (isUnlocked || isAdmin) && (
            <ProjectFieldView project={selectedProject} user={user} />
          )}

          {activeTab === 'team' && <TeamDirectory />}
          
          {activeTab === 'stock' && <InventoryManager project={selectedProject} user={user} />}
        </div>
      </main>
    </div>
  );
};

// Composants internes utilitaires
const NavItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
      active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { size: 22 })}
    <span className="hidden lg:block font-black text-sm uppercase tracking-wider">{label}</span>
  </button>
);

const LoginView = ({ onLogin }: any) => {
  const [val, setVal] = useState("");
  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl text-center space-y-8">
        <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center text-4xl font-black text-white">A</div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">CONNEXION</h1>
          <p className="text-slate-500 font-bold">Entrez votre matricule personnel</p>
        </div>
        <input 
          type="text" 
          placeholder="EX: ALTRAD2026"
          className="w-full py-5 bg-slate-100 border-none rounded-2xl text-center font-black text-2xl tracking-widest text-slate-800 focus:ring-4 focus:ring-orange-200 outline-none"
          value={val}
          onChange={(e) => setVal(e.target.value.toUpperCase())}
        />
        <button 
          onClick={() => onLogin(val)}
          className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all"
        >
          ACCÉDER AU SYSTÈME
        </button>
      </div>
    </div>
  );
};

export default App;