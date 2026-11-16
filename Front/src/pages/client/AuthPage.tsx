import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, Lock, User, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdConsent) {
      setError('É necessário aceitar os termos de consentimento LGPD para se cadastrar.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        lgpd_consent: lgpdConsent,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a href="/" className="inline-flex items-center gap-2 group mb-4">
          <span className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">
            A
          </span>
          <div className="text-left">
            <span className="font-serif text-2xl font-bold text-neutral-900 block leading-none">
              Aura
            </span>
            <span className="text-[10px] uppercase tracking-widest text-brand-600 font-semibold">
              Cosméticos
            </span>
          </div>
        </a>
        <h2 className="text-xl font-bold font-serif text-neutral-900">
          {tab === 'login' ? 'Bem-vinda de volta' : 'Crie sua conta na Aura'}
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Acesse sua sacola, histórico de compras e acompanhamento Pix
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200/90 rounded-2xl sm:px-10">
          {/* Abas Alternáveis */}
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                tab === 'login'
                  ? 'border-brand-700 text-brand-800'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                tab === 'register'
                  ? 'border-brand-700 text-brand-800'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com.br"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Entrar
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <Input
                label="Nome Completo"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Silva"
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria.silva@exemplo.com.br"
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="WhatsApp / Telefone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Senha (mínimo 6 caracteres)"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-brand-700 focus:ring-brand-700"
                  />
                  <span className="text-xs text-neutral-600 leading-tight">
                    Concordo com os{' '}
                    <a href="/termos" target="_blank" className="text-brand-700 underline font-medium">
                      Termos de Uso
                    </a>{' '}
                    e com o tratamento dos meus dados para fins de compra e entrega conforme a{' '}
                    <strong>LGPD</strong>.
                  </span>
                </label>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} className="mt-4">
                Criar Conta
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Criptografia Argon2id de ponta a ponta</span>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-neutral-500 hover:text-brand-700 inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
