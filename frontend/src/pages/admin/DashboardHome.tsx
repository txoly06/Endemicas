import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { Users, Activity, AlertCircle, FileCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { statsService } from '../../services/statsService';
import type { DashboardStats, TimelineData } from '../../services/statsService';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity", colorClass)}>
            <Icon className="h-20 w-20" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={cn("p-3 rounded-lg bg-opacity-10", bgClass)}>
                <Icon className={cn("h-6 w-6", colorClass)} />
            </div>
            {subtext && (
                <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                    {subtext}
                </div>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</p>
        </div>
    </div>
);

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [timeline, setTimeline] = useState<TimelineData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, timelineData] = await Promise.all([
                    statsService.getDashboardStats(),
                    statsService.getTimeline(30)
                ]);
                setStats(statsData);
                setTimeline(timelineData);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Casos"
                    value={stats?.total_cases.toLocaleString()}
                    subtext="Registados"
                    icon={Activity}
                    colorClass="text-slate-900"
                    bgClass="bg-slate-900"
                />
                <StatCard
                    title="Alertas Ativos"
                    value={stats?.active_alerts}
                    subtext="Em curso"
                    icon={AlertCircle}
                    colorClass="text-rose-600"
                    bgClass="bg-rose-600"
                />
                <StatCard
                    title="Recuperados"
                    value={stats?.recovered_cases.toLocaleString()}
                    subtext="Total"
                    icon={Users}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-600"
                />
                <StatCard
                    title="Situação Crítica"
                    value={stats?.deceased_cases.toLocaleString()}
                    subtext="Óbitos"
                    icon={FileCheck}
                    colorClass="text-slate-500"
                    bgClass="bg-slate-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Epidemic Curve */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Curva Epidemiológica</h3>
                            <p className="text-sm text-slate-500">Evolução dos últimos 30 dias</p>
                        </div>
                    </div>
                    {/* Explicit style to ensure Recharts can calculate dimensions */}
                    <div style={{ width: '100%', height: 320, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="cases" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCases)" name="Novos Casos" />
                                <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" name="Recuperados" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Distribuição por Estado</h3>
                        <p className="text-sm text-slate-500">Visão geral dos casos atuais</p>
                    </div>
                    {/* Explicit style to ensure Recharts can calculate dimensions */}
                    <div style={{ width: '100%', height: 320, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Ativos', value: stats?.active_cases || 0, color: '#f59e0b' },
                                    { name: 'Recuperados', value: stats?.recovered_cases || 0, color: '#10b981' },
                                    { name: 'Óbitos', value: stats?.deceased_cases || 0, color: '#64748b' },
                                ]}
                                layout="vertical"
                                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {
                                        [
                                            { name: 'Ativos', value: stats?.active_cases || 0, color: '#f59e0b' },
                                            { name: 'Recuperados', value: stats?.recovered_cases || 0, color: '#10b981' },
                                            { name: 'Óbitos', value: stats?.deceased_cases || 0, color: '#64748b' },
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
