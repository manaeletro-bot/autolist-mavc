import React, { useState, useEffect } from 'react';
import { Wrench, ShieldAlert, LayoutDashboard, Database, Menu, X, DollarSign, Shield, LogOut, User, Store, ArrowLeft } from 'lucide-react';
import { db } from '../services/db';
import { authService } from '../services/authService';
import { AuthModal } from './AuthModal';
import { SubscriptionLockModal } from './SubscriptionLockModal';

export default function Layout({ children, currentTab, setCurrentTab, onAddVehicleClick, onUserChange, selectedVehicle, onBackVehicle }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const dbMode = db.getMode();
  const hasSupabase = db.isSupabaseAvailable();
  const isLocked = currentUser && authService.isLocked(currentUser);

  const handleToggleDbMode = () => {
    try {
      if (dbMode === 'local') {
        if (!hasSupabase) {
          alert('Supabase não está configurado nas variáveis de ambiente (.env). Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar.');
          return;
        }
        db.setMode('supabase');
        alert('Modo de banco de dados alterado para Supabase Cloud!');
      } else {
        db.setMode('local');
        alert('Modo de banco de dados alterado para Local (db.json)!');
      }
      window.location.reload();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    if (onUserChange) onUserChange();
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (onUserChange) onUserChange();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* Modal de Autenticação se não houver usuário logado */}
      {!currentUser && (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Tela de Bloqueio por Expiração / Suspensão de Conta */}
      {currentUser && isLocked && (
        <SubscriptionLockModal user={currentUser} onLogout={handleLogout} />
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col justify-between shrink-0 transition-transform duration-300 md:relative md:left-auto md:right-auto md:border-r md:border-l-0 md:translate-x-0 md:bg-slate-900/60 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Logo / Header in Sidebar */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5 shrink-0">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xs font-headline font-black uppercase tracking-tight text-white leading-none">
                  AUTOLIST <span className="text-sky-400">-</span>
                </h1>
                <span className="text-xs font-headline font-black uppercase tracking-tight text-sky-400 leading-none mt-0.5">
                  MAVC
                </span>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Gestão & Vistoria
                </p>
              </div>
            </div>
            {/* Close button inside mobile menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden h-8 w-8 hover:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel Geral
            </button>

            <button
              onClick={() => handleNavClick('financial')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                currentTab === 'financial'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Financeiro
            </button>

          </nav>
        </div>

        {/* User Profile & Database indicator footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          
          {/* Indicador do BD */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Banco de Dados</span>
              <span className={`h-1.5 w-1.5 rounded-full ${dbMode === 'supabase' ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'}`}></span>
            </div>
            
            <div className="flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span>{dbMode === 'supabase' ? 'Supabase Cloud' : 'Local'}</span>
              </div>

              <button
                onClick={handleToggleDbMode}
                className="text-[8px] font-black uppercase tracking-wider text-sky-400 hover:underline"
              >
                Alternar
              </button>
            </div>
          </div>

          {/* Card do Usuário Logado / Trocar Usuário (EMBAIXO DO BANCO DE DADOS) */}
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-8 w-8 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl flex items-center justify-center shrink-0 font-black text-xs uppercase">
                    {currentUser.name ? currentUser.name.substring(0, 2) : 'US'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate mt-0.5 leading-none flex items-center gap-1">
                      <Store className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                      {currentUser.storeName || 'Lojista'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  {currentUser.role === 'admin' ? 'Gestor Admin' : 'Lojista'}
                </span>

                <span className="text-[8px] text-slate-500 font-bold uppercase truncate max-w-[100px]">
                  {currentUser.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair da Conta
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sessão de Usuário</span>
                <span className="text-[8px] text-amber-400 font-bold uppercase">Não Autenticado</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Entrar / Trocar Usuário
              </button>
            </div>
          )}

          <div className="text-center pt-1">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest leading-none">
              AUTOLIST v2.0 • MAVC
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0 md:hidden">
          {currentTab === 'details' && selectedVehicle ? (
            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
              <button
                onClick={onBackVehicle}
                className="h-9 w-9 border border-slate-800 bg-slate-950 hover:bg-slate-850 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all shrink-0 active:scale-95 shadow-sm"
                title="Voltar ao Painel"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap leading-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-sky-400">
                    {selectedVehicle.brand}
                  </span>
                  <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
                  <span className="text-[9px] font-black tracking-widest text-slate-300 uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {selectedVehicle.plate || 'SEM PLACA'}
                  </span>
                  {selectedVehicle.isSold && (
                    <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Vendido
                    </span>
                  )}
                </div>
                
                <h2 className="text-xs font-headline font-black uppercase text-white tracking-tight leading-tight truncate mt-0.5">
                  {selectedVehicle.model}
                </h2>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5 shrink-0">
                <Wrench className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xs font-headline font-black uppercase tracking-tight text-white leading-none">
                  AUTOLIST <span className="text-sky-400">-</span>
                </h1>
                <span className="text-xs font-headline font-black uppercase tracking-tight text-sky-400 leading-none mt-0.5">
                  MAVC
                </span>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Gestão & Vistoria
                </p>
              </div>
            </div>
          )}

          {/* Right-Side Menu Toggle */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden h-10 w-10 border border-slate-800 bg-slate-900/40 hover:bg-slate-850 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto h-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
