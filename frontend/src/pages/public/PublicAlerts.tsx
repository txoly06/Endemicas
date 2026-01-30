
import { useEffect, useState } from 'react';
import { alertService } from '../../services/alertService';
import type { Alert } from '../../types/alert';
import { AlertCircle, Calendar } from 'lucide-react';

export default function PublicAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await alertService.getActive();
                setAlerts(data);
            } catch (error) {
                console.error("Failed to load alerts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20 bg-gray-50 min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <AlertCircle className="text-red-600 h-8 w-8" />
                    Alertas Epidemiológicos
                </h1>

                {alerts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <AlertCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum alerta ativo</h3>
                        <p className="mt-2 text-gray-500">
                            Não existem comunicados de risco ou surtos ativos registados no sistema neste momento.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-red-500 border-gray-200 p-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-4`}>
                                    {alert.severity.toUpperCase()}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">{alert.message}</p>
                                <div className="flex items-center text-sm text-gray-400 border-t pt-4">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{new Date(alert.created_at || '').toLocaleDateString('pt-AO')}</span>
                                    <span className="mx-2">•</span>
                                    <span>{alert.affected_area || 'Nacional'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
