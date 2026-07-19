import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Wrench, LogIn, UserPlus, Shield, Store, Mail, Lock, User, AlertCircle } from 'lucide-react';

export function AuthModal({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
        if (formData.password.length < 4) {
          throw new Error('A senha deve conter no mínimo 4 caracteres.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }

        const newUser = await authService.register({
          name: formData.name,
          storeName: formData.storeName,
          email: formData.email,
          password: formData.password
        });

        onLoginSuccess(newUser);
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Informe o e-mail e a senha.');
        }

        const user = await authService.login(formData.email, formData.password);
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Erro ao realizar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLojistaLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.login('lojista@autolist.com', '123456');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.login('admin@autolist.com', 'admin123');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGestorLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.login('gestor@autolist.com', 'gestor2026');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Branding Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 text-center relative">
          <div className="h-14 w-14 bg-sky-500/10 rounded-2xl border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto shadow-lg shadow-sky-500/10 mb-3">
            <Wrench className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight">
            AUTOLIST <span className="text-sky-400">- MAVC</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Plataforma de Gestão & Vistoria Veicular
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 p-1">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
              !isRegisterMode
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
              isRegisterMode
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Criar Conta
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome da Revenda / Loja
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Ex: Andrade Multimarcas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              E-mail de Acesso *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Confirme a Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Processando...</span>
            ) : isRegisterMode ? (
              <>
                <UserPlus className="h-4 w-4" /> Cadastrar Minha Revenda
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Acessar Meu Estoque
              </>
            )}
          </button>

          {/* Atalhos rápidos para testes */}
          {!isRegisterMode && (
            <div className="pt-3 border-t border-slate-800 space-y-2 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Atalhos Rápidos para Teste</p>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleQuickLojistaLogin}
                  className="py-2 bg-slate-800 hover:bg-slate-750 text-sky-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-700 transition-all text-center"
                >
                  Lojista Teste
                </button>

                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-700 transition-all text-center"
                >
                  Admin Teste
                </button>

                <button
                  type="button"
                  onClick={handleQuickGestorLogin}
                  className="py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-700 transition-all text-center"
                >
                  Gestor Master
                </button>
              </div>

              <a
                href="/gestor"
                className="text-[10px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 pt-2 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" /> Ir para o Painel do Gestor (`/gestor`)
              </a>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
