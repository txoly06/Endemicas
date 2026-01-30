import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function VerifyCase() {
    const { code } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                // Call public verification endpoint
                const response = await api.get(`/public/verify/${code}`);
                setResult(response.data);
            } catch (err) {
                setError('Código inválido ou registo não encontrado.');
            } finally {
                setLoading(false);
            }
        };
        if (code) verify();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">A verificar autenticidade...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-xl">
                <div className="md:flex">
                    <div className="p-8 w-full">
                        <div className="uppercase tracking-wide text-sm text-blue-500 font-semibold mb-1">Sistema de Verificação Oficial</div>

                        {error ? (
                            <div className="text-center py-8">
                                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inválido</h2>
                                <p className="text-gray-600">{error}</p>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Documento Autêntico</h1>
                                <p className="text-sm text-gray-500 mb-8">Este registo existe na base de dados nacional.</p>

                                <div className="bg-slate-50 rounded-lg p-6 text-left space-y-3 border border-slate-100">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Código</span>
                                        <span className="font-mono font-medium">{result.code}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Estado</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-xs text-white
                                            ${result.status === 'confirmed' ? 'bg-red-500' :
                                                result.status === 'recovered' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            {result.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Doença</span>
                                        <span className="font-medium">{result.disease}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Iniciais</span>
                                        <span className="font-medium">*** {result.initials}</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-center text-xs text-slate-400 gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span>Verificado criptograficamente pelo MINSA</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                &larr; Voltar à página inicial
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
