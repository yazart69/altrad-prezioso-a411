'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const efficiencyData = [
  { name: 'A', value: 75, color: '#22D3EE' },
  { name: 'B', value: 44, color: '#F472B6' },
  { name: 'C', value: 68, color: '#FBBF24' },
  { name: 'D', value: 55, color: '#A855F7' },
];

export default function RightPanel({ user }: { user: any }) {
  return (
    <aside className="w-80 border-l border-white/5 p-6 flex flex-col gap-8 bg-btp-card/20 backdrop-blur-md">
      {/* Profil Utilisateur */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-btp-cyan to-purple-500 p-0.5">
          <div className="w-full h-full rounded-full bg-btp-dark flex items-center justify-center font-bold">
            {user?.nom?.charAt(0)}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm leading-none">{user?.nom}</h3>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{user?.role}</p>
        </div>
      </div>

      {/* Completed Tasks (Barres de ton image) */}
      <div>
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Completed Tasks</h4>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={efficiencyData}>
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {efficiencyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency (Jauges circulaires) */}
      <div>
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Efficiency</h4>
        <div className="grid grid-cols-2 gap-4">
          {efficiencyData.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
               <div className="relative w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{v: item.value}, {v: 100 - item.value}]} innerRadius={20} outerRadius={28} dataKey="v" startAngle={90} endAngle={450}>
                        <Cell fill={item.color} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{item.value}%</span>
               </div>
               <span className="text-[9px] text-gray-500 mt-1">Author {item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}