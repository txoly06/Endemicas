import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    Users,
    AlertTriangle,
    FileText,
    LogOut,
    Menu,
    X,
    Map as MapIcon,
    Activity,
    BookOpen,
    Stethoscope
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Navigation Items with Role Access Control
    const navigation = [
        { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Ocorrências / Casos', href: '/dashboard/cases', icon: Activity },
        { name: 'Mapa', href: '/dashboard/map', icon: MapIcon },
        { name: 'Alertas', href: '/dashboard/alerts', icon: AlertTriangle },
        { name: 'Relatórios', href: '/dashboard/reports', icon: FileText, role: 'admin' },
        { name: 'Doenças', href: '/dashboard/diseases', icon: Stethoscope, role: 'admin' },
        { name: 'Conteúdos', href: '/dashboard/content', icon: BookOpen, role: 'admin' },
        { name: 'Utilizadores', href: '/dashboard/users', icon: Users, role: 'admin' },
    ];

    const filteredNav = navigation.filter(item =>
        !item.role || (user && user.role === item.role)
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - "Clinical Precision" Style: Slate-900, Sharp, High Contrast */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0 border-r border-slate-800 shadow-2xl",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600 text-white">M</div>
                        <span>Monitor<span className="text-blue-500">Endêmico</span></span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-1 p-4">
                    <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Menu do Sistema
                    </div>
                    {filteredNav.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2",
                                    isActive
                                        ? "bg-slate-800 border-blue-500 text-white shadow-md shadow-black/20"
                                        : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-slate-600"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 p-4 bg-slate-950/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-9 w-9 rounded-sm bg-slate-700 flex items-center justify-center text-sm font-bold border border-slate-600">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium text-white">{user?.name}</span>
                            <span className="truncate text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm lg:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-semibold text-gray-900">Dashboard</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
