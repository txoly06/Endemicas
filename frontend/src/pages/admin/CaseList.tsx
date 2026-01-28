import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

import type { DiseaseCase } from '../../types/case';
import { caseService } from '../../services/caseService';
import { reportService } from '../../services/reportService';
import QRCode from 'react-qr-code';
import { Plus, Edit2, Trash2, Search, Filter, QrCode, X, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';


export default function CaseList() {
    const navigate = useNavigate();
    const [cases, setCases] = useState<DiseaseCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingCard, setViewingCard] = useState<DiseaseCase | null>(null);

    // Filters & Pagination State
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const loadCases = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (search) params.search = search;
            if (status && status !== 'Todos os Status') params.status = status;

            const response = await caseService.getAll(params);

            // Handle Laravel Pagination Response
            if (response && response.data) {
                setCases(response.data);
                setTotalPages(response.last_page || 1);
                setTotalItems(response.total || 0);
            } else if (Array.isArray(response)) {
                setCases(response);
            }
        } catch (error) {
            console.error("Failed to load cases", error);
            console.error("Erro ao carregar lista de casos");
            // alert("Erro ao carregar lista de casos");
            // Fallback for demo if API fails completely (optional, can remove for prod)
            // setCases([]); 
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
            loadCases();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, status, loadCases]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem a certeza que deseja eliminar este caso?')) return;

        try {
            await caseService.delete(id);
            console.log('Caso eliminado com sucesso');
            alert('Caso eliminado com sucesso');
            loadCases();
        } catch (error) {
            console.error('Erro ao eliminar caso');
            alert('Erro ao eliminar caso');
        }
    };

    const handleViewCard = async (caseItem: DiseaseCase) => {
        setViewingCard(caseItem);
        try {
            const fullDetails = await caseService.getById(caseItem.id);
            setViewingCard(fullDetails);
        } catch (e) {
            console.log("Could not fetch full details, using list data");
        }
    };

    const printCard = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'suspected': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'recovered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'deceased': return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registo de Casos</h1>
                    <p className="text-sm text-slate-500">Gerir e acompanhar registos epidemiológicos.</p>
                </div>
                <Link to="/dashboard/cases/new">
                    <Button className="rounded-lg shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Registar Novo Caso
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, código ou BI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="">Todos os Status</option>
                            <option value="suspected">Suspeito</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="recovered">Recuperado</option>
                            <option value="deceased">Óbito</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnóstico</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Localização</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                                            A carregar registos...
                                        </div>
                                    </td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                                        Nenhum caso encontrado.
                                    </td>
                                </tr>
                            ) : cases.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.patient_code || `CASE-${item.id}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <div className="font-medium text-slate-900">{item.patient_name}</div>
                                        <div className="text-xs text-slate-500">{calculateAge(item.patient_dob)} anos • {item.patient_gender === 'M' ? 'Masculino' : item.patient_gender === 'F' ? 'Feminino' : 'Outro'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <div className="font-medium">{item.disease?.name || 'Não especificado'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {item.municipality}, {item.province}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                            {item.status === 'suspected' ? 'Suspeito' :
                                                item.status === 'confirmed' ? 'Confirmado' :
                                                    item.status === 'recovered' ? 'Recuperado' :
                                                        item.status === 'deceased' ? 'Óbito' : item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(item.diagnosis_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleViewCard(item)}
                                                className="text-slate-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver Cartão"
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/dashboard/cases/${item.id}/edit`)}
                                                className="text-slate-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-slate-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalItems > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-slate-200 sm:px-6 flex items-center justify-between">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-700">
                                    A mostrar página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span> (<span className="font-medium">{totalItems}</span> total)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Próximo</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Patient Card Modal (unchanged visual structure, but uses real data) */}
            {viewingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute print:inset-0">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-slate-900 text-white p-6 print:bg-slate-900 print:text-white print-color-adjust-exact">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold uppercase tracking-wider">Patient Card</h2>
                                    <p className="text-slate-300 text-sm">Endemic Disease Monitoring System</p>
                                </div>
                                <button onClick={() => setViewingCard(null)} className="text-slate-400 hover:text-white transition-colors print:hidden">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row gap-8 items-start">
                                {/* Details */}
                                <div className="flex-1 space-y-5">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient Name</h3>
                                        <p className="text-xl font-medium text-slate-900">{viewingCard.patient_name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unique Code</h3>
                                            <p className="text-base font-mono font-medium text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                                {viewingCard.patient_code}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</h3>
                                            <p className="text-slate-700">{viewingCard.patient_dob}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosis</h3>
                                            <p className="text-slate-700">{viewingCard.disease?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(viewingCard.status)}`}>
                                                {viewingCard.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {viewingCard.masked_id_number && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID Number</h3>
                                            <p className="text-slate-500 font-mono tracking-widest">{viewingCard.masked_id_number}</p>
                                        </div>
                                    )}
                                </div>

                                {/* QR Code Area */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-white p-2 border border-slate-200 shadow-sm rounded-lg">
                                        <QRCode
                                            value={viewingCard.qr_data || `${viewingCard.patient_code}:${viewingCard.patient_name}`}
                                            size={120}
                                            level="H"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Official Scan</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-400">Issued by Ministry of Health • {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100 print:hidden">
                            <Button variant="secondary" onClick={() => setViewingCard(null)}>Close</Button>
                            <Button variant="outline" onClick={() => {
                                if (viewingCard) {
                                    // Mock download for now, or ensure reportService works
                                    // toast.success("Downloading PDF...");
                                    console.log("Downloading PDF...");
                                    reportService.downloadPatientCard(viewingCard.id, viewingCard.patient_name || 'paciente');
                                }
                            }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button onClick={printCard}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
