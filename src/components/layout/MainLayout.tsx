import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayoutStore } from '@/stores/layoutStore';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:mr-64' : ''}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;