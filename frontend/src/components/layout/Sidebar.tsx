import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'meetings' | 'attendance' | 'profile';
  onTabChange: (tab: 'dashboard' | 'meetings' | 'attendance' | 'profile') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.email?.includes('admin');

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      adminOnly: false,
    },
    {
      id: 'meetings' as const,
      label: 'Meetings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      adminOnly: false,
    },
    {
      id: 'attendance' as const,
      label: 'Attendance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      adminOnly: true,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              // Skip admin-only items for non-admin users
              if (item.adminOnly && !isAdmin) {
                return null;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-[#C8102E] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                  }`}
                >
                  <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {item.adminOnly && (
                    <span className="ml-auto px-2 py-1 text-xs bg-[#A4804A] text-white rounded-full">
                      Admin
                    </span>
                  )}
                  {activeTab === item.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Quick Stats - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Today's Meetings</span>
              <span className="text-sm font-semibold text-[#C8102E]">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Pending Attendance</span>
              <span className="text-sm font-semibold text-[#A4804A]">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Members</span>
              <span className="text-sm font-semibold text-[#C8102E]">24</span>
            </div>
            {isAdmin && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Admin Access</span>
                <span className="text-sm font-semibold text-[#A4804A]">✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 