import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      onClose();
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      {/* Abas Alternáveis */}
      <div className="flex border-b border-neutral-200 -mt-2 mb-6">
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
          Entrar na Conta
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
          Criar Nova Conta
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

          <p className="text-center text-xs text-neutral-500 pt-2">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={() => setTab('register')}
              className="text-brand-700 font-semibold hover:underline"
            >
              Cadastre-se rapidamente
            </button>
          </p>
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

          {/* Consentimento LGPD */}
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
            Concluir Cadastro
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Seus dados são protegidos com criptografia Argon2id</span>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AuthModal;
