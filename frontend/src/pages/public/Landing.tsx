import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '../../components/Button';

export default function Landing() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-16 pb-32 lg:pt-24 lg:pb-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        Monitorização Avançada de <br />
                        <span className="text-blue-600">Doenças Endémicas</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10 leading-relaxed">
                        Um sistema integrado para detecção precoce, resposta rápida e educação pública sobre surtos epidemiológicos em Angola.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <Button className="rounded-full px-8 py-6 text-lg h-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                Registar Caso
                            </Button>
                        </Link>
                        <Link to="/content">
                            <Button variant="secondary" className="rounded-full px-8 py-6 text-lg h-auto">
                                Aprender Mais
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-gray-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                        <FeatureCard
                            icon={<Activity className="h-8 w-8 text-red-500" />}
                            title="Monitorização em Tempo Real"
                            description="Acompanhe a propagação de doenças e receba alertas imediatos sobre novos surtos na sua região."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-8 w-8 text-green-500" />}
                            title="Prevenção e Resposta"
                            description="Ferramentas para profissionais de saúde gerirem casos e coordenarem respostas eficazes."
                        />
                        <FeatureCard
                            icon={<FileText className="h-8 w-8 text-blue-500" />}
                            title="Educação Pública"
                            description="Acesso a guias oficiais, estatísticas transparentes e informações vitais para a comunidade."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gray-50 p-3">
                {icon}
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
