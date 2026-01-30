import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role: 'public' as 'public' | 'health_professional',
        institution: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            // Error handled by store
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-lg rounded-xl">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Criar uma conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Entrar
                        </Link>
                    </p>
                </div>
                <div className="text-center mt-2">
                    <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
                        &larr; Voltar à página inicial
                    </Link>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            label="Nome Completo"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            label="Endereço de email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            label="Telefone (Opcional)"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <div>
                            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">Tipo de Conta</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <option value="public">Público</option>
                                <option value="health_professional">Profissional de Saúde</option>
                            </select>
                        </div>

                        {formData.role === 'health_professional' && (
                            <Input
                                id="institution"
                                name="institution"
                                type="text"
                                required
                                label="Nome da Instituição"
                                value={formData.institution}
                                onChange={handleChange}
                            />
                        )}

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            label="Palavra-passe"
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            label="Confirmar Palavra-passe"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        isLoading={isLoading}
                    >
                        Registar
                    </Button>
                </form>
            </div>
        </div>
    );
}
