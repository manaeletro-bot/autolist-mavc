import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { db } from '../services/db';
import { Users, Shield, Store, UserCheck, UserX, Trash2, Search, RefreshCw, Car, ShieldAlert } from 'lucide-react';

export function AdminPortal({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await authService.getAllUsers();
      const allVehicles = await db.getVehicles();
      setUsers(allUsers);
      setVehicles(allVehicles || []);
    } catch (e) {
      console.error('Erro ao carregar dados do gestor:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (confirm(`Deseja alterar o status de ${user.name} para ${newStatus === 'active' ? 'ATIVO' : 'SUSPENSO'}?`)) {
      await authService.updateUserStatus(user.id, newStatus);
      loadData();
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (confirm(`Deseja alterar o nível de acesso de ${user.name} para ${newRole === 'admin' ? 'GESTOR ADMIN' : 'LOJISTA'}?`)) {
      await authService.updateUserRole(user.id, newRole);
      loadData();
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode excluir a sua própria conta de gestor ativa.');
      return;
    }
    if (confirm(`ATENÇÃO: Deseja realmente excluir permanentemente a conta de ${user.name} (${user.email})?`)) {
      await authService.deleteUser(user.id);
      loadData();
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.storeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              Portal do Gestor - Administração Multi-Tenant
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Gerencie usuários, permissões e monitore os estoques cadastrados
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider text-slate-200 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lojistas</span>
            <p className="text-xl font-headline font-black text-white">{users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contas Ativas</span>
            <p className="text-xl font-headline font-black text-emerald-400">{activeUsersCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contas Suspensas</span>
            <p className="text-xl font-headline font-black text-red-400">{suspendedUsersCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Veículos Cadastrados</span>
            <p className="text-xl font-headline font-black text-white">{vehicles.length}</p>
          </div>
        </div>

      </div>

      {/* Users Table Controls */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-sm font-headline font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-400" />
            Contas de Usuários Cadastradas
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, loja ou e-mail..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-widest font-black text-[9px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuário & Revenda</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4 text-center">Nível de Acesso</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Data de Registro</th>
                <th className="py-3 px-4 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userVehiclesCount = vehicles.filter(v => v.user_id === u.id).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-slate-800 rounded-xl flex items-center justify-center font-black text-sky-400 uppercase border border-slate-700">
                            {u.name ? u.name.substring(0, 2) : 'LO'}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-none">{u.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 flex items-center gap-1">
                              <Store className="h-3 w-3" /> {u.storeName || 'Sem Loja'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role === 'admin' ? 'Gestor Admin' : 'Lojista'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-400 text-[10px] font-bold">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? 'Suspender Usuário' : 'Ativar Usuário'}
                          className={`p-2 rounded-lg transition-all border ${
                            u.status === 'active'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir Usuário"
                          className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 rounded-lg transition-all"
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

    </div>
  );
}
