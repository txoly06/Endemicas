import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">Monitor Endémico</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Bem-vindo, {user?.name}</span>
                            <Button onClick={handleLogout} variant="outline">
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel de Controlo</h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <p>Esta é uma área de painel protegida.</p>
                            <p>Perfil: <span className="font-semibold text-blue-600">{user?.role}</span></p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
