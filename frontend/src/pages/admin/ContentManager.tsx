import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2, Video, FileText, BookOpen, Save, X } from 'lucide-react';
import { contentService } from '../../services/contentService';
import type { EducationalContent } from '../../types/content';

export default function ContentManager() {
    const [contents, setContents] = useState<EducationalContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<EducationalContent>>({
        title: '',
        slug: '',
        type: 'guide',
        excerpt: '',
        content: '',
        is_published: false
    });

    const fetchContent = async () => {
        setLoading(true);
        try {
            const data = await contentService.getAll();
            if (data && data.length > 0) {
                setContents(data);
            } else {
                setContents([]);
            }
        } catch (err) {
            console.error("Failed to fetch content", err);
            // Fallback mock data
            setContents([
                {
                    id: 1,
                    title: 'Malaria Prevention Guide',
                    slug: 'malaria-prevention',
                    type: 'guide',
                    excerpt: 'Essential steps to prevent malaria.',
                    content: '...',
                    is_published: true,
                    created_at: '2025-01-20'
                },
                {
                    id: 2,
                    title: 'Hand Washing Tutorial',
                    slug: 'hand-washing',
                    type: 'video',
                    excerpt: 'Proper technique for hygiene.',
                    content: '...',
                    is_published: true,
                    created_at: '2025-01-22'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleEdit = (item: EducationalContent) => {
        setFormData(item);
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await contentService.delete(id);
            setContents(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete content');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await contentService.update(editingId, formData);
            } else {
                await contentService.create(formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            fetchContent();
        } catch (err) {
            alert('Failed to save content');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'guide': return <BookOpen className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestor de Conteúdos</h1>
                    <p className="text-sm text-gray-500">Publicar materiais educativos para o portal público.</p>
                </div>
                <Button className="rounded-sm" onClick={() => {
                    setEditingId(null);
                    setFormData({
                        title: '', slug: '', type: 'guide',
                        excerpt: '', content: '', is_published: false
                    });
                    setIsModalOpen(true);
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Conteúdo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <div className="text-gray-500 col-span-full text-center py-10">A carregar conteúdo...</div> : contents.map(item => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-sm shadow-sm p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-sm ${item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {getIcon(item.type)}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full border ${item.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {item.is_published ? 'Publicado' : 'Rascunho'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3">{item.excerpt}</p>

                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-auto">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                <Edit2 className="h-4 w-4 mr-2" /> Editar
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && contents.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white border border-dashed border-gray-300 rounded-sm">
                        <p className="text-gray-500">Nenhum conteúdo encontrado. Crie o seu primeiro material educativo.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold">{editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm"
                                        placeholder="gerado-auto-se-vazio"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="guide">Guia / Artigo</option>
                                        <option value="video">Vídeo</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm"
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo Completo (HTML/Markdown)</label>
                                    <textarea
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm font-mono text-sm"
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                            checked={formData.is_published}
                                            onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-gray-900">Publicar imediatamente no portal público</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Gravar Conteúdo
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
