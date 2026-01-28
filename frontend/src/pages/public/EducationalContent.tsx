import { useEffect, useState } from 'react';
// import api from '../../services/api';
import { Loader2 } from 'lucide-react';

export default function EducationalContent() {
    const [loading, setLoading] = useState(true);
    const [contents, setContents] = useState<any[]>([]);

    useEffect(() => {
        // Placeholder fetching logic - will be replaced with real API call
        // contents would be fetched from /public/content
        setTimeout(() => {
            setContents([
                { id: 1, title: 'Prevenção da Malária', type: 'guide', summary: 'Como se proteger e proteger a sua família.' },
                { id: 2, title: 'Sintomas da Cólera', type: 'article', summary: 'Identifique os sinais de alerta cedo.' },
                { id: 3, title: 'Vacinação em Dia', type: 'video', summary: 'A importância de manter o calendário vacinal.' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Recursos Educativos</h1>
                    <p className="mt-4 text-lg text-gray-600">Informação oficial para manter a sua comunidade segura.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {contents.map((item) => (
                            <div key={item.id} className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800 uppercase tracking-wide">
                                        {item.type}
                                    </span>
                                    <h3 className="mt-4 text-xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="mt-2 text-gray-600">{item.summary}</p>
                                    <button className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-500">
                                        Ler mais &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
