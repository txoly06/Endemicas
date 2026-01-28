import { Outlet, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

export default function PublicLayout() {
    const { isAuthenticated, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                                M
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">MonitorEndêmico</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Início</Link>
                        <Link to="/content" className="text-gray-600 hover:text-blue-600 transition-colors">Educação</Link>
                        <Link to="/alerts" className="text-gray-600 hover:text-blue-600 transition-colors">Alertas</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Button variant="outline" onClick={logout} className="text-sm">
                                Sair
                            </Button>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900">
                                    Entrar
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-5">Registar</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 py-12 mt-20">
                <div className="mx-auto max-w-7xl px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Sistema de Monitorização de Doenças Endémicas. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
