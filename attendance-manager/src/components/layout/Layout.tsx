import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import MeetingsPage from '@/components/meetings/MeetingsPage';
import AttendancePage from '@/components/attendance/AttendancePage';
import ProfilePage from '@/components/profile/ProfilePage';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '../profile/LoginPage';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'meetings' | 'attendance' | 'profile'
  >('dashboard');
  const { user } = useAuth();
  const isAdmin = user?.role === 'EBOARD';
  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  // Render 404 page if user is not authenticated
  // if (!user) {
  //   return (
  //     <div className='flex-1 p-6 bg-gray-50 min-h-screen'>
  //       <div className='mb-6'>
  //         <h1 className='text-2xl font-bold text-gray-900 mb-2'>
  //           Page Not Found
  //         </h1>
  //         <p className='text-gray-600'>
  //           You must be authenticated to access this page.
  //         </p>
  //       </div>
  //       <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
  //         <div className='text-center py-12'>
  //           <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
  //             <svg
  //               className='w-8 h-8 text-red-600'
  //               fill='none'
  //               stroke='currentColor'
  //               viewBox='0 0 24 24'
  //             >
  //               <path
  //                 strokeLinecap='round'
  //                 strokeLinejoin='round'
  //                 strokeWidth={2}
  //                 d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
  //               />
  //             </svg>
  //           </div>
  //           <h2 className='text-xl font-semibold text-gray-900 mb-2'>
  //             Authentication Required
  //           </h2>
  //           <p className='text-gray-600 mb-6'>
  //             Please log in to access this page.
  //           </p>
  //           <a
  //             href='/login'
  //             className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
  //           >
  //             Go to Login
  //           </a>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'meetings':
        return <MeetingsPage />;
      case 'attendance':
        // Check if user is admin
        if (isAdmin) {
          return <AttendancePage />;
        } else {
          return (
            <div className='flex-1 p-6 bg-gray-50 min-h-screen'>
              <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                  Access Denied
                </h1>
                <p className='text-gray-600'>
                  You need admin privileges to access the attendance page.
                </p>
              </div>
              <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg
                      className='w-8 h-8 text-red-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                  </div>
                  <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                    Admin Access Required
                  </h2>
                  <p className='text-gray-600'>
                    Only administrators can view attendance records and manage
                    members.
                  </p>
                </div>
              </div>
            </div>
          );
        }
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  return !user ? (
      <LoginPage />
    ) : (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <Header onProfileClick={handleProfileClick} />
      <div className='flex flex-1'>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className='flex-1'>{renderContent()}</main>
      </div>
    </div>
  );
};

export default Layout;
