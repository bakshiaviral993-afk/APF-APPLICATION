import React from 'react';
import { useAPF } from '../../context/APFContext';
import { ScreenId } from '../../types/apf';

interface NavItem {
  id: string;
  label: string;
  targetScreen: ScreenId;
  relatedScreens?: ScreenId[];
}

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useAPF();

  const navItems: NavItem[] = [
    {
      id: 'control-tower',
      label: 'Control Tower',
      targetScreen: '01',
      relatedScreens: ['01', '02'],
    },
    {
      id: 'transaction-flow',
      label: 'Transaction Flow',
      targetScreen: 'flow',
      relatedScreens: ['flow'],
    },
    {
      id: 'builders',
      label: 'Builders',
      targetScreen: '03',
      relatedScreens: ['03', '04', '05', '09', '10'],
    },
    {
      id: 'projects',
      label: 'Projects',
      targetScreen: '12',
      relatedScreens: ['11', '12', '13', '14', '16'],
    },
    {
      id: 'exposure',
      label: 'Exposure',
      targetScreen: '07',
      relatedScreens: ['06', '07', '08', '15', '23'],
    },
    {
      id: 'due-diligence',
      label: 'Due Diligence',
      targetScreen: '18',
      relatedScreens: ['17', '18', '19', '20', '21', '22'],
    },
    {
      id: 'risk-ai',
      label: 'Risk & AI',
      targetScreen: '25',
      relatedScreens: ['24', '25'],
    },
    {
      id: 'committee',
      label: 'Committee',
      targetScreen: '26',
      relatedScreens: ['26', '27'],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      targetScreen: '28',
      relatedScreens: ['28', '29'],
    },
    {
      id: 'admin',
      label: 'Admin',
      targetScreen: '30',
      relatedScreens: ['30'],
    },
  ];

  const isItemActive = (item: NavItem) => {
    if (item.targetScreen === currentScreen) return true;
    if (item.relatedScreens && item.relatedScreens.includes(currentScreen)) return true;
    return false;
  };

  return (
    <aside className="w-56 bg-[#0c3148] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-[#092638] select-none">
      {/* Top Branding matching images */}
      <div className="px-6 pt-7 pb-8">
        <h1 className="text-xl font-bold tracking-tight text-white leading-none">PROVAL</h1>
        <p className="text-xs text-[#8bb3cb] font-medium tracking-wide mt-1.5">APF Intelligence</p>
      </div>

      {/* Navigation list matching images */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.targetScreen)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-between ${
                active
                  ? 'bg-[#1a4a66] text-white font-medium shadow-sm'
                  : 'text-[#9dbacb] hover:text-white hover:bg-[#133d59] font-normal'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Subtle footer */}
      <div className="p-4 border-t border-[#133d59]/60 text-[11px] text-[#7198b0]">
        <div className="flex items-center justify-between">
          <span>APF v2.4 Live</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
      </div>
    </aside>
  );
};
