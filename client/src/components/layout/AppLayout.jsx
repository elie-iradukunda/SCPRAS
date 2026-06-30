import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-concrete">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}
