import React, { useState } from 'react';
import { Wrench, ShieldAlert, LayoutDashboard, Database, Menu, X, DollarSign } from 'lucide-react';
import { db } from '../services/db';

export default function Layout({ children, currentTab, setCurrentTab, onAddVehicleClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dbMode = db.getMode();
  const hasSupabase = db.isSupabaseAvailable();

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

  const handleAddClick = () => {
    onAddVehicleClick();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
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

        {/* Database indicator & footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Banco de Dados</span>
              <span className={`h-2 w-2 rounded-full ${dbMode === 'supabase' ? 'bg-emerald-500 animate-pulse' : 'bg-sky-400'}`}></span>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-200 leading-none">
                  {dbMode === 'supabase' ? 'Supabase Cloud' : 'Local (db.json)'}
                </p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 leading-none">
                  {dbMode === 'supabase' ? 'Produção Ativa' : 'Ambiente Local'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleDbMode}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-300 transition-all"
            >
              Alternar BD
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none">
              AUTOLIST v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0 md:hidden">
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

          {/* Mini info and Right-Side Menu Toggle */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">

            {/* Hamburger menu button for mobile (NOW MOVED TO THE RIGHT SIDE) */}
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
