import axiosClient from '@/utils/axiosClient';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Ensure you have installed this component

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosClient.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // handle delete users - Logic only, confirmation moved to UI
  const handleDelete = async (userId) => {
    try {
      await axiosClient.delete(`/admin/delete/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
        <button className="bg-[#4ADE80] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#3ec46d] flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase font-semibold border-b border-white/5">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Solved</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-[#1A1A1A]/50 transition-colors duration-200">
                  {/* User Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Placeholder with Gradient */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {user.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.emailId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize
                        ${user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }
                      `}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Joined Date Column */}
                  <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Solved Count Column */}
                  <td className="px-6 py-4 font-medium text-white">
                    {user.problemSolved?.length || 0}
                  </td>

                  {/* Actions Column with Shadcn Alert Dialog */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Trash2 size={"18px"} className='text-red-400' />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1A1A1A] border border-white/10 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              This action cannot be undone. This will permanently delete the user account
                              <span className="font-bold text-white mx-1">
                                {user.firstName} {user.lastName}
                              </span>
                              and remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white transition-colors">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user._id)}
                              className="bg-red-500 text-white hover:bg-red-600 border-none"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;