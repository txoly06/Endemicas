import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { caseService } from '../../services/caseService';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';
import type { Disease } from '../../types/case';

export default function CaseForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        patient_name: '',
        patient_dob: '',
        patient_gender: 'M',
        patient_id_number: '',
        disease_id: '',
        province: 'Luanda',
        municipality: '',
        symptoms_reported: '',
        symptom_onset_date: new Date().toISOString().split('T')[0],
        diagnosis_date: new Date().toISOString().split('T')[0],
        status: 'suspected',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        // Fetch diseases for the dropdown
        async function fetchDiseases() {
            try {
                // Mock data if API fails or backend not fully seeded
                const data = await caseService.getDiseases();
                if (data && data.length > 0) {
                    setDiseases(data);
                } else {
                    setDiseases([
                        { id: 1, name: 'Malária', symptoms: '', transmission: '' },
                        { id: 2, name: 'Cólera', symptoms: '', transmission: '' },
                        { id: 3, name: 'Dengue', symptoms: '', transmission: '' },
                    ]);
                }
            } catch (err) {
                console.error("Failed to load diseases", err);
                // Fallback
                setDiseases([
                    { id: 1, name: 'Malária', symptoms: '', transmission: '' },
                    { id: 2, name: 'Cólera', symptoms: '', transmission: '' }
                ]);
            }
        }
        fetchDiseases();

        // Load Case Data if Editing
        if (isEditing) {
            const loadCase = async () => {
                setLoading(true);
                try {
                    const data = await caseService.getById(Number(id));
                    setFormData({
                        patient_name: data.patient_name,
                        patient_dob: data.patient_dob,
                        patient_gender: data.patient_gender,
                        patient_id_number: data.patient_id_number || '', // Safe fallback
                        disease_id: String(data.disease_id),
                        province: data.province,
                        municipality: data.municipality,
                        symptoms_reported: data.symptoms_reported || data.symptoms || '', // Try both keys
                        symptom_onset_date: data.symptom_onset_date || data.diagnosis_date, // Fallback if missing
                        diagnosis_date: data.diagnosis_date,
                        status: data.status,
                        latitude: String(data.latitude || ''),
                        longitude: String(data.longitude || '')
                    });
                } catch (e) {
                    console.error("Failed to load case", e);
                    setError("Falha ao carregar dados do caso.");
                } finally {
                    setLoading(false);
                }
            };
            loadCase();
        }
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                disease_id: Number(formData.disease_id),
                latitude: formData.latitude ? Number(formData.latitude) : undefined,
                longitude: formData.longitude ? Number(formData.longitude) : undefined,
                patient_gender: formData.patient_gender as 'M' | 'F' | 'O',
                status: formData.status as 'suspected' | 'confirmed'
            };

            if (isEditing) {
                await caseService.update(Number(id), payload);
            } else {
                await caseService.create(payload);
            }

            navigate('/dashboard/cases');
        } catch (err) {
            console.error('Failed to save case', err);
            setError('Ocorreu um erro ao gravar o caso. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Caso' : 'Reportar Novo Caso'}</h1>
                    <p className="text-sm text-gray-500">{isEditing ? 'Atualizar detalhes do registo clínico.' : 'Insira os detalhes clínicos para um novo registo epidemiológico.'}</p>
                </div>
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Patient Details */}
                    <div className="col-span-full">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">Informação do Paciente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    name="patient_name"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.patient_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                                <input
                                    type="date"
                                    name="patient_dob"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.patient_dob}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                <select
                                    name="patient_gender"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    value={formData.patient_gender}
                                    onChange={handleChange}
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="O">Outro</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Bilhete/Cartão (Opcional)</label>
                                <input
                                    type="text"
                                    name="patient_id_number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.patient_id_number}
                                    onChange={handleChange}
                                    placeholder="Ex: 001234567LA001"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clinical Details */}
                    <div className="col-span-full">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-2">Detalhes Clínicos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doença</label>
                                <select
                                    name="disease_id"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    value={formData.disease_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecionar Doença...</option>
                                    {diseases.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início dos Sintomas</label>
                                <input
                                    type="date"
                                    name="symptom_onset_date"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.symptom_onset_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Diagnóstico</label>
                                <input
                                    type="date"
                                    name="diagnosis_date"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.diagnosis_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="suspected"
                                            checked={formData.status === 'suspected'}
                                            onChange={handleChange}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Suspeito</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="confirmed"
                                            checked={formData.status === 'confirmed'}
                                            onChange={handleChange}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 font-medium text-red-700">Confirmado (Testado em Laboratório)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sintomas Reportados</label>
                                <textarea
                                    name="symptoms_reported"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Descreva os principais sintomas..."
                                    value={formData.symptoms_reported}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="col-span-full">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-2">Localização</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
                                <select
                                    name="province"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    value={formData.province}
                                    onChange={handleChange}
                                >
                                    <option value="Luanda">Luanda</option>
                                    <option value="Benguela">Benguela</option>
                                    <option value="Huambo">Huambo</option>
                                    <option value="Huila">Huila</option>
                                    <option value="Cabinda">Cabinda</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                                <input
                                    type="text"
                                    name="municipality"
                                    placeholder="ex. Viana"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.municipality}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Opcional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Opcional)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={loading} className="px-6">
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Atualizar Registo' : 'Gravar Registo'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
