import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email: loginEmail, password: loginPassword });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'E-mail ou senha inválidos.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!lgpdConsent) {
      setErrorMsg('É necessário consentir com os termos da LGPD para se cadastrar.');
      return;
    }
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        cpf,
        phone,
        lgpd_consent: lgpdConsent,
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'login' ? 'Identificação' : 'Criar Nova Conta'}
      maxWidth="md"
    >
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
          Já sou cliente
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
          Primeira compra
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium border border-red-200">
          {errorMsg}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-2"
          >
            Acessar Conta
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <Input
            label="Nome Completo"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Maria Silva"
          />
          <Input
            label="E-mail"
            type="email"
            required
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
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
              label="WhatsApp / Celular"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input
            label="Criar Senha"
            type="password"
            required
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />

          {/* LGPD Consent */}
          <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200 mt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-neutral-600 leading-snug">
                Concordo com a coleta e tratamento dos meus dados pessoais para processamento e entrega de pedidos nos termos da <strong>LGPD (Lei nº 13.709/2018)</strong>.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-2"
          >
            Cadastrar e Continuar
          </Button>
        </form>
      )}
    </Modal>
  );
};
