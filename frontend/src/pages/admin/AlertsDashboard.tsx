import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Plus, Trash2, MapPin, Clock, X, AlertTriangle } from 'lucide-react';
import type { Alert } from '../../types/alert';
import { alertService } from '../../services/alertService';
import { diseaseService } from '../../services/diseaseService';
import type { Disease } from '../../types/disease';

export default function AlertsDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        severity: 'medium',
        affected_area: '',
        expires_at: '',
        disease_id: '',
        is_active: true
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [alertsData, diseasesData] = await Promise.all([
                alertService.getAll(),
                diseaseService.getAll()
            ]);
            // Handle pagination if necessary, assuming array for now based on service
            const alertList = (alertsData as any).data ? (alertsData as any).data : alertsData;
            setAlerts(Array.isArray(alertList) ? alertList : []);
            setDiseases(diseasesData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja eliminar este alerta?")) return;
        try {
            await alertService.delete(id);
            setAlerts(alerts.filter(a => a.id !== id));
        } catch (error) {
            alert("Erro ao eliminar alerta");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await alertService.create({
                ...formData,
                disease_id: formData.disease_id ? Number(formData.disease_id) : undefined
            } as any);
            setShowModal(false);
            setFormData({
                title: '',
                message: '',
                severity: 'medium',
                affected_area: '',
                expires_at: '',
                disease_id: '',
                is_active: true
            });
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erro ao criar alerta");
        }
    };

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
                <Button className="rounded-sm" onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Alerta
                </Button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Novo Alerta</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Título do Alerta"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severidade</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    value={formData.severity}
                                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doença Relacionada</label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    value={formData.disease_id}
                                    onChange={e => setFormData({ ...formData, disease_id: e.target.value })}
                                >
                                    <option value="">Geral (Sem doença específica)</option>
                                    {diseases.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Área Afetada"
                                value={formData.affected_area}
                                onChange={e => setFormData({ ...formData, affected_area: e.target.value })}
                                placeholder="Ex: Luanda, Viana"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    value={formData.expires_at}
                                    onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem Detalhada</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-300 p-2 h-32"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                                <Button type="submit">Publicar Alerta</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">A carregar alertas...</div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum alerta ativo</h3>
                        <p className="text-gray-500">Crie um novo alerta para notificar o público.</p>
                    </div>
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
                                        {alert.disease?.name || 'Geral'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                                <p className="text-gray-600 max-w-2xl">{alert.message}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> {alert.affected_area}
                                    </span>
                                    {alert.expires_at && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" /> Expira a: {new Date(alert.expires_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(alert.id)}
                                className="text-gray-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
