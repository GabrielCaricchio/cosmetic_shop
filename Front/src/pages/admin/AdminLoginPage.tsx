import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/apiClient';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/admin/login', {
        email,
        password,
      });

      const { access_token, user } = res.data;
      const adminUser = user || {
        id: res.data.user_id,
        user_id: res.data.user_id,
        name: res.data.name,
        role: res.data.role,
      };
      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));

      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || 'Credenciais de administrador inválidas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-neutral-800">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg mb-3">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 font-serif">
            Aura Backoffice
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Acesso restrito à equipe de gestão e administradores
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail Corporativo"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@auracosmeticos.com"
          />

          <Input
            label="Senha de Acesso"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-4"
          >
            Entrar no Painel Seguro
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            ← Voltar para a loja pública
          </button>
        </div>
      </div>
    </div>
  );
};
