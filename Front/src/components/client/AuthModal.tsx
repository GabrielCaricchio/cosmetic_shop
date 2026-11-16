import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

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
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'E-mail ou senha inválidos.');
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
      setErrorMsg(err.response?.data?.message || err.response?.data?.detail || 'Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'login' ? 'Identificação do Cliente' : 'Cadastre-se na Aura'}
      maxWidth="md"
    >
      <div className="flex border-b border-warm-200 mb-6">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setErrorMsg('');
          }}
          className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            tab === 'login'
              ? 'border-botanic-800 text-botanic-950'
              : 'border-transparent text-warm-400 hover:text-warm-700'
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
          className={`flex-1 pb-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            tab === 'register'
              ? 'border-botanic-800 text-botanic-950'
              : 'border-transparent text-warm-400 hover:text-warm-700'
          }`}
        >
          Primeira compra
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-2xl bg-terracotta-50 p-3.5 text-xs text-terracotta-700 font-medium border border-terracotta-200">
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
            placeholder="seu.email@exemplo.com"
          />
          <Input
            label="Senha de Acesso"
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-botanic-900 to-botanic-950 text-champagne-300 font-bold py-3.5 mt-2 rounded-2xl shadow-soft"
          >
            Acessar Minha Conta
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <Input
            label="Nome Completo"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Camila Albuquerque"
          />
          <Input
            label="E-mail"
            type="email"
            required
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
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
            label="Criar Senha"
            type="password"
            required
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />

          <div className="rounded-2xl bg-warm-50 p-3 border border-warm-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-warm-300 text-botanic-900 focus:ring-botanic-700"
              />
              <span className="text-[11px] text-warm-700 leading-snug">
                Concordo com os Termos e com o tratamento dos meus dados para compra de acordo com a LGPD.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-botanic-900 to-botanic-950 text-champagne-300 font-bold py-3.5 mt-2 rounded-2xl shadow-soft"
          >
            Concluir Cadastro & Acessar
          </Button>
        </form>
      )}
    </Modal>
  );
};
