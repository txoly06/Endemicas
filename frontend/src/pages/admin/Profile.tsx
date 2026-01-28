import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Shield, Building, LogOut } from 'lucide-react';
import { Button } from '../../components/Button';
import api from '../../services/api';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    institution?: string;
    created_at: string;
}

export default function Profile() {
    const { user, logout } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch fresh profile data
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Fallback to auth store user if API fails
                if (user) {
                    setProfile({
                        id: Number(user.id),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        institution: (user as any).institution,
                        created_at: new Date().toISOString()
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">A carregar perfil...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-red-500">Erro ao carregar perfil.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">O Meu Perfil</h1>
                <p className="text-sm text-gray-500">Gerir informações da conta e preferências.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-4 border-white shadow-md">
                        <User className="h-12 w-12" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                        <div className="flex items-center text-gray-600 gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Shield className="h-3 w-3 mr-1" />
                                {profile.role}
                            </span>
                            {profile.institution && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <Building className="h-3 w-3 mr-1" />
                                    {profile.institution}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                    </Button>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 p-6 sm:p-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Conta</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">ID de Utilizador</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.id}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(profile.created_at).toLocaleDateString()}
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Permissões</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {profile.role === 'admin' ? (
                                    <p>Acesso total ao sistema, gestão de utilizadores, registo de doenças e relatórios.</p>
                                ) : profile.role === 'health_professional' ? (
                                    <p>Registo de casos, visualização de alertas e acesso a relatórios básicos.</p>
                                ) : (
                                    <p>Acesso limitado de visualização.</p>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
