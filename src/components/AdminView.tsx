/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, ShieldAlert, ShieldCheck, UserCog, Trash2, Check } from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminViewProps {
  users: User[];
  currentUser: User | null;
  onUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export default function AdminView({
  users,
  currentUser,
  onUpdateUserRole,
  onDeleteUser
}: AdminViewProps) {
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingUserId(userId);
    try {
      await onUpdateUserRole(userId, role);
    } catch (err) {
      alert('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteClick = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (confirm('Are you absolutely sure you want to delete this user profile? They will immediately lose access to the PROFLOW workspace.')) {
      try {
        await onDeleteUser(userId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Deletion failed');
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* View Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
          Team Workspace Administration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage system users, authorize permissions, assign organizational roles, and audit workspace seats.
        </p>
      </div>

      {/* Info Notice Box */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 p-4 rounded-2xl flex items-start gap-3.5">
        <ShieldCheck className="h-5.5 w-5.5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          <p className="text-slate-800 dark:text-slate-200 font-bold mb-0.5">
            Role Authorization Policy
          </p>
          <p className="leading-relaxed font-normal">
            Admins have complete control over permissions. Project Managers can create boards, tasks, assign members, and generate statistics reports. Team Members can view assigned items and upload deliverables.
          </p>
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Team Member</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Workspace Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold text-slate-700 dark:text-slate-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                  {/* Name & Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs font-bold font-display flex items-center justify-center shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block">
                          {user.name}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5 inline-block">
                            Logged In
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {user.email}
                  </td>

                  {/* Role Dropdown */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        disabled={user.id === currentUser?.id || updatingUserId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none disabled:opacity-50 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                      {updatingUserId === user.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDeleteClick(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
