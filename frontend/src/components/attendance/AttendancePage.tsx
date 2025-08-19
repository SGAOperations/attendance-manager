import React, { useState } from 'react';
import { Member, AttendanceRecord } from '../../types';

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'history'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);

  // Mock data for SGA members
  const mockMembers: Member[] = [
    {
      id: '1',
      name: 'Renee Cai',
      email: 'cai.renee@northeastern.edu',
      role: 'eboard',
      joinDate: new Date('2024, 0, 15'),
      status: 'active',
    },
    {
      id: '2',
      name: 'Justin Kim',
      email: 'kim.justin@northeastern.edu',
      role: 'eboard',
      joinDate: new Date('2024, 0, 20'),
      status: 'active',
    },
    {
      id: '3',
      name: 'Renee Cai',
      email: 'cai.renee@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 0, 25'),
      status: 'active',
    },
    {
      id: '4',
      name: 'Justin Kim',
      email: 'kim.justin@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 1, 1'),
      status: 'active',
    },
    {
      id: '5',
      name: 'Renee Cai',
      email: 'cai.renee@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 1, 5'),
      status: 'active',
    },
    {
      id: '6',
      name: 'Justin Kim',
      email: 'kim.justin@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 1, 10'),
      status: 'active',
    },
    {
      id: '7',
      name: 'Renee Cai',
      email: 'cai.renee@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 1, 15'),
      status: 'active',
    },
    {
      id: '8',
      name: 'Justin Kim',
      email: 'kim.justin@northeastern.edu',
      role: 'member',
      joinDate: new Date('2024, 1, 20'),
      status: 'active',
    },
  ];

  // Mock data for attendance history - matching meetings page data
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      meetingId: '1',
      meetingTitle: 'General Meeting',
      meetingDescription: 'First General Meeting of the semester',
      date: new Date('2025-01-07'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 35,
      attendanceRate: 83.3,
    },
    {
      id: '2',
      meetingId: '2',
      meetingTitle: 'General Meeting',
      meetingDescription: 'Second General Meeting of the semester',
      date: new Date('2025-01-14'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 38,
      attendanceRate: 90.5,
    },
    {
      id: '3',
      meetingId: '3',
      meetingTitle: 'General Meeting',
      meetingDescription: 'Third General Meeting of the semester',
      date: new Date('2025-01-21'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 32,
      attendanceRate: 76.2,
    },
    {
      id: '4',
      meetingId: '4',
      meetingTitle: 'General Meeting',
      meetingDescription: 'Fourth General Meeting of the semester',
      date: new Date('2025-01-28'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 0,
      attendanceRate: 0,
    },
    {
      id: '5',
      meetingId: '5',
      meetingTitle: 'General Meeting',
      meetingDescription: 'Fifth General Meeting of the semester',
      date: new Date('2025-02-04'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 40,
      attendanceRate: 95.2,
    },
    {
      id: '6',
      meetingId: '6',
      meetingTitle: 'General Meeting',
      meetingDescription: 'Sixth General Meeting of the semester',
      date: new Date('2025-02-11'),
      time: '6:00-7:00 PM',
      totalMembers: 42,
      attendedMembers: 37,
      attendanceRate: 88.1,
    },
  ];

  const eboardMembers = mockMembers.filter(m => m.role === 'eboard');
  const regularMembers = mockMembers.filter(m => m.role === 'member');

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Manage SGA members and track attendance history</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-[#C8102E] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            SGA Members
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-[#C8102E] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Attendance History
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        /* SGA Members Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Eboard Members */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Eboard</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {eboardMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regular Members */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Members</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {regularMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Attendance History Section */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance History</h2>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#C8102E] text-white">
                    <th className="text-left py-3 px-4 font-medium">Date/Time</th>
                    <th className="text-left py-3 px-4 font-medium">Meeting</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-center py-3 px-4 font-medium"># of Members</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAttendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{record.date.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{record.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{record.meetingTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{record.meetingDescription}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm font-medium text-gray-900">{record.attendedMembers}</div>
                        <div className="text-xs text-gray-500">of {record.totalMembers}</div>
                        <div className="text-xs text-[#C8102E] font-medium">{record.attendanceRate}%</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Buttons */}
      {activeTab === 'members' && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E] transition-colors"
          >
            + Add Member
          </button>
          <button
            onClick={() => setShowBulkAddModal(true)}
            className="px-4 py-2 bg-[#A4804A] text-white rounded-lg hover:bg-[#8A6D3F] transition-colors"
          >
            + Bulk Add Members
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Enter member email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]">
                  <option value="member">Member</option>
                  <option value="eboard">Eboard</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A8102E]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Add Members</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]">
                  <option value="member">Member</option>
                  <option value="eboard">Eboard</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                <p>CSV format: Name, Email</p>
                <p>Example: John Doe, john.doe@northeastern.edu</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#A4804A] text-white rounded-lg hover:bg-[#8A6D3F]"
                >
                  Upload & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
