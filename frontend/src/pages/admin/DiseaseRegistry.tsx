import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { diseaseService } from '../../services/diseaseService';
import type { Disease } from '../../types/case';

export default function DiseaseRegistry() {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<Disease>>({
        name: '',
        symptoms: '',
        transmission: ''
    });

    const fetchDiseases = async () => {
        setLoading(true);
        try {
            // Mock data for now if API fails
            const data = await diseaseService.getAll();
            if (data && data.length > 0) {
                setDiseases(data);
            } else {
                setDiseases([
                    { id: 1, name: 'Malária', symptoms: 'Febre, calafrios', transmission: 'Mosquito' },
                    { id: 2, name: 'Cólera', symptoms: 'Diarreia severa', transmission: 'Água contaminada' }
                ]);
            }
        } catch (err) {
            console.error(err);
            setDiseases([
                { id: 1, name: 'Malária', symptoms: 'Febre, calafrios', transmission: 'Mosquito' },
                { id: 2, name: 'Cólera', symptoms: 'Diarreia severa', transmission: 'Água contaminada' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, []);

    const handleEdit = (disease: Disease) => {
        setFormData(disease);
        setEditingId(disease.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this disease?')) return;
        try {
            await diseaseService.delete(id);
            setDiseases(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to delete disease');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await diseaseService.update(editingId, formData);
            } else {
                await diseaseService.create(formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', symptoms: '', transmission: '' });
            fetchDiseases();
        } catch (err) {
            alert('Failed to save disease');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registo de Doenças</h1>
                    <p className="text-sm text-gray-500">Gerir doenças monitorizadas e protocolos.</p>
                </div>
                <Button className="rounded-sm" onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', symptoms: '', transmission: '' });
                    setIsModalOpen(true);
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Doença
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sintomas</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Transmissão</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">A carregar...</td></tr>
                        ) : diseases.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.symptoms}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{item.transmission}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 p-1">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 p-1">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">{editingId ? 'Editar Doença' : 'Adicionar Nova Doença'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sintomas</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm"
                                    value={formData.symptoms}
                                    onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transmissão</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm"
                                    value={formData.transmission}
                                    onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Gravar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
