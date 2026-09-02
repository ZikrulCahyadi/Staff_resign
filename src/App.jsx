import React, { useState } from 'react';
import ResignationDashboard from './pages/ResignationDashboard';
import DataManagement from './pages/DataManagement';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <DashboardLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {activeMenu === 'dashboard' ? <ResignationDashboard /> : <DataManagement />}
    </DashboardLayout>
  );
}

export default App;
