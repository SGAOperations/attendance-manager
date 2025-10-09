import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - SGA (always on far left) */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-[#C8102E] tracking-wider">
              SGA
            </div>
          </div>
          
          {/* Right side - Profile (always on far right) */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} Account</p>
              </div>
              <div className="relative">
                <button
                  onClick={onProfileClick}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                >
                  <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
