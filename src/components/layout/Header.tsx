import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks';
import { translations } from '@/lib/constants/translations';
import { useLayoutStore } from '@/stores/layoutStore';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const { toggleSidebar } = useLayoutStore();
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 mr-4">موزه رشت</h1>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <Bell size={20} />
            </button>
            
            <div className="relative">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">
                    admin
                  </span>
                  <button 
                    onClick={() => logout()}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {translations.common.signOut}
                  </button>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;