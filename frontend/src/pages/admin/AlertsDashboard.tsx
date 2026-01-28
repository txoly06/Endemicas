import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Plus, Trash2, MapPin, Clock } from 'lucide-react';
import type { Alert } from '../../types/alert';

export default function AlertsDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data matching backend API
        setTimeout(() => {
            setAlerts([
                {
                    id: 1,
                    title: "Surto de Malária em Luanda",
                    message: "Aumento significativo de casos registados nos últimos 7 dias.",
                    severity: "critical",
                    affected_area: "Viana, Cacuaco",
                    is_active: true,
                    expires_at: "2026-02-15T00:00:00Z",
                    disease_id: 1,
                    created_at: "2026-01-20T10:00:00Z",
                    disease: { id: 1, name: "Malária" }
                },
                {
                    id: 2,
                    title: "Alerta de Cólera",
                    message: "Casos suspeitos reportados na zona costeira.",
                    severity: "high",
                    affected_area: "Lobito",
                    is_active: true,
                    expires_at: "2026-03-01T00:00:00Z",
                    disease_id: 2,
                    created_at: "2026-01-25T14:30:00Z",
                    disease: { id: 2, name: "Cólera" }
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'border-l-4 border-red-600 bg-red-50';
            case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
            case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
            case 'low': return 'border-l-4 border-blue-500 bg-blue-50';
            default: return 'border-l-4 border-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Alertas do Sistema</h1>
                    <p className="text-sm text-gray-500">Gerir avisos de saúde pública e notificações de surtos.</p>
                </div>
                <Button className="rounded-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Alerta
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">A carregar alertas...</div>
                ) : alerts.map(alert => (
                    <div key={alert.id} className={`p-6 rounded-sm border border-gray-200 shadow-sm relative group ${getSeverityStyles(alert.severity)}`}>
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white border border-gray-200">
                                        {alert.severity}
                                    </span>
                                    {alert.is_active && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>}
                                    <span className="text-sm text-gray-500">
                                        {alert.disease?.name}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                                <p className="text-gray-600 max-w-2xl">{alert.message}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {alert.affected_area}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" /> Expira a: {new Date(alert.expires_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
