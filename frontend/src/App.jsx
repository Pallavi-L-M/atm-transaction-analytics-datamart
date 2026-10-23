import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AtmDetailDrawer from './components/AtmDetailDrawer';
import DemoGuideModal from './components/DemoGuideModal';
import SchemaModal from './components/SchemaModal';

import OverviewPage from './pages/OverviewPage';
import AtmExplorerPage from './pages/AtmExplorerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataManagementPage from './pages/DataManagementPage';
import ReportsPage from './pages/ReportsPage';

function DashboardLayout() {
  const [activePage, setActivePage] = useState('overview');
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const {
    selectedAtmId,
    setSelectedAtmId,
    analyticsSummary,
    demoGuideOpen,
    setDemoGuideOpen
  } = useData();

  // Find currently selected ATM object if any
  const selectedAtm = selectedAtmId
    ? analyticsSummary.uniqueAtmsList.find(a => a.atmId === selectedAtmId)
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <div className="no-print">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          openSchemaModal={() => setIsSchemaModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="no-print">
          <Header
            activePage={activePage}
            openSchemaModal={() => setIsSchemaModalOpen(true)}
          />
        </div>

        <main className="flex-1 pb-16">
          {activePage === 'overview' && (
            <OverviewPage onSelectAtm={(id) => setSelectedAtmId(id)} />
          )}
          {activePage === 'atm-explorer' && (
            <AtmExplorerPage />
          )}
          {activePage === 'analytics' && (
            <AnalyticsPage />
          )}
          {activePage === 'data-management' && (
            <DataManagementPage />
          )}
          {activePage === 'reports' && (
            <ReportsPage />
          )}
        </main>
      </div>

      {/* ATM Detail Slide-over Drawer */}
      {selectedAtm && (
        <AtmDetailDrawer
          atm={selectedAtm}
          onClose={() => setSelectedAtmId(null)}
        />
      )}

      {/* College Presentation 7-Step Guided Tour Modal */}
      <DemoGuideModal
        isOpen={demoGuideOpen}
        onClose={() => setDemoGuideOpen(false)}
        setActivePage={setActivePage}
      />

      {/* Star Schema Dimensional Architecture Modal */}
      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
}
