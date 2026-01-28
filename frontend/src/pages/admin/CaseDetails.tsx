import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import type { DiseaseCase } from '../../types/case';
import { Button } from '../../components/Button';
import { ArrowLeft, Clock, MapPin, Activity, User, Calendar, Edit, FileText } from 'lucide-react';
import api from '../../services/api';

interface CaseHistory {
    id: number;
    user_id: number;
    action: string;
    details: string;
    created_at: string;
    user?: { name: string };
}

export default function CaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState<DiseaseCase | null>(null);
    const [history, setHistory] = useState<CaseHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        loadCaseDetails(Number(id));
    }, [id]);

    const loadCaseDetails = async (caseId: number) => {
        setLoading(true);
        try {
            // Fetch Basics
            const data = await caseService.getById(caseId);
            setCaseData(data);

            // Fetch History manually if not included (Backend endpoint: /cases/{id}/history)
            try {
                const historyRes = await api.get(`/cases/${caseId}/history`);
                setHistory(historyRes.data);
            } catch (hErr) {
                console.warn("Could not load history", hErr);
            }

        } catch (error) {
            console.error("Failed to load case", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">A carregar detalhes do caso...</div>;
    if (!caseData) return <div className="p-10 text-center text-red-500">Caso não encontrado.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/cases')}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Caso #{caseData.patient_code}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <FileText className="h-4 w-4 mr-2" /> Imprimir
                    </Button>
                    <Button onClick={() => navigate(`/dashboard/cases/${caseData.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar Dados
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                        <h2 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Dados Clínicos
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Doença</dt>
                                <dd className="mt-1 text-base font-semibold text-gray-900">{caseData.disease?.name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Estado Atual</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                                        ${caseData.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                                            caseData.status === 'recovered' ? 'bg-green-100 text-green-800' :
                                                caseData.status === 'deceased' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {caseData.status}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Data de Diagnóstico</dt>
                                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {new Date(caseData.diagnosis_date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Sintomas Reportados</dt>
                                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-sm">
                                    {caseData.symptoms || 'Sem detalhes registados.'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                        <h2 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Informação do Paciente
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                                <dd className="mt-1 text-sm text-gray-900">{caseData.patient_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {caseData.patient_dob}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Género</dt>
                                <dd className="mt-1 text-sm text-gray-900">{caseData.patient_gender}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                        <h2 className="text-lg font-bold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Localização
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Província</dt>
                                <dd className="mt-1 text-sm text-gray-900">{caseData.province}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Município</dt>
                                <dd className="mt-1 text-sm text-gray-900">{caseData.municipality}</dd>
                            </div>
                            {(caseData.latitude && caseData.longitude) && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Coordenadas</dt>
                                    <dd className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 inline-block px-2 py-1 rounded">
                                        {caseData.latitude}, {caseData.longitude}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Sidebar / History */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            Histórico de Alterações
                        </h2>

                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                            {history.length === 0 ? (
                                <p className="text-sm text-gray-500 pl-4">Sem registo de histórico.</p>
                            ) : (
                                history.map((log) => (
                                    <div key={log.id} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-gray-300"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                            <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                            <p className="text-xs text-gray-600">{log.details}</p>
                                            {log.user && (
                                                <p className="text-xs text-gray-400 mt-1">Por: {log.user.name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
