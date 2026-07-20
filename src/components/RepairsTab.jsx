import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export default function RepairsTab({ repairs, acquisitionPrice, resalePrice, onChange, readOnly = false }) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('pending');

  const handleAddRepair = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!description.trim() || !price) {
      alert('Preencha a descrição do conserto e o preço.');
      return;
    }

    const newRepair = {
      id: Date.now(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      status,
      date: new Date().toISOString()
    };

    onChange([...repairs, newRepair]);
    
    setDescription('');
    setPrice('');
    setStatus('pending');
  };

  const handleRemoveRepair = (id) => {
    if (readOnly) return;
    const updated = repairs.filter(r => r.id !== id);
    onChange(updated);
  };

  const handleUpdateStatus = (id, newStatus) => {
    if (readOnly) return;
    const updated = repairs.map(r => r.id === id ? { ...r, status: newStatus } : r);
    onChange(updated);
  };

  const handleUpdatePrice = (id, newPrice) => {
    if (readOnly) return;
    const updated = repairs.map(r => r.id === id ? { ...r, price: parseFloat(newPrice) || 0 } : r);
    onChange(updated);
  };

  // Calculations
  const totalRepairs = repairs.reduce((sum, r) => sum + (r.price || 0), 0);
  const totalInvested = (acquisitionPrice || 0) + totalRepairs;
  const netProfit = (resalePrice || 0) - totalInvested;
  const returnMargin = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Financial Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sum of repairs */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Soma Automática de Reparos</p>
          <h3 className="text-xl font-headline font-black text-amber-400 mt-1">{formatCurrency(totalRepairs)}</h3>
          <p className="text-[8.5px] text-slate-500 font-bold uppercase">
            De {repairs.length} conserto{repairs.length !== 1 ? 's' : ''} cadastrado{repairs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Investment */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Investimento Total Acumulado</p>
          <h3 className="text-xl font-headline font-black text-white mt-1">{formatCurrency(totalInvested)}</h3>
          <p className="text-[8.5px] text-slate-500 font-bold uppercase">
            Aquisição ({formatCurrency(acquisitionPrice)}) + Reparos
          </p>
        </div>

        {/* Profitability Result */}
        <div className="p-4 md:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Lucro Atual Líquido</p>
          <h3 className={`text-xl font-headline font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <p className="text-[8.5px] text-slate-500 font-bold uppercase">
            Margem de retorno: {returnMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Grid: Add form & Repairs list */}
      <div className={`grid grid-cols-1 ${readOnly ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        
        {/* Quick Add Form */}
        {!readOnly && (
          <div className="glass-card p-5 md:p-6 rounded-2xl border border-slate-800 h-fit space-y-4">
            <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400 border-b border-slate-800/80 pb-2">
              ➕ Adicionar Conserto
            </h3>
            
            <form onSubmit={handleAddRepair} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Descrição / Serviço</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                  placeholder="Ex: Troca de pastilhas de freio"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preço (R$)</label>
                  <input
                    type="number"
                    value={price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-black text-emerald-400 placeholder-slate-650"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in-progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Adicionar Conserto
              </button>
            </form>
          </div>
        )}

        {/* Repairs List */}
        <div className={readOnly ? 'space-y-4' : 'lg:col-span-2 space-y-4'}>
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-xs font-headline font-black uppercase tracking-widest text-slate-400">
              📋 Lista de Gastos
            </h3>
            <span className="text-[9px] font-black uppercase bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {repairs.length} Itens
            </span>
          </div>

          {repairs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-850 rounded-2xl text-xs font-bold bg-slate-950/10">
              Nenhum reparo cadastrado ainda para este veículo.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
              {repairs.map(repair => (
                <div 
                  key={repair.id}
                  className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Status Indicator & Desc */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (readOnly) return;
                        const next = repair.status === 'completed' ? 'pending' : repair.status === 'pending' ? 'in-progress' : 'completed';
                        handleUpdateStatus(repair.id, next);
                      }}
                      disabled={readOnly}
                      className="shrink-0 transition-colors disabled:opacity-50"
                      title="Alterar Status"
                    >
                      {repair.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : repair.status === 'in-progress' ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold text-slate-200 uppercase truncate ${repair.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                        {repair.description}
                      </h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">
                        Adicionado em: {new Date(repair.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Price Edit & Delete Actions (Stretchable on mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-850/60 pt-3 sm:pt-0 sm:border-0">
                    <span className="text-[8px] font-black text-slate-500 uppercase sm:hidden">Valor Cobrado</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-500">R$</span>
                        <input
                          type="number"
                          value={repair.price === 0 ? '' : repair.price}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleUpdatePrice(repair.id, e.target.value)}
                          disabled={readOnly}
                          className="w-24 h-8 pl-6 pr-2 bg-slate-950 border border-slate-850 focus:border-slate-750 focus:outline-none rounded-lg text-xs font-bold text-white text-right disabled:opacity-70"
                        />
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRepair(repair.id)}
                          className="h-8 w-8 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg flex items-center justify-center transition-colors shrink-0"
                          title="Remover Gasto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
