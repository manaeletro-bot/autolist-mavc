import React, { useState } from 'react';
import { ArrowLeft, Save, Camera, X, Trash2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const getBase64SizeString = (base64Str) => {
  if (!base64Str) return '';
  if (!base64Str.startsWith('data:image')) return 'Nuvem';
  const sizeInBytes = Math.round((base64Str.length * 3) / 4);
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(0)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    color: vehicle?.color || '',
    plate: vehicle?.plate || '',
    chassis: vehicle?.chassis || '',
    km: vehicle?.km || '',
    fuelLevel: vehicle?.fuelLevel || '1/2',
    fuelType: vehicle?.fuelType || 'flex',
    acquisitionPrice: vehicle?.acquisitionPrice || '',
    resalePrice: vehicle?.resalePrice || '',
    maxDiscountPercent: vehicle?.maxDiscountPercent || 5, // Default 5%
    doors: vehicle?.doors || '4',
    occupants: vehicle?.occupants || '5',
    options: vehicle?.options || [],
    isSold: vehicle?.isSold || false,
    generalNotes: vehicle?.generalNotes || '',
    images: vehicle?.images || Array(12).fill(null),
    checklist: vehicle?.checklist || {},
    repairs: vehicle?.repairs || [],
    
    purchaseMode: vehicle?.purchaseMode || 'full', // 'full' | 'installments'
    purchaseTradeInDesc: vehicle?.purchaseTradeInDesc || '',
    purchaseTradeInVal: vehicle?.purchaseTradeInVal || '',
    purchaseCashVal: vehicle?.purchaseCashVal || '',
    purchaseInstallmentsTotal: vehicle?.purchaseInstallmentsTotal || '',
    purchaseInstallmentsPaid: vehicle?.purchaseInstallmentsPaid || '',
    purchaseInstallmentPrice: vehicle?.purchaseInstallmentPrice || '',
    
    // Previous Owner / Supplier
    previousOwner: vehicle?.previousOwner || '',
    
    // Additional Document & Debts Expenses
    docExpense: vehicle?.docExpense || '',
    finesExpense: vehicle?.finesExpense || '',
    payoffExpense: vehicle?.payoffExpense || '',
    otherExpenses: vehicle?.otherExpenses || '',
    transferInsuranceExpense: vehicle?.transferInsuranceExpense || '',
    customExpenses: vehicle?.customExpenses || []
  });

  const [loading, setLoading] = useState(false);
  const [compressingIdx, setCompressingIdx] = useState(null);
  const [compressSettings, setCompressSettings] = useState({
    maxDimension: 1024,
    quality: 0.7
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomExpense = () => {
    setFormData(prev => ({
      ...prev,
      customExpenses: [
        ...(prev.customExpenses || []),
        { id: Date.now().toString() + Math.random().toString(36).substring(2, 5), description: '', price: '' }
      ]
    }));
  };

  const handleCustomExpenseChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      customExpenses: (prev.customExpenses || []).map(item => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value
          };
        }
        return item;
      })
    }));
  };

  const handleRemoveCustomExpense = (id) => {
    setFormData(prev => ({
      ...prev,
      customExpenses: (prev.customExpenses || []).filter(item => item.id !== id)
    }));
  };

  const handleOptionToggle = (opt) => {
    setFormData(prev => {
      const current = prev.options || [];
      const updated = current.includes(opt)
        ? current.filter(o => o !== opt)
        : [...current, opt];
      return { ...prev, options: updated };
    });
  };

  const handleImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressingIdx(idx);
      try {
        // Compress image using HTML5 Canvas utility with user settings
        const compressedDataUrl = await compressImage(file, compressSettings.maxDimension, compressSettings.quality);
        const updated = [...formData.images];
        updated[idx] = compressedDataUrl;
        setFormData(prev => ({
          ...prev,
          images: updated
        }));
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Erro ao processar imagem: ' + err.message);
      } finally {
        setCompressingIdx(null);
      }
    }
  };

  const handleRemoveImage = (idx) => {
    const updated = [...formData.images];
    updated[idx] = null;
    setFormData(prev => ({
      ...prev,
      images: updated
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.plate) {
      alert('Por favor, preencha pelo menos a Marca, o Modelo e a Placa do veículo.');
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Profit simulations in form
  const aqPrice = parseFloat(formData.acquisitionPrice) || 0;
  const rsPrice = parseFloat(formData.resalePrice) || 0;
  
  const docExp = parseFloat(formData.docExpense) || 0;
  const finesExp = parseFloat(formData.finesExpense) || 0;
  const payoffExp = parseFloat(formData.payoffExpense) || 0;
  const otherExp = parseFloat(formData.otherExpenses) || 0;
  const transferInsuranceExp = parseFloat(formData.transferInsuranceExpense) || 0;
  const customExpensesList = formData.customExpenses || [];
  const customExpensesTotal = customExpensesList.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const totalExpenses = docExp + finesExp + payoffExp + otherExp + transferInsuranceExp + customExpensesTotal;

  const totalRepairs = (formData.repairs || []).reduce((sum, r) => sum + (r.price || 0), 0);
  const totalInvested = aqPrice + totalRepairs + totalExpenses;
  const potentialProfit = rsPrice - totalInvested;
  
  // Discount margins
  const maxDiscountVal = rsPrice * ((parseFloat(formData.maxDiscountPercent) || 0) / 100);
  const minSalePrice = rsPrice - maxDiscountVal;
  const profitAtMaxDiscount = minSalePrice - totalInvested;

  // Purchase calculations
  const purchaseTradeInVal = parseFloat(formData.purchaseTradeInVal) || 0;
  const purchaseCashVal = parseFloat(formData.purchaseCashVal) || 0;
  const purchaseInstallmentsPaid = parseInt(formData.purchaseInstallmentsPaid) || 0;
  const purchaseInstallmentPrice = parseFloat(formData.purchaseInstallmentPrice) || 0;
  
  const purchaseTotalPaid = formData.purchaseMode === 'full'
    ? aqPrice
    : purchaseTradeInVal + purchaseCashVal + (purchaseInstallmentsPaid * purchaseInstallmentPrice);
  const purchaseDebt = Math.max(0, aqPrice - purchaseTotalPaid);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 w-10 border border-slate-800 bg-slate-900/40 hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-205 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight leading-none">
              {vehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
              {vehicle ? 'Atualize as especificações e os custos' : 'Insira as informações de aquisição e vistorias'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 bg-sky-500 hover:bg-sky-650 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/10 transition-all flex items-center gap-2 active:scale-95"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Salvando...' : 'Salvar Veículo'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Col 1: Basic Specifications (Stacked: 1 field per line) */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400 border-b border-slate-800/80 pb-3">
            📋 Ficha Técnica do Veículo
          </h3>

          <div className="space-y-4">
            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: Chevrolet"
                required
              />
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: Onix 1.0"
                required
              />
            </div>

            {/* Year Model */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ano Modelo</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: 2020 / 2021"
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Cor</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: Prata"
              />
            </div>

            {/* Plate */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Placa</label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-black text-white uppercase placeholder-slate-650 tracking-widest text-center"
                placeholder="BRA2E19"
                required
              />
            </div>

            {/* Odometer (KM) */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Quilometragem (KM)</label>
              <input
                type="number"
                name="km"
                value={formData.km}
                onFocus={(e) => e.target.select()}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-855 border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: 78000"
              />
            </div>

            {/* Chassis */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Chassi</label>
              <input
                type="text"
                name="chassis"
                value={formData.chassis}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650 uppercase"
                placeholder="Opcional"
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Combustível</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
              >
                <option value="flex">Flex</option>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="eletrico">100% Elétrico</option>
                <option value="hibrido">Híbrido</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Fuel Level */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Nível do Combustível</label>
              <select
                name="fuelLevel"
                value={formData.fuelLevel}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
              >
                <option value="Reserva">Reserva (E)</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="3/4">3/4</option>
                <option value="Cheio">Cheio (F)</option>
                <option value="100%">100% (Bateria/EV)</option>
              </select>
            </div>

            {/* Doors */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Nº de Portas</label>
              <select
                name="doors"
                value={formData.doors}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
              >
                <option value="2">2 Portas</option>
                <option value="3">3 Portas</option>
                <option value="4">4 Portas</option>
                <option value="5">5 Portas</option>
              </select>
            </div>

            {/* Occupants Capacity */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Capacidade (Ocupantes)</label>
              <select
                name="occupants"
                value={formData.occupants}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-855 border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
              >
                <option value="2">2 Pessoas</option>
                <option value="4">4 Pessoas</option>
                <option value="5">5 Pessoas</option>
                <option value="7">7 Pessoas</option>
                <option value="8">8+ Pessoas</option>
              </select>
            </div>

            {/* Option Checkboxes (1 per line inside scroll area) */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Opcionais do Veículo</label>
              <div className="flex flex-col gap-2 p-3 bg-slate-950 border border-slate-850 rounded-xl max-h-[140px] overflow-y-auto">
                {[
                  'Ar Condicionado',
                  'Direção Hidráulica',
                  'Direção Elétrica',
                  'Vidros Elétricos',
                  'Travas Elétricas',
                  'Alarme',
                  'Freio ABS',
                  'Airbags',
                  'Tração 4x4',
                  'Central Multimídia',
                  'Painel Digital'
                ].map(opt => {
                  const isChecked = (formData.options || []).includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-350 hover:text-slate-100 transition-colors py-0.5 border-b border-slate-900 last:border-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleOptionToggle(opt)}
                        className="rounded bg-slate-900 border-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Anotações Iniciais / Detalhes de Entrada</label>
              <textarea
                name="generalNotes"
                value={formData.generalNotes}
                onChange={handleChange}
                className="w-full h-20 p-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650 resize-none"
                placeholder="Ex: Observações do comprador, barulho na suspensão notado..."
              />
            </div>
          </div>
        </div>

        {/* Col 2: Financial Strategy & Margins */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <h3 className="text-xs font-headline font-black uppercase tracking-widest text-emerald-400 border-b border-slate-800/80 pb-3">
            💸 Investimento & Revenda
          </h3>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor de Aquisição (R$)</label>
              <input
                type="number"
                name="acquisitionPrice"
                value={formData.acquisitionPrice}
                onFocus={(e) => e.target.select()}
                onChange={handlePriceChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-black text-emerald-450 text-emerald-400 placeholder-slate-650"
                placeholder="Ex: 45000"
              />
            </div>

            {/* Previous Owner Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Nome do Proprietário Antigo (Fornecedor)</label>
              <input
                type="text"
                name="previousOwner"
                value={formData.previousOwner}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                placeholder="Ex: Carlos Eduardo"
              />
            </div>

            {/* Purchase Mode Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tipo de Aquisição (Pagamento)</label>
              <select
                name="purchaseMode"
                value={formData.purchaseMode}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
              >
                <option value="full">À Vista (Total Pago)</option>
                <option value="installments">Consignado / Pago em Etapas</option>
              </select>
            </div>

            {/* Installments purchase fields */}
            {formData.purchaseMode === 'installments' && (
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4 animate-fade-in text-xs">
                <p className="text-[8.5px] font-black text-amber-400 uppercase tracking-wider">
                  ⚠️ Detalhes do Pagamento Consignado
                </p>

                {/* Trade-in Description */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Descrição da Troca / Outro Veículo</label>
                  <input
                    type="text"
                    name="purchaseTradeInDesc"
                    value={formData.purchaseTradeInDesc}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-650"
                    placeholder="Ex: Fiat Uno 2010"
                  />
                </div>

                {/* Trade-in Value */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor Pago como Troca (R$)</label>
                  <input
                    type="number"
                    name="purchaseTradeInVal"
                    value={formData.purchaseTradeInVal}
                    onFocus={(e) => e.target.select()}
                    onChange={handlePriceChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    placeholder="0"
                  />
                </div>

                {/* Cash/Entry Paid */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor Pago em Dinheiro (Entrada) (R$)</label>
                  <input
                    type="number"
                    name="purchaseCashVal"
                    value={formData.purchaseCashVal}
                    onFocus={(e) => e.target.select()}
                    onChange={handlePriceChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    placeholder="0"
                  />
                </div>

                {/* Total Installments */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total de Parcelas Devidas</label>
                  <input
                    type="number"
                    name="purchaseInstallmentsTotal"
                    value={formData.purchaseInstallmentsTotal}
                    onFocus={(e) => e.target.select()}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    placeholder="0"
                  />
                </div>

                {/* Installment Value */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor de Cada Parcela (R$)</label>
                  <input
                    type="number"
                    name="purchaseInstallmentPrice"
                    value={formData.purchaseInstallmentPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={handlePriceChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    placeholder="0"
                  />
                </div>

                {/* Paid Installments */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Parcelas Quitadas / Pagas</label>
                  <input
                    type="number"
                    name="purchaseInstallmentsPaid"
                    value={formData.purchaseInstallmentsPaid}
                    onFocus={(e) => e.target.select()}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    placeholder="0"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-900 text-[10px]">
                  <div className="flex justify-between">
                    <span>Total Pago Compra:</span>
                    <span className="font-bold text-emerald-450">{formatCurrency(purchaseTotalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Devedor Compra:</span>
                    <span className="font-black text-rose-400">{formatCurrency(purchaseDebt)}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Outras Despesas / Débitos na Aquisição */}
            <div className="p-4 md:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-4 text-xs shadow-sm">
              <p className="text-xs font-headline font-black text-emerald-700 uppercase tracking-wider border-b border-slate-200 pb-2.5">
                📄 Débitos & Documentação Pendente
              </p>

              {/* Payoff / Financing payoff */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Quitação de Financiamento (R$)</label>
                <input
                  type="number"
                  name="payoffExpense"
                  value={formData.payoffExpense}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePriceChange}
                  className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                  placeholder="Ex: 15000"
                />
              </div>

              {/* Fines */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Multas Pendentes (R$)</label>
                <input
                  type="number"
                  name="finesExpense"
                  value={formData.finesExpense}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePriceChange}
                  className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                  placeholder="Ex: 850"
                />
              </div>

              {/* Documentation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Documentação e Transferência (R$)</label>
                <input
                  type="number"
                  name="docExpense"
                  value={formData.docExpense}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePriceChange}
                  className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                  placeholder="Ex: 1200"
                />
              </div>

              {/* Other Expenses */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Outras Despesas de Doc (R$)</label>
                <input
                  type="number"
                  name="otherExpenses"
                  value={formData.otherExpenses}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePriceChange}
                  className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                  placeholder="Ex: 500"
                />
              </div>

              {/* Transfer & Insurance */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Débitos de Transferência e Seguro (R$)</label>
                <input
                  type="number"
                  name="transferInsuranceExpense"
                  value={formData.transferInsuranceExpense}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePriceChange}
                  className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                  placeholder="Ex: 600"
                />
              </div>

              {/* Custom Expenses List */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Outros Débitos Personalizados</label>
                  <button
                    type="button"
                    onClick={handleAddCustomExpense}
                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm"
                  >
                    + Novo Débito
                  </button>
                </div>

                {(formData.customExpenses || []).map((item) => (
                  <div key={item.id} className="flex gap-2 items-center animate-fade-in">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleCustomExpenseChange(item.id, 'description', e.target.value)}
                      placeholder="Descrição (ex: IPVA Atrasado)"
                      className="flex-1 h-9 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleCustomExpenseChange(item.id, 'price', e.target.value)}
                      placeholder="Valor (R$)"
                      className="w-28 h-9 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomExpense(item.id)}
                      className="h-9 w-9 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preço Estimado de Revenda (R$)</label>
              <input
                type="number"
                name="resalePrice"
                value={formData.resalePrice}
                onFocus={(e) => e.target.select()}
                onChange={handlePriceChange}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-black text-sky-400 placeholder-slate-650"
                placeholder="Ex: 55000"
              />
            </div>

            <div className="space-y-2 border-t border-slate-850/80 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Margem Máxima de Desconto</label>
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {formData.maxDiscountPercent}%
                </span>
              </div>
              <input
                type="range"
                name="maxDiscountPercent"
                min="0"
                max="25"
                step="1"
                value={formData.maxDiscountPercent}
                onChange={handleChange}
                className="w-full h-2 rounded-lg bg-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                <span>0% de desconto</span>
                <span>25% máximo</span>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-3 shadow-inner">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
                Simulação da Margem
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Investido (Aquisição):</span>
                  <span className="font-bold text-slate-205">{formatCurrency(aqPrice)}</span>
                </div>
                {totalRepairs > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Previsão de Reparos:</span>
                    <span className="font-bold text-slate-200">{formatCurrency(totalRepairs)}</span>
                  </div>
                )}
                {totalExpenses > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Débitos & Despesas Doc:</span>
                    <span className="font-bold text-rose-400">{formatCurrency(totalExpenses)}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-bold">Investimento Total:</span>
                  <span className="font-bold text-white">{formatCurrency(totalInvested)}</span>
                </div>

                {formData.purchaseMode === 'installments' && (
                  <div className="flex justify-between text-rose-400 font-bold border-b border-slate-900 pb-2">
                    <span>Saldo Devedor Compra:</span>
                    <span>{formatCurrency(purchaseDebt)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Lucro Alvo (Cheio):</span>
                  <span className={`font-black ${potentialProfit >= 0 ? 'text-emerald-450 text-emerald-450' : 'text-rose-455 text-rose-400'}`}>
                    {formatCurrency(potentialProfit)}
                  </span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-900/60">
                  <span className="text-slate-400">Desconto Máximo ({formData.maxDiscountPercent}%):</span>
                  <span className="font-bold text-amber-400">{formatCurrency(maxDiscountVal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Mínimo de Venda (C/ Desc):</span>
                  <span className="font-black text-white">{formatCurrency(minSalePrice)}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-900">
                  <span className="text-slate-400 font-bold">Lucro Mínimo Assegurado:</span>
                  <span className={`font-black text-sm ${profitAtMaxDiscount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(profitAtMaxDiscount)}
                  </span>
                </div>

                {profitAtMaxDiscount <= 0 && rsPrice > 0 && (
                  <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-400 rounded-xl uppercase tracking-wider text-center">
                    ⚠️ Alerta: Margem de desconto gera prejuízo!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Vehicle Images */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400">
              📸 Fotos do Veículo
            </h3>
            <div className="flex gap-1.5 text-[9px] font-bold text-slate-500">
              <select
                value={compressSettings.maxDimension}
                onChange={(e) => setCompressSettings(prev => ({ ...prev, maxDimension: parseInt(e.target.value) }))}
                className="bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none text-[8px] font-black uppercase"
                title="Resolução máxima da imagem"
              >
                <option value="800">800px</option>
                <option value="1024">1024px</option>
                <option value="1200">1200px</option>
              </select>
              <select
                value={compressSettings.quality}
                onChange={(e) => setCompressSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none text-[8px] font-black uppercase"
                title="Qualidade da compressão"
              >
                <option value="0.5">50%</option>
                <option value="0.7">70%</option>
                <option value="0.85">85%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.images.map((img, idx) => (
              <div 
                key={idx} 
                className="aspect-[4/3] bg-slate-950/70 border border-slate-850 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center hover:border-slate-700 transition-all shadow-inner"
              >
                {img ? (
                  <>
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded-md text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                      {getBase64SizeString(img)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : compressingIdx === idx ? (
                  <div className="flex flex-col items-center justify-center gap-2 animate-pulse">
                    <div className="h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[8px] font-black uppercase text-sky-400 tracking-wider">
                      Comprimindo...
                    </span>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                    <Camera className="h-5 w-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mt-1.5 group-hover:text-slate-400 transition-colors">
                      {idx === 0 ? 'Foto Principal' : `Foto ${idx + 1}`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(idx, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed text-center">
            As imagens são salvas localmente como strings compactadas. Para melhor desempenho, utilize fotos leves.
          </p>
        </div>
      </div>
    </form>
  );
}
