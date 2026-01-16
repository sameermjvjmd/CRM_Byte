import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usersApi from '../api/usersApi'; // Updated to use the new service
import type { UserDto, CreateUserRequest } from '../types/auth'; // Updated types
import UserFormModal from '../components/users/UserFormModal';
import {
    Shield, UserPlus, ArrowLeft, Search, ShieldCheck,
    Edit2, Trash2, Power, CheckCircle
} from 'lucide-react';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDto | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: UserDto) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (user: UserDto) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.fullName}?`)) return;

        try {
            await usersApi.toggleStatus(user.id);
            // Optimistic update or refresh
            setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        } catch (error) {
            console.error('Error toggling status', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteUser = async (user: UserDto) => {
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${user.fullName}? This cannot be undone.`)) return;

        try {
            await usersApi.deleteUser(user.id);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) {
            console.error('Error deleting user', error);
            alert('Failed to delete user');
        }
    };

    const handleFormSubmit = async (data: CreateUserRequest) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await usersApi.updateUser(editingUser.id, {
                    fullName: data.fullName,
                    jobTitle: data.jobTitle,
                    roleId: data.roleId,
                    password: data.password // Only included if set
                });
            } else {
                await usersApi.createUser(data);
            }
            setIsModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error saving user', error);
            alert('Failed to save user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Context Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/tools')} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">User Management</h1>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                                Admin Tool
                            </span>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage system access and security roles</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreateUser}
                        className="px-5 py-2 bg-indigo-600 text-white rounded shadow-md text-xs font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <UserPlus size={14} strokeWidth={3} />
                        Add User
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="relative group w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter users..."
                                className="w-full bg-white border border-slate-200 text-xs font-bold rounded py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 uppercase tracking-widest"
                            />
                        </div>
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {filteredUsers.length} Users Found
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse act-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-4">Full Name & Identity</th>
                                <th className="px-6 py-4">Security Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Last Authentication</th>
                                <th className="w-32 text-right px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6 bg-white h-16"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        No users match your search
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-slate-50 transition-all group ${!user.isActive ? 'bg-slate-50/50 grayscale opacity-75' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border ${user.role === 'Admin' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-indigo-50 border-indigo-100 text-indigo-500'
                                                    }`}>
                                                    {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-xs uppercase tracking-tight">{user.fullName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{user.email}</div>
                                                    {user.jobTitle && <div className="text-[9px] text-slate-400 mt-0.5">{user.jobTitle}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'Admin' ? <ShieldCheck size={14} className="text-red-500" /> : <Shield size={14} className="text-indigo-400" />}
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'text-red-600' : 'text-slate-600'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 w-fit ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {user.isActive ? <CheckCircle size={10} /> : <Power size={10} />}
                                                {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'NEVER'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-1.5 rounded transition-colors ${user.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={user.isActive ? "Deactivate User" : "Activate User"}
                                                >
                                                    <Power size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingUser}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default UserManagementPage;
