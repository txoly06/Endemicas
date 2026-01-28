import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Trash2, Mail, Shield, X, Save } from 'lucide-react';
import { userService } from '../../services/userService';
import type { User as UserType } from '../../services/userService';

export default function UserManagement() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);

    // For manual user creation (admin only feature usually)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'public',
        institution: '',
        password: '' // Only for creation
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAll();
            if (data && data.length > 0) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
            // Fallback mock data
            setUsers([
                { id: 1, name: 'Admin System', email: 'admin@sistema.ao', role: 'admin', institution: 'MINSA' },
                { id: 2, name: 'Dr. Manuel', email: 'manuel@hospital.ao', role: 'health_professional', institution: 'Hospital Central' },
                { id: 3, name: 'Ana Costa', email: 'ana@email.com', role: 'public' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this user?')) return;
        try {
            await userService.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleEditRole = (user: UserType) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution || '',
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update role/institution
                await userService.updateRole(editingUser.id, formData.role);
                // Ideally update other fields too if API supports it
            } else {
                // Create user logic would involve Auth API register usually
                alert("Direct user creation depends on Auth API. For now, users register themselves.");
            }
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            alert('Failed to update user');
        }
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-800 border-purple-200',
        health_professional: 'bg-blue-100 text-blue-800 border-blue-200',
        public: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h1>
                    <p className="text-sm text-gray-500">Ver e gerir utilizadores registados e as suas funções.</p>
                </div>
                {/* <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Invite User
                </Button> */}
            </div>

            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Utilizador</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Função</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Instituição</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">A carregar utilizadores...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum utilizador encontrado.</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3 uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${roleColors[user.role] || 'bg-gray-100'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.institution || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEditRole(user)} className="text-blue-600 hover:text-blue-900 transition-colors p-1" title="Edit Role">
                                            <Shield className="h-4 w-4" />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 transition-colors p-1" title="Delete User">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Role Modal */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                            <h2 className="text-lg font-bold">Gerir Permissões de Utilizador</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 bg-blue-50 p-4 rounded-sm border border-blue-100">
                            <p className="text-sm text-blue-800">A editar: <strong>{editingUser.name}</strong></p>
                            <p className="text-xs text-blue-600">{editingUser.email}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Função</label>
                                <select
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="public">Público</option>
                                    <option value="health_professional">Profissional de Saúde</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Atualizar Função
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
