import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function PublicContentDetail() {
    const { slug } = useParams();
    const [content, setContent] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Typically access by slug: /public/content/{slug}
                const response = await api.get(`/public/content/${slug}`);
                setContent(response.data);
            } catch (error) {
                console.error("Failed to load content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [slug]);

    if (loading) {
        return <div className="min-h-screen pt-20 pb-12 flex justify-center items-center">A carregar...</div>;
    }

    if (!content) {
        return (
            <div className="min-h-screen pt-20 pb-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Conteúdo não encontrado</h1>
                <Link to="/content" className="text-blue-600 hover:underline mt-4 inline-block">
                    Voltar aos recursos
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-20 pb-16">
            <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link to="/content" className="text-gray-500 hover:text-gray-900 inline-flex items-center mb-6 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar aos recursos
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800 uppercase tracking-wide">
                            {content.type}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(content.created_at).toLocaleDateString()}
                        </span>
                        {content.author && (
                            <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {content.author.name}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        {content.title}
                    </h1>

                    <p className="text-xl text-gray-500 leading-relaxed">
                        {content.excerpt}
                    </p>
                </div>

                <div className="prose prose-lg prose-blue mx-auto text-gray-700">
                    {/* In a real app, use a safe HTML renderer like dompurify */}
                    {/* For now, just rendering as text or simple HTML */}
                    <div dangerouslySetInnerHTML={{ __html: content.content }} />
                </div>
            </article>
        </div>
    );
}
