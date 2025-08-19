import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "../dashboard/Dashboard";

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "meetings" | "attendance"
  >("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "meetings":
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Meetings
              </h1>
              <p className="text-gray-600">
                Manage and schedule your meetings.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#C8102E] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#C8102E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Meetings Management
                </h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          </div>
        );
      case "attendance":
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Attendance
              </h1>
              <p className="text-gray-600">
                Track attendance for your meetings.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#A4804A] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-[#A4804A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Attendance Tracking
                </h2>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Layout;
