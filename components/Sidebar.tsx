'use client'
import { LayoutDashboard, ClipboardList, HardHat, CalendarDays, Hammer, FolderOpen, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  
  const menu = [
    { name: 'Dashboard', label: 'Vue Globale', icon: <LayoutDashboard size={22} /> },
    { name: 'Taches', label: 'Tâches', icon: <ClipboardList size={22} /> },
    { name: 'Equipes', label: 'Équipes', icon: <HardHat size={22} /> }, // Icône Casque
    { name: 'Materiel', label: 'Matériel', icon: <Hammer size={22} /> },
    { name: 'Planning', label: 'Planning', icon: <CalendarDays size={22} /> },
    { name: 'Documents', label: 'Classeur', icon: <FolderOpen size={22} /> },
  ];

  return (
    <div className="w-20 h-screen bg-flat-sidebar flex flex-col items-center py-6 fixed left-0 top-0 z-50 shadow-lg">
      
      {/* LOGO ALTRAD (Lettre A stylisée) */}
      <div className="mb-12 text-white font-black text-2xl tracking-tighter">
        A.
      </div>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-6">
        {menu.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              title={item.label}
              className={`p-3 rounded-xl transition-all duration-200 relative group ${
                isActive 
                  ? 'text-white bg-white/10 shadow-lg' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-flat-salmon rounded-r-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto flex flex-col gap-6 items-center pb-4">
        <button className="text-white/60 hover:text-flat-salmon transition-colors">
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
