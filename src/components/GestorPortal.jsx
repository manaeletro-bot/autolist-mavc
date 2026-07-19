import React, { useState, useEffect } from 'react';
import { authService, calculateExpirationDate } from '../services/authService';
import { db } from '../services/db';
import { Shield, Users, UserCheck, UserX, Clock, Calendar, CheckCircle2, AlertTriangle, Key, LogOut, ArrowLeft, Plus, Search, Trash2, Award, Zap, Lock, Mail, Store, User } from 'lucide-react';

export function GestorPortal() {
  const [gestorSession, setGestorSession] = useState(() => authService.getGestorSession());
  const [loginForm, setLoginForm] = useState({ email: 'gestor@autolist.com', password: 'gestor2026' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados do portal
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all'); // all, active, suspended, test_3d, lifetime

  // Modais
  const [selectedUserForPlan, setSelectedUserForPlan] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    storeName: '',
    email: '',
    password: '',
    planType: 'test_3d'
  });
  const [addUserError, setAddUserError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await authService.getAllUsers();
      const allVehicles = await db.getVehicles();
      setUsers(allUsers || []);
      setVehicles(allVehicles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gestorSession) {
      loadData();
    }
  }, [gestorSession]);

  const handleGestorLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const session = await authService.gestorLogin(loginForm.email, loginForm.password);
      setGestorSession(session);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGestorLogout = () => {
    authService.gestorLogout();
    setGestorSession(null);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (confirm(`Deseja alterar o status da conta de ${user.name} para ${newStatus === 'active' ? 'ATIVO' : 'SUSPENSO'}?`)) {
      await authService.updateUserStatus(user.id, newStatus);
      loadData();
    }
  };

  const handleUpdatePlan = async (userId, planType) => {
    await authService.updateUserPlan(userId, planType);
    setSelectedUserForPlan(null);
    loadData();
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`ATENÇÃO: Deseja realmente excluir permanentemente a conta de ${user.name} (${user.email})?`)) {
      await authService.deleteUser(user.id);
      loadData();
    }
  };

  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    try {
      if (!newUserForm.name || !newUserForm.email) {
        throw new Error('Informe pelo menos o nome e o e-mail do lojista.');
      }
      await authService.createUserByGestor(newUserForm);
      setShowAddUserModal(false);
      setNewUserForm({ name: '', storeName: '', email: '', password: '', planType: 'test_3d' });
      loadData();
      alert('Novo lojista cadastrado com sucesso no sistema!');
    } catch (err) {
      setAddUserError(err.message);
    }
  };

  const getDaysRemaining = (planExpiresAt) => {
    if (!planExpiresAt) return null;
    const diff = new Date(planExpiresAt) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // --- TELA DE LOGIN DO GESTOR ---
  if (!gestorSession) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 font-sans relative">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <div className="p-6 bg-slate-950/80 border-b border-slate-800 text-center relative">
            <div className="h-16 w-16 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10 mb-3">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              PORTAL DO GESTOR <span className="text-amber-400">• MAVC</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              Painel de Administração Master (`/gestor`)
            </p>
          </div>

          <form onSubmit={handleGestorLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Usuário / E-mail Master *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="gestor@autolist.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Senha Master de Acesso *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Acessando Portal...</span>
              ) : (
                <>
                  <Key className="h-4 w-4" /> Entrar no Painel do Gestor
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-800 text-center">
              <a
                href="/"
                className="text-[10px] text-slate-400 hover:text-sky-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o Site do Lojista (`/`)
              </a>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // --- PAINEL PRINCIPAL DO GESTOR (/gestor) ---
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.storeName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterPlan === 'active') return u.status === 'active';
    if (filterPlan === 'suspended') return u.status === 'suspended';
    if (filterPlan === 'test_3d') return u.plan === 'test_3d';
    if (filterPlan === 'lifetime') return u.plan === 'lifetime';
    return true;
  });

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const testCount = users.filter(u => u.plan === 'test_3d').length;
  const lifetimeCount = users.filter(u => u.plan === 'lifetime').length;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans p-4 md:p-8 space-y-6">
      
      {/* Top Header do Gestor */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
                AUTOLIST MAVC • PORTAL DO GESTOR
              </h1>
              <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                ADMIN MASTER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Painel independente de controle de lojistas, assinaturas e licenças (`/gestor`)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Lojista
          </button>

          <a
            href="/"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-black uppercase tracking-wider text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Site Lojista (`/`)
          </a>

          <button
            onClick={handleGestorLogout}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all"
            title="Sair do Gestor"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lojistas</span>
            <p className="text-2xl font-headline font-black text-white">{users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contas Ativas</span>
            <p className="text-2xl font-headline font-black text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Em Teste (3 Dias)</span>
            <p className="text-2xl font-headline font-black text-purple-400">{testCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Licenças Vitalícias</span>
            <p className="text-2xl font-headline font-black text-amber-400">{lifetimeCount}</p>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterPlan('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterPlan === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setFilterPlan('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterPlan === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Ativos ({activeCount})
            </button>
            <button
              onClick={() => setFilterPlan('suspended')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterPlan === 'suspended' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Suspensos ({suspendedCount})
            </button>
            <button
              onClick={() => setFilterPlan('test_3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterPlan === 'test_3d' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Teste 3d ({testCount})
            </button>
            <button
              onClick={() => setFilterPlan('lifetime')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                filterPlan === 'lifetime' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Vitalício ({lifetimeCount})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar lojista, revenda ou e-mail..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Lojistas Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-widest font-black text-[9px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Lojista & Revenda</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Plano / Licença</th>
                <th className="py-3.5 px-4 text-center">Validade / Dias Restantes</th>
                <th className="py-3.5 px-4 text-right">Ações do Gestor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-bold uppercase tracking-wider">
                    Nenhum lojista encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const daysRemaining = getDaysRemaining(u.planExpiresAt);
                  const isExpired = daysRemaining !== null && daysRemaining <= 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-slate-800 rounded-xl flex items-center justify-center font-black text-amber-400 uppercase border border-slate-700">
                            {u.name ? u.name.substring(0, 2) : 'LO'}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-none">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                              <Store className="h-3 w-3 text-slate-500" /> {u.storeName || 'Sem Loja'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-300">
                        {u.email}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          u.plan === 'lifetime'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : u.plan === 'yearly'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : u.plan === 'monthly'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        }`}>
                          {u.plan === 'lifetime' && <Award className="h-3 w-3" />}
                          {u.plan === 'yearly' && <Calendar className="h-3 w-3" />}
                          {u.plan === 'monthly' && <CheckCircle2 className="h-3 w-3" />}
                          {u.plan === 'test_3d' && <Clock className="h-3 w-3" />}
                          {u.plan === 'lifetime' ? 'Vitalício' : u.plan === 'yearly' ? 'Plano Anual (1 Ano)' : u.plan === 'monthly' ? 'Plano Mensal (30 Dias)' : 'Teste (3 Dias)'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {u.plan === 'lifetime' ? (
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                            ♾️ Sem Expiração
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Expirado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300">
                            {daysRemaining} dia(s) restante(s)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUserForPlan(u)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Alterar Plano
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? 'Suspender Usuário' : 'Ativar Usuário'}
                          className={`p-2 rounded-xl transition-all border ${
                            u.status === 'active'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir Lojista"
                          className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: Alterar Licença / Plano do Lojista */}
      {selectedUserForPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-headline font-black uppercase text-white">Alterar Licença do Lojista</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedUserForPlan.name} ({selectedUserForPlan.storeName})</p>
              </div>
              <button onClick={() => setSelectedUserForPlan(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">Selecione o plano desejado para liberar ou renovar o acesso deste lojista:</p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdatePlan(selectedUserForPlan.id, 'test_3d')}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Teste de 3 Dias</p>
                    <p className="text-[10px] text-slate-400">Libera acesso temporário por 72 horas</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdatePlan(selectedUserForPlan.id, 'monthly')}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Plano Mensal (30 Dias)</p>
                    <p className="text-[10px] text-slate-400">Assinatura mensal para revenda</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdatePlan(selectedUserForPlan.id, 'yearly')}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Plano Anual (365 Dias)</p>
                    <p className="text-[10px] text-slate-400">Assinatura anual completa de 1 ano</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUpdatePlan(selectedUserForPlan.id, 'lifetime')}
                className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-400 uppercase">Licença Vitalícia</p>
                    <p className="text-[10px] text-amber-200/70">Acesso permanente sem data de expiração</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Novo Lojista pelo Gestor */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-headline font-black uppercase text-white flex items-center gap-2">
                <User className="h-4 w-4 text-amber-400" /> Cadastrar Novo Lojista
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3">
              {addUserError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  {addUserError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Nome do Lojista *
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Ex: Roberto Lima"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Nome da Revenda / Loja
                </label>
                <input
                  type="text"
                  value={newUserForm.storeName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, storeName: e.target.value })}
                  placeholder="Ex: Lima Veículos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="roberto@limaveiculos.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Senha Inicial (Padrão: 123456)
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Plano / Licença Inicial
                </label>
                <select
                  value={newUserForm.planType}
                  onChange={(e) => setNewUserForm({ ...newUserForm, planType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="test_3d">⏱️ Período de Teste (3 Dias)</option>
                  <option value="monthly">📅 Plano Mensal (30 Dias)</option>
                  <option value="yearly">🗓️ Plano Anual (365 Dias)</option>
                  <option value="lifetime">♾️ Licença Vitalícia</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all mt-2"
              >
                Cadastrar Lojista
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
