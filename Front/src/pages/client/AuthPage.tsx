import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'E-mail ou senha incorretos.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!lgpdConsent) {
      setErrorMsg('É obrigatório consentir com os termos da LGPD para criar uma conta.');
      return;
    }
    try {
      await register({
        name,
        email,
        password,
        cpf,
        phone,
        lgpd_consent: lgpdConsent,
      });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Erro ao registrar conta.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors mb-6 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o início
        </button>

        <div className="flex justify-center items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-neutral-900 font-serif">
            Aura Cosméticos
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-neutral-800">
          {tab === 'login' ? 'Entre na sua conta' : 'Crie sua conta de beleza'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-neutral-100 sm:px-10">
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                tab === 'login'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                tab === 'register'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium border border-red-200">
              {errorMsg}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-2"
              >
                Entrar
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <Input
                label="Nome Completo"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
                <Input
                  label="WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200 mt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs text-neutral-600 leading-snug">
                    Concordo com a coleta e tratamento dos meus dados nos termos da LGPD.
                  </span>
                </label>
              </div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-2"
              >
                Cadastrar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
