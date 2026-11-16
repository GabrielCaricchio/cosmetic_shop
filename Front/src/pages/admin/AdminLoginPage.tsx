import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await adminLogin({ email, password });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciais administrativas incorretas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-700 text-white font-serif text-2xl font-bold shadow-md mb-3">
          A
        </div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Aura Backoffice
        </h1>
        <p className="text-xs text-accent-400 mt-1 uppercase tracking-widest font-semibold">
          Área Restrita aos Gestores e Operadores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-neutral-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail Corporativo"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@auracosmeticos.com.br"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Senha de Acesso"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-6"
            >
              Acessar Painel
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sessão protegida por RBAC e JWT criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
