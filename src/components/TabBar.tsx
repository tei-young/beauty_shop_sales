import { Calendar, DollarSign, Settings } from 'lucide-react';

interface TabBarProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 0, name: '캘린더', icon: Calendar },
    { id: 1, name: '결산', icon: DollarSign },
    { id: 2, name: '설정', icon: Settings },
  ];

  return (
    <div className="bg-card border-t border-divider safe-area-inset-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-4
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-textSecondary'}
              `}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
