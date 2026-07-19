import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Calendar, AlertCircle } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export default function FinancialDashboard({ vehicles }) {
  // 1. Calculations
  const totalVehiclesCount = vehicles.length;
  const activeCount = vehicles.filter(v => !v.isSold).length;
  const soldCount = vehicles.filter(v => v.isSold).length;

  // Purchase Calculations
  const totalAcquisition = vehicles.reduce((sum, v) => sum + (v.acquisitionPrice || 0), 0);
  const totalRepairs = vehicles.reduce((sum, v) => {
    const repairsCost = (v.repairs || []).reduce((rSum, r) => rSum + (r.price || 0), 0);
    return sum + repairsCost;
  }, 0);
  const totalInvested = totalAcquisition + totalRepairs;

  // Purchase Remaining Debt (Consignado)
  const purchaseDebt = vehicles.reduce((sum, v) => {
    if (v.purchaseMode !== 'installments') return sum;
    const tradeInVal = parseFloat(v.purchaseTradeInVal) || 0;
    const cashVal = parseFloat(v.purchaseCashVal) || 0;
    const installmentsPaid = parseInt(v.purchaseInstallmentsPaid) || 0;
    const installmentPrice = parseFloat(v.purchaseInstallmentPrice) || 0;
    
    const paid = tradeInVal + cashVal + (installmentsPaid * installmentPrice);
    const debt = Math.max(0, (v.acquisitionPrice || 0) - paid);
    return sum + debt;
  }, 0);

  // Sales Receivables & Profit
  const totalSalesRevenue = vehicles.reduce((sum, v) => {
    if (v.isSold) {
      const discount = parseFloat(v.saleDiscount) || 0;
      return sum + ((v.resalePrice || 0) - discount);
    } else {
      return sum + (v.resalePrice || 0); // Potential resale
    }
  }, 0);

  const saleDebt = vehicles.reduce((sum, v) => {
    if (!v.isSold || v.saleMode !== 'installments') return sum;
    const discount = parseFloat(v.saleDiscount) || 0;
    const finalPrice = (v.resalePrice || 0) - discount;
    const tradeInVal = parseFloat(v.saleTradeInVal) || 0;
    const cashVal = parseFloat(v.saleCashVal) || 0;
    const installmentsPaid = parseInt(v.saleInstallmentsPaid) || 0;
    const installmentPrice = parseFloat(v.saleInstallmentPrice) || 0;
    
    const received = tradeInVal + cashVal + (installmentsPaid * installmentPrice);
    const debt = Math.max(0, finalPrice - received);
    return sum + debt;
  }, 0);

  // Net Profit: Real (for sold) + Projected (for active)
  const totalProfit = vehicles.reduce((sum, v) => {
    const repairsCost = (v.repairs || []).reduce((rSum, r) => rSum + (r.price || 0), 0);
    const cost = (v.acquisitionPrice || 0) + repairsCost;
    
    if (v.isSold) {
      const discount = parseFloat(v.saleDiscount) || 0;
      const finalPrice = (v.resalePrice || 0) - discount;
      return sum + (finalPrice - cost);
    } else {
      return sum + ((v.resalePrice || 0) - cost);
    }
  }, 0);

  const marginPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight leading-none">
          📊 Painel Financeiro Consolidado
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1.5">
          Visão geral de investimentos, faturamento, saldo devedor e lucros reais
        </p>
      </div>

      {/* Metric Cards (iOS Glassmorphism style grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {/* Card 1: Total Invested */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-md">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Investimento Total</span>
            <span className="text-xl font-black text-white block">{formatCurrency(totalInvested)}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
              Aquisição ({formatCurrency(totalAcquisition)}) + Reparos ({formatCurrency(totalRepairs)})
            </span>
          </div>
          <div className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-md">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Faturamento (Vendido + Estoque)</span>
            <span className="text-xl font-black text-sky-400 block">{formatCurrency(totalSalesRevenue)}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
              {soldCount} vendidos e {activeCount} ativos em estoque
            </span>
          </div>
          <div className="h-10 w-10 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: profit */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-md">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Lucro Consolidado</span>
            <span className={`text-xl font-black block ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
              {formatCurrency(totalProfit)}
            </span>
            <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
              Retorno médio de {marginPercent.toFixed(1)}% sobre investimento
            </span>
          </div>
          <div className={`h-10 w-10 border rounded-2xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Purchase Debt (Supplier Payables) */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-md">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Contas a Pagar (Consignado)</span>
            <span className="text-xl font-black text-rose-400 block">{formatCurrency(purchaseDebt)}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
              Saldo pendente para fornecedores de veículos
            </span>
          </div>
          <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
            <ArrowDownRight className="h-5 w-5" />
          </div>
        </div>

        {/* Card 5: Sale Receivables (Client Debt) */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-md">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Contas a Receber (Vendas a Prazo)</span>
            <span className="text-xl font-black text-amber-400 block">{formatCurrency(saleDebt)}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">
              Saldo pendente a receber de compradores
            </span>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-450 text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Detailed Ledger List (One item per row, iOS details style) */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-xs font-headline font-black uppercase tracking-widest text-slate-350 border-b border-slate-800/80 pb-2">
          📑 Detalhamento Financeiro por Veículo
        </h3>

        {vehicles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Nenhum veículo cadastrado para listar movimentações financeiras.
          </div>
        ) : (
          <div className="space-y-3.5">
            {vehicles.map(v => {
              const repairsCost = (v.repairs || []).reduce((sum, r) => sum + (r.price || 0), 0);
              const cost = (v.acquisitionPrice || 0) + repairsCost;
              
              // Purchase mode detail
              const isPurchaseInstallments = v.purchaseMode === 'installments';
              const pTradeInVal = parseFloat(v.purchaseTradeInVal) || 0;
              const pCashVal = parseFloat(v.purchaseCashVal) || 0;
              const pInstallmentsPaid = parseInt(v.purchaseInstallmentsPaid) || 0;
              const pInstallmentPrice = parseFloat(v.purchaseInstallmentPrice) || 0;
              const pPaid = isPurchaseInstallments ? (pTradeInVal + pCashVal + (pInstallmentsPaid * pInstallmentPrice)) : v.acquisitionPrice || 0;
              const pDebt = isPurchaseInstallments ? Math.max(0, (v.acquisitionPrice || 0) - pPaid) : 0;

              // Sale mode detail
              const sDiscount = parseFloat(v.saleDiscount) || 0;
              const sPrice = v.isSold ? ((v.resalePrice || 0) - sDiscount) : (v.resalePrice || 0);
              const isSaleInstallments = v.isSold && v.saleMode === 'installments';
              const sTradeInVal = parseFloat(v.saleTradeInVal) || 0;
              const sCashVal = parseFloat(v.saleCashVal) || 0;
              const sInstallmentsPaid = parseInt(v.saleInstallmentsPaid) || 0;
              const sInstallmentPrice = parseFloat(v.saleInstallmentPrice) || 0;
              const sReceived = isSaleInstallments ? (sTradeInVal + sCashVal + (sInstallmentsPaid * sInstallmentPrice)) : sPrice;
              const sDebt = isSaleInstallments ? Math.max(0, sPrice - sReceived) : 0;

              const vProfit = sPrice - cost;

              return (
                <div key={v.id} className="p-4 bg-slate-950/40 border border-slate-855 rounded-2xl space-y-3 text-xs">
                  {/* Title & Plate */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-200 uppercase">{v.brand} {v.model}</span>
                      <span className="text-[9px] font-black text-slate-450 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{v.plate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                        v.isSold 
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                          : 'bg-sky-500/10 text-sky-450 border border-sky-500/20'
                      }`}>
                        {v.isSold ? 'Vendido' : 'Em Estoque'}
                      </span>
                    </div>
                  </div>

                  {/* Flow details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-slate-350">
                    {/* Compra */}
                    <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/60">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Aquisição</p>
                      <div className="flex justify-between mt-1 text-[10px]">
                        <span>Custo Total:</span>
                        <span className="font-bold text-slate-202">{formatCurrency(cost)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>Forma Compra:</span>
                        <span className="font-bold">{isPurchaseInstallments ? 'Consignado' : 'À Vista'}</span>
                      </div>
                      {isPurchaseInstallments && (
                        <div className="flex justify-between text-[10px] text-rose-400 font-bold border-t border-slate-900 pt-1 mt-1">
                          <span>Saldo Devedor:</span>
                          <span>{formatCurrency(pDebt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Venda */}
                    <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/60">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Venda / Negociação</p>
                      <div className="flex justify-between mt-1 text-[10px]">
                        <span>Preço Venda:</span>
                        <span className="font-bold text-sky-400">{formatCurrency(sPrice)}</span>
                      </div>
                      {v.isSold ? (
                        <>
                          <div className="flex justify-between text-[10px]">
                            <span>Forma Venda:</span>
                            <span className="font-bold">{v.saleMode === 'installments' ? 'A Prazo' : 'À Vista'}</span>
                          </div>
                          {v.saleMode === 'installments' && (
                            <div className="flex justify-between text-[10px] text-amber-400 font-bold border-t border-slate-900 pt-1 mt-1">
                              <span>A Receber:</span>
                              <span>{formatCurrency(sDebt)}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[9px] text-slate-500 italic mt-1">
                          Aguardando venda (Simulação ativa)
                        </div>
                      )}
                    </div>

                    {/* DRE result */}
                    <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/60 sm:col-span-2 md:col-span-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">DRE do Veículo</p>
                      <div className="flex justify-between mt-1 text-[10px]">
                        <span>Tipo de Lucro:</span>
                        <span className="font-bold">{v.isSold ? 'Lucro Líquido Real' : 'Lucro Projetado'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] border-t border-slate-900 pt-1 mt-1">
                        <span className="font-bold">Resultado:</span>
                        <span className={`font-black ${vProfit >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
                          {formatCurrency(vProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
