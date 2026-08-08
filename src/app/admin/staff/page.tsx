'use client';

import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Search, Clock, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { StaffRole, ROLE_PERMISSIONS } from '@/lib/auth/rbac';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface StaffUser {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'approved';
  created_at: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setStaffList(data);
    }
    setIsLoading(false);
  };

  const approveStaff = async (id: string, email: string, newRole: string) => {
    const { error } = await supabase
      .from('staff_users')
      .update({ status: 'approved', role: newRole })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve staff');
    } else {
      toast.success(`${email} approved successfully!`);
      fetchStaff();
    }
  };

  const removeStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    
    const { error } = await supabase.from('staff_users').delete().eq('id', id);
    if (error) {
      toast.error('Failed to remove staff');
    } else {
      toast.success('Staff removed');
      fetchStaff();
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('staff_users')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update role');
    } else {
      toast.success('Role updated');
      fetchStaff();
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingStaff = filteredStaff.filter(s => s.status === 'pending');
  const approvedStaff = filteredStaff.filter(s => s.status === 'approved');

  return (
    <div className="animate-fade-in-up">
      <AdminPageHeader
        title="Staff Roles & Permissions"
        icon={Shield}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Staff' }]}
        action={
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Search email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-10 py-0 bg-white/5 border border-white/10 focus:border-[#D4A373] text-white text-sm rounded-lg outline-none shadow-sm transition-all"
              />
            </div>
          </div>
        }
      />
      <p className="text-sm font-medium text-white/50 mb-8 -mt-2 md:-mt-4 relative z-10">
        Approve new staff members and manage roles for Joebrown Palace Hotels.
      </p>

      {pendingStaff.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-[#D4A373]" size={20} /> Pending Approvals
          </h2>
          <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1A0A02] border-b border-white/10">
                <tr>
                  <th className="p-4 text-xs font-bold text-white/50 uppercase">Email</th>
                  <th className="p-4 text-xs font-bold text-white/50 uppercase">Requested On</th>
                  <th className="p-4 text-xs font-bold text-white/50 uppercase">Assign Role & Approve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{staff.email}</td>
                    <td className="p-4 text-sm text-white/50">{new Date(staff.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <select 
                          className="bg-[#1A0A02] border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                          onChange={(e) => {
                            // Using dataset or direct state could be better, but inline works for simple case
                            approveStaff(staff.id, staff.email, e.target.value);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Role...</option>
                          <option value="owner">Manager / Owner</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="kitchen_staff">Kitchen Staff</option>
                          <option value="dev">Developer</option>
                        </select>
                        <button 
                          onClick={() => removeStaff(staff.id)}
                          className="p-1.5 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-400" size={20} /> Approved Staff
        </h2>
        <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A0A02] border-b border-white/10">
              <tr>
                <th className="p-4 text-xs font-bold text-white/50 uppercase">Email</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase">Joined</th>
                <th className="p-4 text-xs font-bold text-white/50 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><div className="flex justify-end"><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : approvedStaff.length === 0 ? (
                 <tr><td colSpan={4}><EmptyState icon={Shield} title="No Approved Staff" description="There are no approved staff members yet." /></td></tr>
              ) : (
                approvedStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{staff.email}</td>
                    <td className="p-4">
                      <select 
                          className="bg-transparent border-none font-bold text-[#D4A373] outline-none cursor-pointer"
                          value={staff.role}
                          onChange={(e) => changeRole(staff.id, e.target.value)}
                        >
                          <option value="owner">Manager / Owner</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="kitchen_staff">Kitchen Staff</option>
                          <option value="dev">Developer</option>
                        </select>
                    </td>
                    <td className="p-4 text-sm text-white/50">{new Date(staff.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => removeStaff(staff.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-brown-500/200/20 text-red-300 hover:bg-brown-500/200/30 rounded-lg border border-red-500/30 transition-colors"
                      >
                        Remove Access
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
