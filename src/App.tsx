import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import TabBar from './components/TabBar';
import CalendarTab from './pages/Tab1_Calendar';
import SettlementTab from './pages/Tab2_Settlement';
import SettingsTab from './pages/Tab3_Settings';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return <CalendarTab />;
      case 1:
        return <SettlementTab />;
      case 2:
        return <SettingsTab />;
      default:
        return <CalendarTab />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {renderTab()}
        </div>

        {/* 하단 탭 바 */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
