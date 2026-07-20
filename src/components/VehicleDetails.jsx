import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Edit3, FileText, CheckSquare, DollarSign, BookOpen, Camera, Info, Save, CheckCircle, AlertTriangle, ChevronRight, ChevronDown, X, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ChecklistTab from './ChecklistTab';
import RepairsTab from './RepairsTab';
import { compressImage } from '../utils/imageCompressor';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const formatToBRL = (val) => {
  if (val === undefined || val === null || val === '') return '';
  let cleanVal = val.toString().replace(/R\$\s?/, '').trim();
  if (cleanVal === '') return '';
  if (cleanVal.includes(',') && cleanVal.includes('.')) {
    cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
  } else if (cleanVal.includes(',')) {
    cleanVal = cleanVal.replace(',', '.');
  }
  const num = parseFloat(cleanVal);
  if (isNaN(num)) return '';
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInteger},${decimalPart}`;
};

const parseFromBRL = (val) => {
  if (val === undefined || val === null || val === '') return '';
  let cleanVal = val.toString().replace(/R\$\s?/, '').trim();
  if (cleanVal.includes(',')) {
    cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
  }
  const num = parseFloat(cleanVal);
  if (isNaN(num)) return '';
  return num.toFixed(2);
};

const CurrencyInput = ({ value, onChange, className, placeholder, ...props }) => {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  React.useEffect(() => {
    if (!focused) {
      setLocalValue(formatToBRL(value));
    }
  }, [value, focused]);

  return (
    <input
      type="text"
      value={focused ? localValue : formatToBRL(localValue)}
      onFocus={(e) => {
        setFocused(true);
        setLocalValue(parseFromBRL(value));
        setTimeout(() => e.target.select(), 0);
      }}
      onBlur={(e) => {
        setFocused(false);
        const parsed = parseFromBRL(e.target.value);
        const formatted = formatToBRL(parsed);
        setLocalValue(formatted);
        onChange(parsed);
      }}
      onChange={(e) => {
        setLocalValue(e.target.value);
      }}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  );
};

const getBase64SizeString = (base64Str) => {
  if (!base64Str) return '';
  if (!base64Str.startsWith('data:image')) return 'Nuvem';
  const sizeInBytes = Math.round((base64Str.length * 3) / 4);
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(0)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function VehicleDetails({ vehicle, onBack, onEdit, onUpdateVehicle, onDeleteVehicle }) {
  const [activeTab, setActiveTab] = useState(null);
  const [notesText, setNotesText] = useState(vehicle.generalNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportScope, setExportScope] = useState('customer');

  // Sale Editor State
  const [isEditingSale, setIsEditingSale] = useState(false);

  // Debt Settlement State
  const [isSettlingDebt, setIsSettlingDebt] = useState(false);
  const [debtPaymentVal, setDebtPaymentVal] = useState('');
  const [debtPaymentMethod, setDebtPaymentMethod] = useState('pix');
  const [debtAmortizationOption, setDebtAmortizationOption] = useState('reduce_term'); // 'reduce_term' or 'reduce_value'
  const getInitialSaleData = (veh) => {
    let tradeIns = [];
    if (veh.saleTradeIns && Array.isArray(veh.saleTradeIns)) {
      tradeIns = veh.saleTradeIns.map((t, idx) => ({ id: t.id || idx, desc: t.desc || '', val: (t.val || '').toString() }));
    } else if (parseFloat(veh.saleTradeInVal) > 0) {
      tradeIns = [{ id: 1, desc: veh.saleTradeInDesc || 'Veículo de Troca', val: veh.saleTradeInVal.toString() }];
    }

    let payments = [];
    let installmentsTotal = '';
    let installmentsPaid = '';
    let installmentPrice = '';

    if (veh.salePayments && Array.isArray(veh.salePayments)) {
      // Filter out installments from payments list
      const inst = veh.salePayments.find(p => p.type === 'installments');
      if (inst) {
        installmentsTotal = (inst.installmentsTotal || '').toString();
        installmentsPaid = (inst.installmentsPaid || '').toString();
        installmentPrice = (inst.installmentPrice || '').toString();
      }
      payments = veh.salePayments
        .filter(p => p.type !== 'installments')
        .map((p, idx) => ({ id: p.id || idx, type: p.type || 'pix', val: (p.val || '').toString() }));
    } else {
      const mode = veh.saleMode || 'full';
      const cash = parseFloat(veh.saleCashVal) || 0;
      const instT = parseInt(veh.saleInstallmentsTotal) || 0;
      const instP = parseFloat(veh.saleInstallmentPrice) || 0;
      
      if (mode === 'installments') {
        if (cash > 0) {
          payments.push({ id: 1, type: 'cash', val: cash.toString() });
        }
        if (instT > 0) {
          installmentsTotal = instT.toString();
          installmentsPaid = (parseInt(veh.saleInstallmentsPaid) || 0).toString();
          installmentPrice = instP.toString();
        }
      } else {
        const finalPrice = (parseFloat(veh.resalePrice) || 0) - (parseFloat(veh.saleDiscount) || 0);
        payments.push({ id: 1, type: 'pix', val: cash > 0 ? cash.toString() : (veh.isSold ? finalPrice.toString() : '') });
      }
    }

    if (payments.length === 0) {
      payments.push({ id: 1, type: 'pix', val: '' });
    }

    return {
      buyerName: veh.buyerName || '',
      saleDiscount: veh.saleDiscount || '',
      saleTradeIns: tradeIns,
      salePayments: payments,
      saleInstallmentsTotal: installmentsTotal || '12',
      saleInstallmentsPaid: installmentsPaid || '0',
      saleInstallmentPrice: installmentPrice || '',
      isInstallmentPriceOverridden: installmentPrice ? true : false,
      hasTradeIn: tradeIns.length > 0,
      markRemainingAsInstallments: veh.saleMode === 'installments'
    };
  };

  const [saleData, setSaleData] = useState(() => getInitialSaleData(vehicle));

  const handlePaymentChange = (id, field, value) => {
    setSaleData(prev => {
      const updated = prev.salePayments.map(p => {
        if (p.id === id) {
          const newP = { ...p, [field]: value };
          if (newP.type === 'installments') {
            const t = parseInt(newP.installmentsTotal) || 0;
            const price = parseFloat(newP.installmentPrice) || 0;
            newP.val = (t * price).toString();
          }
          return newP;
        }
        return p;
      });
      return { ...prev, salePayments: updated };
    });
  };

  // Specs Editor State
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [specsData, setSpecsData] = useState({
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    color: vehicle.color || '',
    plate: vehicle.plate || '',
    km: vehicle.km || '',
    fuelType: vehicle.fuelType || 'flex',
    fuelLevel: vehicle.fuelLevel || '1/2',
    doors: vehicle.doors || '4',
    occupants: vehicle.occupants || '5',
    chassis: vehicle.chassis || '',
    previousOwner: vehicle.previousOwner || ''
  });

  const handleSaveSpecs = async () => {
    try {
      await onUpdateVehicle({
        ...vehicle,
        brand: specsData.brand,
        model: specsData.model,
        year: specsData.year,
        color: specsData.color,
        plate: specsData.plate,
        km: specsData.km ? parseInt(specsData.km) : '',
        fuelType: specsData.fuelType,
        fuelLevel: specsData.fuelLevel,
        doors: specsData.doors,
        occupants: specsData.occupants,
        chassis: specsData.chassis,
        previousOwner: specsData.previousOwner
      });
      setIsEditingSpecs(false);
      alert('Informações técnicas salvas com sucesso!');
    } catch (e) {
      alert('Erro ao salvar especificações: ' + e.message);
    }
  };

  // Financial Editor State
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [financialData, setFinancialData] = useState({
    acquisitionPrice: vehicle.acquisitionPrice || '',
    resalePrice: vehicle.resalePrice || '',
    maxDiscountPercent: vehicle.maxDiscountPercent || 5,
    purchaseMode: vehicle.purchaseMode || 'full',
    purchaseTradeInDesc: vehicle.purchaseTradeInDesc || '',
    purchaseTradeInVal: vehicle.purchaseTradeInVal || '',
    purchaseCashVal: vehicle.purchaseCashVal || '',
    purchaseInstallmentsTotal: vehicle.purchaseInstallmentsTotal || '',
    purchaseInstallmentsPaid: vehicle.purchaseInstallmentsPaid || '',
    purchaseInstallmentPrice: vehicle.purchaseInstallmentPrice || '',
    docExpense: vehicle.docExpense || '',
    finesExpense: vehicle.finesExpense || '',
    payoffExpense: vehicle.payoffExpense || '',
    otherExpenses: vehicle.otherExpenses || '',
    transferInsuranceExpense: vehicle.transferInsuranceExpense || '',
    customExpenses: vehicle.customExpenses || []
  });

  const handleSaveFinancial = async () => {
    try {
      await onUpdateVehicle({
        ...vehicle,
        acquisitionPrice: parseFloat(financialData.acquisitionPrice) || 0,
        resalePrice: parseFloat(financialData.resalePrice) || 0,
        maxDiscountPercent: parseFloat(financialData.maxDiscountPercent) || 0,
        purchaseMode: financialData.purchaseMode,
        purchaseTradeInDesc: financialData.purchaseTradeInDesc,
        purchaseTradeInVal: parseFloat(financialData.purchaseTradeInVal) || 0,
        purchaseCashVal: parseFloat(financialData.purchaseCashVal) || 0,
        purchaseInstallmentsTotal: parseInt(financialData.purchaseInstallmentsTotal) || 0,
        purchaseInstallmentsPaid: parseInt(financialData.purchaseInstallmentsPaid) || 0,
        purchaseInstallmentPrice: parseFloat(financialData.purchaseInstallmentPrice) || 0,
        docExpense: parseFloat(financialData.docExpense) || 0,
        finesExpense: parseFloat(financialData.finesExpense) || 0,
        payoffExpense: parseFloat(financialData.payoffExpense) || 0,
        otherExpenses: parseFloat(financialData.otherExpenses) || 0,
        transferInsuranceExpense: parseFloat(financialData.transferInsuranceExpense) || 0,
        customExpenses: financialData.customExpenses || []
      });
      setIsEditingFinancial(false);
      alert('Informações financeiras salvas com sucesso!');
    } catch (e) {
      alert('Erro ao salvar dados financeiros: ' + e.message);
    }
  };

  const handleAddCustomExpenseDetails = () => {
    setFinancialData(prev => ({
      ...prev,
      customExpenses: [
        ...(prev.customExpenses || []),
        { id: Date.now().toString() + Math.random().toString(36).substring(2, 5), description: '', price: '' }
      ]
    }));
  };

  const handleCustomExpenseChangeDetails = (id, field, value) => {
    setFinancialData(prev => ({
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

  const handleRemoveCustomExpenseDetails = (id) => {
    setFinancialData(prev => ({
      ...prev,
      customExpenses: (prev.customExpenses || []).filter(item => item.id !== id)
    }));
  };

  // Other edit toggles
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [isEditingRepairs, setIsEditingRepairs] = useState(false);
  const [isEditingPhotos, setIsEditingPhotos] = useState(false);
  const [compressingPhotoIdx, setCompressingPhotoIdx] = useState(null);
  const [photosData, setPhotosData] = useState(vehicle.images || Array(12).fill(null));
  const [compressSettings, setCompressSettings] = useState({
    maxDimension: 1024,
    quality: 0.7
  });

  const handleSavePhotos = async () => {
    try {
      await onUpdateVehicle({
        ...vehicle,
        images: photosData
      });
      setIsEditingPhotos(false);
      alert('Galeria de fotos salva com sucesso!');
    } catch (e) {
      alert('Erro ao salvar fotos: ' + e.message);
    }
  };

  // Basic calculations
  const repairs = vehicle.repairs || [];
  const totalRepairs = repairs.reduce((sum, r) => sum + (r.price || 0), 0);
  const docExpense = parseFloat(vehicle.docExpense) || 0;
  const finesExpense = parseFloat(vehicle.finesExpense) || 0;
  const payoffExpense = parseFloat(vehicle.payoffExpense) || 0;
  const otherExpenses = parseFloat(vehicle.otherExpenses) || 0;
  const transferInsuranceExpense = parseFloat(vehicle.transferInsuranceExpense) || 0;
  const customExpensesList = vehicle.customExpenses || [];
  const customExpensesTotal = customExpensesList.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const totalAdditionalExpenses = docExpense + finesExpense + payoffExpense + otherExpenses + transferInsuranceExpense + customExpensesTotal;

  const totalInvested = (vehicle.acquisitionPrice || 0) + totalRepairs + totalAdditionalExpenses;
  
  // Purchase (Compra) calculations
  const isPurchaseInstallments = vehicle.purchaseMode === 'installments';
  const purchaseTradeInVal = parseFloat(vehicle.purchaseTradeInVal) || 0;
  const purchaseCashVal = parseFloat(vehicle.purchaseCashVal) || 0;
  const purchaseInstallmentsPaid = parseInt(vehicle.purchaseInstallmentsPaid) || 0;
  const purchaseInstallmentPrice = parseFloat(vehicle.purchaseInstallmentPrice) || 0;
  
  const purchaseTotalPaid = isPurchaseInstallments
    ? purchaseTradeInVal + purchaseCashVal + (purchaseInstallmentsPaid * purchaseInstallmentPrice)
    : vehicle.acquisitionPrice || 0;
  const purchaseDebt = isPurchaseInstallments
    ? Math.max(0, (vehicle.acquisitionPrice || 0) - purchaseTotalPaid)
    : 0;

  // Sale (Venda) calculations
  const saleDiscount = parseFloat(vehicle.saleDiscount) || 0;
  const saleTradeInVal = parseFloat(vehicle.saleTradeInVal) || 0;
  const saleCashVal = parseFloat(vehicle.saleCashVal) || 0;
  const saleInstallmentsPaid = parseInt(vehicle.saleInstallmentsPaid) || 0;
  const saleInstallmentPrice = parseFloat(vehicle.saleInstallmentPrice) || 0;
  const saleInstallmentsTotal = parseInt(vehicle.saleInstallmentsTotal) || 0;
  const saleDebtPayments = vehicle.debtPayments || [];
  const saleDebtPaymentsSum = saleDebtPayments.reduce((sum, dp) => sum + (parseFloat(dp.amount) || 0), 0);

  const finalSalePrice = vehicle.isSold
    ? (vehicle.resalePrice || 0) - saleDiscount
    : (vehicle.resalePrice || 0);

  const saleRemainingDebt = vehicle.isSold
    ? (vehicle.saleMode === 'installments'
        ? Math.max(0, (saleInstallmentsTotal - saleInstallmentsPaid) * saleInstallmentPrice)
        : Math.max(0, finalSalePrice - (saleTradeInVal + saleCashVal + saleDebtPaymentsSum)))
    : 0;

  const saleTotalReceived = vehicle.isSold
    ? Math.max(0, finalSalePrice - saleRemainingDebt)
    : 0;

  // Net Profit: Estimated vs. Real
  const netProfit = finalSalePrice - totalInvested;
  const profitMargin = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

  // Maximum Discount Calculation (Target / Simulation)
  const maxDiscountVal = (vehicle.resalePrice || 0) * ((vehicle.maxDiscountPercent || 0) / 100);
  const minSalePrice = (vehicle.resalePrice || 0) - maxDiscountVal;
  const profitAtMaxDiscount = minSalePrice - totalInvested;

  // Checklist Calculations
  const checklistItems = Object.entries(vehicle.checklist || {});
  const totalChecklist = checklistItems.length;
  const okChecklist = checklistItems.filter(([_, v]) => v.status === 'OK').length;
  const failChecklist = checklistItems.filter(([_, v]) => v.status === 'FAIL').length;
  const naChecklist = checklistItems.filter(([_, v]) => v.status === 'NA').length;
  const failedList = checklistItems.filter(([_, v]) => v.status === 'FAIL');

  const handleUpdateChecklist = (newChecklist, repairToAdd, repairToRemove) => {
    let updatedRepairs = [...repairs];
    let repairsChanged = false;

    if (repairToAdd) {
      if (!updatedRepairs.some(r => r.description === repairToAdd)) {
        updatedRepairs.push({
          id: Date.now(),
          description: repairToAdd,
          price: 0,
          status: 'pending',
          date: new Date().toISOString()
        });
        repairsChanged = true;
      }
    }

    if (repairToRemove) {
      const initialLength = updatedRepairs.length;
      updatedRepairs = updatedRepairs.filter(r => 
        !(r.description === repairToRemove && r.status === 'pending' && r.price === 0)
      );
      if (updatedRepairs.length !== initialLength) {
        repairsChanged = true;
      }
    }

    if (repairsChanged) {
      onUpdateVehicle({
        ...vehicle,
        checklist: newChecklist,
        repairs: updatedRepairs
      });
    } else {
      onUpdateVehicle({
        ...vehicle,
        checklist: newChecklist
      });
    }
  };

  const handleUpdateRepairs = (newRepairs) => {
    onUpdateVehicle({
      ...vehicle,
      repairs: newRepairs
    });
  };

  const handleAddRepairShortcut = (repairDescription, shouldSwitchTab = true) => {
    // Evita duplicados na lista de reparos
    if (repairs.some(r => r.description === repairDescription)) {
      return;
    }
    const newRepair = {
      id: Date.now(),
      description: repairDescription,
      price: 0,
      status: 'pending',
      date: new Date().toISOString()
    };
    onUpdateVehicle({
      ...vehicle,
      repairs: [...repairs, newRepair]
    });
    if (shouldSwitchTab) {
      setActiveTab('repairs');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onUpdateVehicle({
        ...vehicle,
        generalNotes: notesText
      });
      alert('Anotações salvas com sucesso!');
    } catch (e) {
      alert('Erro ao salvar anotações: ' + e.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Save Sale negotiation details
  const handleSaveSale = async (e) => {
    e.preventDefault();
    const priceResale = parseFloat(vehicle.resalePrice) || 0;
    const currentDiscount = parseFloat(saleData.saleDiscount) || 0;
    const finalPrice = priceResale - currentDiscount;
    if (finalPrice < totalInvested) {
      const confirmLoss = window.confirm(
        `⚠️ ATENÇÃO: Esta negociação resulta em PREJUÍZO de ${formatCurrency(totalInvested - finalPrice)} (Valor final de ${formatCurrency(finalPrice)} é menor que o custo total investido de ${formatCurrency(totalInvested)}).\n\nDeseja realmente prosseguir com esta venda?`
      );
      if (!confirmLoss) return;
    }

    // Calculations for serializing
    const totalTradeIn = saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0);
    const tradeInDesc = saleData.saleTradeIns.map(t => `${t.desc} (${formatCurrency(parseFloat(t.val) || 0)})`).join(' + ');

    // Cash/upfront payments total
    const cashVal = saleData.salePayments.reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0);

    // Installments / a prazo calculations
    const remainingBalance = finalPrice - (totalTradeIn + cashVal);

    let installmentsTotal = 0;
    let installmentsPaid = 0;
    let installmentPrice = 0;
    let saleMode = 'full';

    // If remaining balance is positive, we treat it as installments (a prazo) only if toggle is checked
    if (remainingBalance > 0.05 && saleData.markRemainingAsInstallments) {
      saleMode = 'installments';
      installmentsTotal = parseInt(saleData.saleInstallmentsTotal) || 12;
      installmentsPaid = parseInt(saleData.saleInstallmentsPaid) || 0;
      installmentPrice = saleData.isInstallmentPriceOverridden && saleData.saleInstallmentPrice
        ? parseFloat(saleData.saleInstallmentPrice) || 0
        : remainingBalance / installmentsTotal;
    }

    // Prepare salePayments array for DB storage, including installments item if any
    const finalPaymentsForDb = saleData.salePayments.map(p => ({
      id: p.id,
      type: p.type,
      val: p.val
    }));

    if (saleMode === 'installments') {
      finalPaymentsForDb.push({
        id: Date.now(),
        type: 'installments',
        val: (installmentsTotal * installmentPrice).toString(),
        installmentsTotal: installmentsTotal,
        installmentsPaid: installmentsPaid,
        installmentPrice: installmentPrice
      });
    }

    try {
      await onUpdateVehicle({
        ...vehicle,
        isSold: true,
        buyerName: saleData.buyerName,
        saleDiscount: currentDiscount,
        saleMode: saleMode,
        saleTradeInDesc: tradeInDesc,
        saleTradeInVal: totalTradeIn,
        saleCashVal: cashVal,
        saleInstallmentsTotal: installmentsTotal,
        saleInstallmentsPaid: installmentsPaid,
        saleInstallmentPrice: installmentPrice,
        // Persist original arrays inside the object
        saleTradeIns: saleData.saleTradeIns,
        salePayments: finalPaymentsForDb,
        debtPayments: [] // Reset debt payment history on new sale
      });
      setIsEditingSale(false);
      alert('Dados de venda registrados com sucesso!');
    } catch (err) {
      alert('Erro ao registrar venda: ' + err.message);
    }
  };

  // Re-activate vehicle (Negotiation failed)
  const handleCancelSale = async () => {
    if (confirm('Deseja realmente cancelar a venda e reativar o veículo no estoque?')) {
      try {
        await onUpdateVehicle({
          ...vehicle,
          isSold: false,
          buyerName: '',
          saleDiscount: 0,
          saleMode: 'full',
          saleTradeInDesc: '',
          saleTradeInVal: 0,
          saleCashVal: 0,
          saleInstallmentsTotal: 0,
          saleInstallmentsPaid: 0,
          saleInstallmentPrice: 0,
          debtPayments: [],
          salePayments: []
        });
        setIsEditingSale(false);
        alert('Veículo retornado ao estoque ativo!');
      } catch (err) {
        alert('Erro ao reativar veículo: ' + err.message);
      }
    }
  };

  // Confirm debt amortization payment
  const handleConfirmDebtPayment = async (e) => {
    e.preventDefault();
    const vPay = parseFloat(debtPaymentVal) || 0;
    if (vPay <= 0) {
      alert('Por favor, informe um valor de pagamento válido.');
      return;
    }

    if (vPay > saleRemainingDebt + 0.05) {
      alert(`O valor do pagamento (${formatCurrency(vPay)}) não pode ser maior que o saldo devedor atual (${formatCurrency(saleRemainingDebt)}).`);
      return;
    }

    const currentDebt = saleRemainingDebt;
    const newDebt = Math.max(0, currentDebt - vPay);

    const newDebtPayment = {
      id: Date.now(),
      amount: vPay,
      method: debtPaymentMethod,
      date: new Date().toISOString()
    };

    const updatedDebtPayments = [...(vehicle.debtPayments || []), newDebtPayment];

    let newInstallmentsPaid = saleInstallmentsPaid;
    let newInstallmentsTotal = saleInstallmentsTotal;
    let newInstallmentPrice = saleInstallmentPrice;

    if (vehicle.saleMode === 'installments') {
      if (newDebt <= 0.05) {
        newInstallmentsPaid = saleInstallmentsTotal;
      } else {
        const currentRemainingCount = saleInstallmentsTotal - saleInstallmentsPaid;
        
        if (vPay > saleInstallmentPrice && currentRemainingCount > 1) {
          if (debtAmortizationOption === 'reduce_term') {
            const incrementPaid = 1;
            newInstallmentsPaid = saleInstallmentsPaid + incrementPaid;
            const newRemainingCount = Math.max(1, Math.round(newDebt / saleInstallmentPrice));
            newInstallmentsTotal = newInstallmentsPaid + newRemainingCount;
            newInstallmentPrice = newDebt / newRemainingCount;
          } else {
            const incrementPaid = 1;
            newInstallmentsPaid = saleInstallmentsPaid + incrementPaid;
            const newRemainingCount = currentRemainingCount - incrementPaid;
            newInstallmentsTotal = saleInstallmentsTotal;
            newInstallmentPrice = newDebt / Math.max(1, newRemainingCount);
          }
        } else {
          const incrementPaid = 1;
          newInstallmentsPaid = saleInstallmentsPaid + incrementPaid;
          const newRemainingCount = Math.max(1, currentRemainingCount - incrementPaid);
          newInstallmentsTotal = saleInstallmentsTotal;
          newInstallmentPrice = newDebt / newRemainingCount;
        }
      }
    }

    let updatedSalePayments = [];
    if (vehicle.salePayments && Array.isArray(vehicle.salePayments)) {
      updatedSalePayments = vehicle.salePayments.map(p => {
        if (p.type === 'installments') {
          return {
            ...p,
            installmentsTotal: newInstallmentsTotal,
            installmentsPaid: newInstallmentsPaid,
            installmentPrice: newInstallmentPrice,
            val: (newInstallmentsTotal * newInstallmentPrice).toString()
          };
        }
        return p;
      });
    }

    try {
      await onUpdateVehicle({
        ...vehicle,
        saleInstallmentsPaid: newInstallmentsPaid,
        saleInstallmentsTotal: newInstallmentsTotal,
        saleInstallmentPrice: newInstallmentPrice,
        debtPayments: updatedDebtPayments,
        salePayments: updatedSalePayments
      });
      setIsSettlingDebt(false);
      alert('Pagamento registrado com sucesso!');
    } catch (err) {
      alert('Erro ao registrar pagamento: ' + err.message);
    }
  };

  // PDF & TXT Exporter
  const handleExport = (scope, format) => {
    if (format === 'txt') {
      let txtContent = "";
      txtContent += `==========================================\n`;
      txtContent += `         LAUDO DE VISTORIA VEICULAR       \n`;
      txtContent += `               AUTOLIST - MAVC            \n`;
      txtContent += `==========================================\n\n`;
      txtContent += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;

      txtContent += `--- FICHA TÉCNICA DO VEÍCULO ---\n`;
      txtContent += `Marca: ${(vehicle.brand || '---').toUpperCase()}\n`;
      txtContent += `Modelo: ${(vehicle.model || '---').toUpperCase()}\n`;
      txtContent += `Ano: ${vehicle.year || '---'}\n`;
      txtContent += `Placa: ${(vehicle.plate || '---').toUpperCase()}\n`;
      txtContent += `Cor: ${(vehicle.color || '---').toUpperCase()}\n`;
      txtContent += `Quilometragem: ${vehicle.km ? parseInt(vehicle.km).toLocaleString('pt-BR') + ' KM' : '---'}\n`;
      
      const getFuelLabel = (ft) => {
        const map = {
          flex: 'Flex',
          gasolina: 'Gasolina',
          diesel: 'Diesel',
          eletrico: '100% Elétrico',
          hibrido: 'Híbrido',
          outros: 'Outros'
        };
        return map[(ft || '').toLowerCase()] || (ft ? String(ft).toUpperCase() : 'Flex');
      };

      txtContent += `Tipo de Combustível: ${getFuelLabel(vehicle.fuelType)}\n`;
      txtContent += `Nível do Tanque: ${vehicle.fuelLevel || '---'}\n`;
      txtContent += `Portas / Capacidade: ${vehicle.doors || '4'} Portas / ${vehicle.occupants || '5'} Ocupantes\n`;
      if (vehicle.chassis) txtContent += `Chassi: ${vehicle.chassis.toUpperCase()}\n`;
      txtContent += `Opcionais: ${(vehicle.options || []).join(', ') || 'Nenhum'}\n\n`;

      if (scope === 'customer') {
        txtContent += `--- DADOS DE VENDA ---\n`;
        const valFinal = vehicle.isSold ? finalSalePrice : (vehicle.resalePrice || 0);
        txtContent += `Preço de Revenda: ${formatCurrency(valFinal)}\n`;
        if (vehicle.isSold && vehicle.buyerName) {
          txtContent += `Comprador: ${vehicle.buyerName}\n`;
        }
      } else {
        txtContent += `--- RESUMO FINANCEIRO (DRE & CUSTOS) ---\n`;
        txtContent += `Valor de Aquisição (Compra): ${formatCurrency(vehicle.acquisitionPrice)}\n`;
        txtContent += `Proprietário Anterior (Fornecedor): ${vehicle.previousOwner || 'Não informado'}\n`;
        txtContent += `Forma de Aquisição: ${vehicle.purchaseMode === 'installments' ? 'Consignado / Pago em Etapas' : 'À Vista'}\n`;
        if (vehicle.purchaseMode === 'installments') {
          txtContent += `  - Entrada Troca: ${formatCurrency(purchaseTradeInVal)}\n`;
          txtContent += `  - Entrada Dinheiro: ${formatCurrency(purchaseCashVal)}\n`;
          txtContent += `  - Parcelas: ${vehicle.purchaseInstallmentsPaid} de ${vehicle.purchaseInstallmentsTotal} pagas (${formatCurrency(purchaseInstallmentPrice)} cada)\n`;
          txtContent += `  - Restante Devido: ${formatCurrency(purchaseDebt)}\n`;
        }
        
        txtContent += `Total Investido em Reparos: ${formatCurrency(totalRepairs)}\n`;
        txtContent += `Investimento Total Acumulado: ${formatCurrency(totalInvested)}\n`;
        txtContent += `Preço de Revenda: ${formatCurrency(finalSalePrice)}\n`;
        txtContent += `Status do Veículo: ${vehicle.isSold ? 'VENDIDO' : 'ATIVO EM ESTOQUE'}\n`;
        if (vehicle.isSold) {
          txtContent += `Comprador: ${vehicle.buyerName || 'Não informado'}\n`;
          txtContent += `Forma de Venda: ${vehicle.saleMode === 'installments' ? 'Saldo Devedor / Financiado' : 'À Vista'}\n`;
          if (vehicle.saleMode === 'installments') {
            txtContent += `  - Recebido em Troca: ${formatCurrency(saleTradeInVal)}\n`;
            txtContent += `  - Recebido em Dinheiro: ${formatCurrency(saleCashVal)}\n`;
            txtContent += `  - Parcelas Recebidas: ${saleInstallmentsPaid} de ${saleInstallmentsTotal} pagas (${formatCurrency(saleInstallmentPrice)} cada)\n`;
            txtContent += `  - Saldo Devedor Restante: ${formatCurrency(saleRemainingDebt)}\n`;
          }
        }
        txtContent += `Retorno (ROI): ${formatCurrency(netProfit)} (${profitMargin.toFixed(1)}% ROI)\n\n`;

        txtContent += `--- REPAROS E MANUTENÇÕES ---\n`;
        if ((vehicle.repairs || []).length === 0) {
          txtContent += `Nenhum reparo cadastrado.\n`;
        } else {
          vehicle.repairs.forEach((rep, i) => {
            txtContent += `${i + 1}. ${rep.description} - ${formatCurrency(rep.price)} [${rep.status.toUpperCase()}]\n`;
          });
        }
        txtContent += `\n`;

        txtContent += `--- CHECKLIST DE VISTORIA ---\n`;
        if (totalChecklist === 0) {
          txtContent += `Nenhum checklist respondido.\n`;
        } else {
          txtContent += `Total Itens: ${totalChecklist} | OK: ${okChecklist} | Com Falha: ${failChecklist}\n`;
          if (failedList.length > 0) {
            txtContent += `Itens com Problema:\n`;
            failedList.forEach(([itemKey, val]) => {
              txtContent += `  - ${itemKey}: ${val.notes || 'Sem observação'}\n`;
            });
          }
        }
        txtContent += `\n`;
      }

      if (vehicle.generalNotes) {
        txtContent += `--- ANOTAÇÕES GERAIS ---\n`;
        txtContent += `${vehicle.generalNotes}\n`;
      }

      // Download txt file
      const element = document.createElement("a");
      const file = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `laudo_${vehicle.brand || 'veiculo'}_${vehicle.model || 'modelo'}_${scope}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // PDF Choice
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(scope === 'customer' ? 'LAUDO DE VISTORIA VEICULAR (CLIENTE)' : 'LAUDO COMPLETO E FINANCEIRO DRE', margin, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`SISTEMA AUTOLIST - GERADO EM: ${new Date().toLocaleString('pt-BR')}`, margin, 26);

      y = 45;

      // Ficha Tecnica
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('1. FICHA TÉCNICA DO VEÍCULO', margin, y);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 2, pageW - margin, y + 2);
      
      y += 9;
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      const getFuelLabel = (ft) => {
        const map = {
          flex: 'Flex',
          gasolina: 'Gasolina',
          diesel: 'Diesel',
          eletrico: '100% Elétrico',
          hibrido: 'Híbrido',
          outros: 'Outros'
        };
        return map[(ft || '').toLowerCase()] || (ft ? String(ft).toUpperCase() : 'Flex');
      };

      const col1X = margin;
      const col2X = margin + 55;
      const col3X = margin + 115;

      // Linha 1: Marca & Modelo (Espaço amplo dedicado)
      doc.setFont('helvetica', 'bold'); doc.text('VEÍCULO:', col1X, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${(vehicle.brand || '').toUpperCase()} ${(vehicle.model || '').toUpperCase()}`, col1X + 20, y);

      // Linha 2: Placa, Ano, Cor
      y += 6.5;
      doc.setFont('helvetica', 'bold'); doc.text('PLACA:', col1X, y);
      doc.setFont('helvetica', 'normal'); doc.text((vehicle.plate || '---').toUpperCase(), col1X + 16, y);

      doc.setFont('helvetica', 'bold'); doc.text('ANO:', col2X, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(vehicle.year || '---'), col2X + 12, y);

      doc.setFont('helvetica', 'bold'); doc.text('COR:', col3X, y);
      doc.setFont('helvetica', 'normal'); doc.text((vehicle.color || '---').toUpperCase(), col3X + 12, y);

      // Linha 3: KM, Combustível, Nível do Tanque
      y += 6.5;
      doc.setFont('helvetica', 'bold'); doc.text('KM:', col1X, y);
      doc.setFont('helvetica', 'normal'); doc.text(vehicle.km ? `${parseInt(vehicle.km).toLocaleString('pt-BR')} KM` : '---', col1X + 12, y);

      doc.setFont('helvetica', 'bold'); doc.text('COMBUSTÍVEL:', col2X, y);
      doc.setFont('helvetica', 'normal'); doc.text(getFuelLabel(vehicle.fuelType).toUpperCase(), col2X + 28, y);

      doc.setFont('helvetica', 'bold'); doc.text('NÍVEL TANQUE:', col3X, y);
      doc.setFont('helvetica', 'normal'); doc.text(vehicle.fuelLevel || '---', col3X + 28, y);

      // Linha 4: Portas/Capacidade e Chassi
      y += 6.5;
      doc.setFont('helvetica', 'bold'); doc.text('PORTAS / CAPACIDADE:', col1X, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${vehicle.doors || '4'} Portas / ${vehicle.occupants || '5'} Ocupantes`, col1X + 42, y);

      if (vehicle.chassis) {
        doc.setFont('helvetica', 'bold'); doc.text('CHASSI:', col3X, y);
        doc.setFont('helvetica', 'normal'); doc.text(vehicle.chassis.toUpperCase(), col3X + 16, y);
      }

      if (scope === 'customer') {
        y += 12;
        // Preço para Cliente
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('2. PREÇO E VALOR DE REVENDA', margin, y);
        doc.line(margin, y + 2, pageW - margin, y + 2);

        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold'); doc.text('VALOR DE REVENDA:', col1X, y);
        const valFinal = vehicle.isSold ? finalSalePrice : (vehicle.resalePrice || 0);
        doc.setFont('helvetica', 'normal'); doc.text(formatCurrency(valFinal), col1X + 48, y);

        if (vehicle.options && vehicle.options.length > 0) {
          y += 10;
          doc.setFont('helvetica', 'bold'); doc.text('OPCIONAIS DO VEÍCULO:', col1X, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          const optsText = vehicle.options.join(', ');
          const splitOpts = doc.splitTextToSize(optsText, pageW - (margin * 2));
          doc.text(splitOpts, col1X, y);
          y += (splitOpts.length * 4);
        }
      } else {
        // Financeiro completo
        y += 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('2. INVESTIMENTO E PREVISÃO DE REVENDA', margin, y);
        doc.line(margin, y + 2, pageW - margin, y + 2);

        y += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold'); doc.text('AQUISIÇÃO DO VEÍCULO:', col1X, y);
        doc.setFont('helvetica', 'normal'); doc.text(formatCurrency(vehicle.acquisitionPrice), col1X + 48, y);

        doc.setFont('helvetica', 'bold'); doc.text('CUSTO DE REPAROS:', col2X + 10, y);
        doc.setFont('helvetica', 'normal'); doc.text(formatCurrency(totalRepairs), col2X + 54, y);

        y += 6;
        doc.setFont('helvetica', 'bold'); doc.text('INVESTIMENTO TOTAL:', col1X, y);
        doc.setFont('helvetica', 'normal'); doc.text(formatCurrency(totalInvested), col1X + 48, y);

        doc.setFont('helvetica', 'bold'); doc.text('REVENDA REGISTRADA:', col2X + 10, y);
        doc.setFont('helvetica', 'normal'); doc.text(formatCurrency(finalSalePrice), col2X + 54, y);

        y += 6;
        doc.setFont('helvetica', 'bold'); doc.text('STATUS DO VEÍCULO:', col1X, y);
        if (vehicle.isSold) {
          doc.setFont('helvetica', 'bold'); doc.setTextColor(16, 185, 129); doc.text('VENDIDO', col1X + 48, y);
          doc.setTextColor(71, 85, 105);

          doc.setFont('helvetica', 'bold'); doc.text('LUCRO REAL OBTIDO:', col2X + 10, y);
          doc.setFont('helvetica', 'bold');
          if (netProfit >= 0) {
            doc.setTextColor(16, 185, 129);
          } else {
            doc.setTextColor(239, 68, 68);
          }
          doc.text(`${formatCurrency(netProfit)} (${profitMargin.toFixed(1)}% ROI)`, col2X + 54, y);
          doc.setTextColor(71, 85, 105);
        } else {
          doc.setFont('helvetica', 'bold'); doc.setTextColor(59, 130, 246); doc.text('ATIVO EM ESTOQUE', col1X + 48, y);
          doc.setTextColor(71, 85, 105);

          doc.setFont('helvetica', 'bold'); doc.text('LUCRO PROJETADO:', col2X + 10, y);
          doc.setFont('helvetica', 'bold');
          if (netProfit >= 0) {
            doc.setTextColor(16, 185, 129);
          } else {
            doc.setTextColor(239, 68, 68);
          }
          doc.text(`${formatCurrency(netProfit)} (${profitMargin.toFixed(1)}% ROI)`, col2X + 54, y);
          doc.setTextColor(71, 85, 105);
        }

        // Add repairs and checklist
        y += 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('3. RESULTADOS DO CHECKLIST (QUALIDADE)', margin, y);
        doc.line(margin, y + 2, pageW - margin, y + 2);

        y += 8;
        doc.setFontSize(9);
        if (totalChecklist === 0) {
          doc.setFont('helvetica', 'normal');
          doc.text('Checklist de vistoria não foi preenchido.', margin, y);
          y += 8;
        } else {
          doc.setFont('helvetica', 'bold');
          doc.text(`ITENS VERIFICADOS: ${totalChecklist}`, col1X, y);
          doc.text(`CONFORMES: ${okChecklist}`, col2X, y);
          doc.text(`NÃO CONFORMES: ${failChecklist}`, col3X, y);
          y += 8;
        }
      }

      // Notes
      if (vehicle.generalNotes) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(scope === 'customer' ? '3. ANOTAÇÕES GERAIS' : '4. ANOTAÇÕES DE NEGOCIAÇÃO', margin, y);
        doc.line(margin, y + 2, pageW - margin, y + 2);

        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const splitNotes = doc.splitTextToSize(vehicle.generalNotes, pageW - (margin * 2));
        doc.text(splitNotes, margin, y);
      }

      doc.save(`laudo_${vehicle.brand || 'veiculo'}_${vehicle.model || 'modelo'}_${scope}.pdf`);
    }
  };

  const validPhotos = (vehicle.images || []).filter(img => img && (img.startsWith('data:image') || img.startsWith('http') || img.startsWith('https') || img.startsWith('/')));

  return (
    <div className="space-y-6 pb-12">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 md:pb-5">
        {/* Title & Back Button: Visible on Desktop (on Mobile it renders directly in top bar) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-10 w-10 border border-slate-800 bg-slate-900/40 hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all shrink-0"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                {vehicle.brand}
              </span>
              <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {vehicle.plate || 'SEM PLACA'}
              </span>
              {vehicle.isSold && (
                <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                  Vendido
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight leading-tight mt-1">
              {vehicle.model}
            </h2>
          </div>
        </div>

        {/* Action Panel: Occupies full top line on mobile */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mark as Sold / Return Active Toggle */}
          <button
            onClick={() => {
              if (vehicle.isSold) {
                handleCancelSale();
              } else {
                setSaleData(getInitialSaleData(vehicle));
                setIsEditingSale(true);
                setActiveTab('financial');
              }
            }}
            className={`flex-1 md:flex-initial h-10 px-3 md:px-4 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              vehicle.isSold
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/25 hover:border-amber-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20'
            }`}
            title={vehicle.isSold ? 'Cancelar Venda e Reativar' : 'Registrar Venda'}
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">{vehicle.isSold ? 'Cancelar Venda' : 'Registrar Venda'}</span>
            <span className="md:hidden">{vehicle.isSold ? 'Cancelar Venda' : 'Vender'}</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex-1 md:flex-initial h-10 px-3 md:px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 text-slate-300"
            title="Baixar Dados"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Baixar Dados</span>
            <span className="md:hidden">Baixar</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Deseja realmente excluir permanentemente o veículo ${vehicle.brand} ${vehicle.model}?`)) {
                onDeleteVehicle(vehicle.id);
              }
            }}
            className="flex-1 md:flex-initial h-10 px-3 md:px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95"
            title="Excluir Veículo"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline">Excluir</span>
            <span className="md:hidden">Excluir</span>
          </button>
        </div>
      </div>

      {/* Accordion Navigation */}
      <div className="space-y-4 mb-6">
        
        {/* Accordion Item 1: Dados do Veículo */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'specs' ? null : 'specs')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'specs' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                🚗
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'specs' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Dados do Veículo
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Ficha técnica, opcionais e especificações do veículo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'specs' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'specs' && (
            <div className="p-4 md:p-6 border-t border-slate-850 bg-slate-950/20 space-y-6 animate-fade-in">
              {/* Specs Card */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400">
                    📋 Ficha Técnica do Veículo
                  </h3>
                  {!isEditingSpecs ? (
                    <button
                      onClick={() => {
                        setSpecsData({
                          brand: vehicle.brand || '',
                          model: vehicle.model || '',
                          year: vehicle.year || '',
                          color: vehicle.color || '',
                          plate: vehicle.plate || '',
                          km: vehicle.km || '',
                          fuelType: vehicle.fuelType || 'flex',
                          fuelLevel: vehicle.fuelLevel || '1/2',
                          doors: vehicle.doors || '4',
                          occupants: vehicle.occupants || '5',
                          chassis: vehicle.chassis || '',
                          previousOwner: vehicle.previousOwner || ''
                        });
                        setIsEditingSpecs(true);
                      }}
                      className="text-[10px] font-black uppercase text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Editar Informações
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditingSpecs(false)}
                        className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-300 hover:underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveSpecs}
                        className="text-[10px] font-black uppercase text-emerald-450 text-emerald-450 text-emerald-400 hover:text-emerald-350 hover:underline"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                {isEditingSpecs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs pt-2 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Marca</label>
                      <input
                        type="text"
                        value={specsData.brand}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Modelo</label>
                      <input
                        type="text"
                        value={specsData.model}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Ano Modelo</label>
                      <input
                        type="text"
                        value={specsData.year}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Cor do Veículo</label>
                      <input
                        type="text"
                        value={specsData.color}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Quilometragem (KM)</label>
                      <input
                        type="number"
                        value={specsData.km}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, km: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Combustível</label>
                      <select
                        value={specsData.fuelType}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, fuelType: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      >
                        <option value="flex">Flex</option>
                        <option value="gasolina">Gasolina</option>
                        <option value="diesel">Diesel</option>
                        <option value="eletrico">100% Elétrico</option>
                        <option value="hibrido">Híbrido</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Nível do Tanque</label>
                      <select
                        value={specsData.fuelLevel}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, fuelLevel: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      >
                        <option value="Reserva">Reserva (E)</option>
                        <option value="1/4">1/4</option>
                        <option value="1/2">1/2</option>
                        <option value="3/4">3/4</option>
                        <option value="Cheio">Cheio (F)</option>
                        <option value="100%">100% (Bateria/EV)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Número de Portas</label>
                      <select
                        value={specsData.doors}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, doors: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      >
                        <option value="2">2 Portas</option>
                        <option value="3">3 Portas</option>
                        <option value="4">4 Portas</option>
                        <option value="5">5 Portas</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Capacidade</label>
                      <select
                        value={specsData.occupants}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, occupants: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      >
                        <option value="2">2 Ocupantes</option>
                        <option value="4">4 Ocupantes</option>
                        <option value="5">5 Ocupantes</option>
                        <option value="7">7 Ocupantes</option>
                        <option value="8">8+ Ocupantes</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Placa</label>
                      <input
                        type="text"
                        value={specsData.plate}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, plate: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-500 font-bold uppercase">Chassi</label>
                      <input
                        type="text"
                        value={specsData.chassis}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, chassis: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-550 font-bold uppercase text-slate-500">Proprietário Antigo</label>
                      <input
                        type="text"
                        value={specsData.previousOwner}
                        onChange={(e) => setSpecsData(prev => ({ ...prev, previousOwner: e.target.value }))}
                        className="w-full h-9 px-3 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs pt-2">
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Marca</p>
                      <p className="font-bold text-slate-205 uppercase">{vehicle.brand || '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Modelo</p>
                      <p className="font-bold text-slate-202 uppercase">{vehicle.model || '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Ano Modelo</p>
                      <p className="font-bold text-slate-202">{vehicle.year || '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Cor do Veículo</p>
                      <p className="font-bold text-slate-205 uppercase">{vehicle.color || '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Quilometragem</p>
                      <p className="font-bold text-slate-202">{vehicle.km ? `${parseInt(vehicle.km).toLocaleString('pt-BR')} KM` : '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Combustível</p>
                      <p className="font-bold text-slate-202">
                        {(() => {
                          const mapping = {
                            flex: 'Flex',
                            gasolina: 'Gasolina',
                            diesel: 'Diesel',
                            eletrico: '100% Elétrico',
                            hibrido: 'Híbrido',
                            outros: 'Outros'
                          };
                          return mapping[vehicle.fuelType] || 'Flex';
                        })()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Nível do Tanque</p>
                      <p className="font-bold text-slate-202">{vehicle.fuelLevel || '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Número de Portas</p>
                      <p className="font-bold text-slate-202">{vehicle.doors ? `${vehicle.doors} Portas` : '---'}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                      <p className="text-[8.5px] text-slate-500 font-bold uppercase">Capacidade</p>
                      <p className="font-bold text-slate-202">{vehicle.occupants ? `${vehicle.occupants} Ocupantes` : '---'}</p>
                    </div>
                    {vehicle.chassis && (
                      <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                        <p className="text-[8.5px] text-slate-500 font-bold uppercase">Chassi</p>
                        <p className="font-mono font-bold text-slate-202 uppercase truncate max-w-[180px]">{vehicle.chassis}</p>
                      </div>
                    )}
                    {vehicle.previousOwner && (
                      <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                        <p className="text-[8.5px] text-slate-500 font-bold uppercase">Proprietário Antigo</p>
                        <p className="font-bold text-slate-202 uppercase">{vehicle.previousOwner}</p>
                      </div>
                    )}
                    {vehicle.isSold && vehicle.buyerName && (
                      <div className="flex items-center justify-between border-b border-slate-900/5 pb-2">
                        <p className="text-[8.5px] text-slate-500 font-bold uppercase">Comprador</p>
                        <p className="font-bold text-sky-400 uppercase">{vehicle.buyerName}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Display options as tags */}
                {vehicle.options && vehicle.options.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                      🛠️ Opcionais do Veículo
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.options.map(opt => (
                        <span key={opt} className="text-[10px] font-bold text-slate-350 bg-slate-900 border border-slate-855 px-2.5 py-1 rounded-xl uppercase">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item 2: Resumo Financeiro */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'financial' ? null : 'financial')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'financial' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                💸
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'financial' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Resumo Financeiro
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Dados financeiros, investimentos, saldo devedor e DRE
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'financial' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'financial' && (
            <div className="p-4 md:p-6 border-t border-slate-850 bg-slate-950/20 space-y-6 animate-fade-in">
            
            {/* SALE REGISTRATION OVERLAY MODAL RENDERS OUTSIDE ACCORDION */}

            {/* INLINE FINANCIAL EDIT FORM */}
            {isEditingFinancial && (
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-headline font-black uppercase tracking-widest text-emerald-400">
                      💸 Editar Informações Financeiras
                    </h3>
                    <p className="text-[9.5px] text-slate-500 font-bold uppercase mt-1 leading-none">
                      Edite os valores de compra, venda e parcelamento de aquisição do veículo
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditingFinancial(false)}
                    className="h-8 w-8 hover:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-202"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Acquisition Price */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor de Aquisição (R$)</label>
                    <CurrencyInput
                      value={financialData.acquisitionPrice}
                      onChange={(val) => setFinancialData(prev => ({ ...prev, acquisitionPrice: val }))}
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-white shadow-sm"
                      placeholder="0,00"
                    />
                  </div>

                  {/* Resale Price */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preço de Revenda Estimado (R$)</label>
                    <CurrencyInput
                      value={financialData.resalePrice}
                      onChange={(val) => setFinancialData(prev => ({ ...prev, resalePrice: val }))}
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-white shadow-sm"
                      placeholder="0,00"
                    />
                  </div>

                  {/* Max Discount Percent */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Desconto Máximo (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={financialData.maxDiscountPercent}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, maxDiscountPercent: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-white pr-7"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-black text-slate-500">%</span>
                    </div>
                  </div>

                  {/* Max Discount Value (R$) */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Desconto Máximo (R$)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={parseFloat(financialData.resalePrice) > 0 ? (parseFloat(financialData.resalePrice) * (parseFloat(financialData.maxDiscountPercent) || 0) / 100).toFixed(2) : ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const resalePrice = parseFloat(financialData.resalePrice) || 0;
                          const pct = resalePrice > 0 ? (val / resalePrice) * 100 : 0;
                          const roundedPct = parseFloat(pct.toFixed(2));
                          setFinancialData(prev => ({ ...prev, maxDiscountPercent: roundedPct }));
                        }}
                        className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-white pl-8"
                        placeholder="0,00"
                        disabled={!(parseFloat(financialData.resalePrice) > 0)}
                        title={!(parseFloat(financialData.resalePrice) > 0) ? "Defina o Preço de Revenda primeiro" : ""}
                      />
                      <span className="absolute left-3 top-2.5 text-[10px] font-black text-slate-500">R$</span>
                    </div>
                  </div>

                  {/* Purchase Mode */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tipo de Aquisição (Pagamento)</label>
                    <select
                      value={financialData.purchaseMode}
                      onChange={(e) => setFinancialData(prev => ({ ...prev, purchaseMode: e.target.value }))}
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                    >
                      <option value="full">À Vista (Total Pago)</option>
                      <option value="installments">Consignado / Pago em Etapas</option>
                    </select>
                  </div>

                  {/* Conditional installment fields */}
                  {financialData.purchaseMode === 'installments' && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/65 border border-slate-855 rounded-2xl">
                      <p className="md:col-span-2 text-[8.5px] font-black text-amber-400 uppercase tracking-wider">
                        ⚠️ Detalhes do Pagamento Consignado
                      </p>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Descrição do Bem de Troca</label>
                        <input
                          type="text"
                          value={financialData.purchaseTradeInDesc}
                          onChange={(e) => setFinancialData(prev => ({ ...prev, purchaseTradeInDesc: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor da Troca (R$)</label>
                        <CurrencyInput
                          value={financialData.purchaseTradeInVal}
                          onChange={(val) => setFinancialData(prev => ({ ...prev, purchaseTradeInVal: val }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white shadow-sm"
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Entrada em Dinheiro (R$)</label>
                        <CurrencyInput
                          value={financialData.purchaseCashVal}
                          onChange={(val) => setFinancialData(prev => ({ ...prev, purchaseCashVal: val }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white shadow-sm"
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total de Parcelas</label>
                        <input
                          type="number"
                          value={financialData.purchaseInstallmentsTotal}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setFinancialData(prev => ({ ...prev, purchaseInstallmentsTotal: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Valor de Cada Parcela (R$)</label>
                        <CurrencyInput
                          value={financialData.purchaseInstallmentPrice}
                          onChange={(val) => setFinancialData(prev => ({ ...prev, purchaseInstallmentPrice: val }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white shadow-sm"
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Parcelas Pagas</label>
                        <input
                          type="number"
                          value={financialData.purchaseInstallmentsPaid}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setFinancialData(prev => ({ ...prev, purchaseInstallmentsPaid: e.target.value }))}
                          className="w-full h-10 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Document & Debts Expenses */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-5 bg-slate-50/70 border border-slate-200/90 rounded-2xl shadow-sm">
                    <p className="md:col-span-2 text-xs font-headline font-black text-emerald-700 uppercase tracking-wider border-b border-slate-200 pb-2.5">
                      📄 Débitos & Documentação Pendente (Despesas)
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Quitação de Financiamento (R$)</label>
                      <input
                        type="number"
                        value={financialData.payoffExpense}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, payoffExpense: e.target.value }))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Multas Pendentes (R$)</label>
                      <input
                        type="number"
                        value={financialData.finesExpense}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, finesExpense: e.target.value }))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Documentação e Transferência (R$)</label>
                      <input
                        type="number"
                        value={financialData.docExpense}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, docExpense: e.target.value }))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Outras Despesas de Doc (R$)</label>
                      <input
                        type="number"
                        value={financialData.otherExpenses}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, otherExpenses: e.target.value }))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Débito Transferência/Seguro (R$)</label>
                      <input
                        type="number"
                        value={financialData.transferInsuranceExpense}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setFinancialData(prev => ({ ...prev, transferInsuranceExpense: e.target.value }))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    {/* Custom Expenses List */}
                    <div className="md:col-span-2 space-y-2.5 pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-900">Outros Débitos Personalizados</label>
                        <button
                          type="button"
                          onClick={handleAddCustomExpenseDetails}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm"
                        >
                          + Novo Débito
                        </button>
                      </div>

                      {(financialData.customExpenses || []).map((item) => (
                        <div key={item.id} className="flex gap-2 items-center animate-fade-in">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleCustomExpenseChangeDetails(item.id, 'description', e.target.value)}
                            placeholder="Descrição (ex: IPVA Atrasado)"
                            className="flex-1 h-9 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCustomExpenseChangeDetails(item.id, 'price', e.target.value)}
                            placeholder="Valor (R$)"
                            className="w-28 h-9 px-3 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomExpenseDetails(item.id)}
                            className="h-9 w-9 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center transition-all shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingFinancial(false)}
                      className="h-10 px-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFinancial}
                      className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Top row: DRE + Compra + Venda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Financial DRE Card */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-emerald-450 text-emerald-400">
                    💸 DRE & Margem Estimada
                  </h3>
                  {!isEditingFinancial && (
                    <button
                      onClick={() => {
                        setFinancialData({
                          acquisitionPrice: vehicle.acquisitionPrice || '',
                          resalePrice: vehicle.resalePrice || '',
                          maxDiscountPercent: vehicle.maxDiscountPercent || 5,
                          purchaseMode: vehicle.purchaseMode || 'full',
                          purchaseTradeInDesc: vehicle.purchaseTradeInDesc || '',
                          purchaseTradeInVal: vehicle.purchaseTradeInVal || 0,
                          purchaseCashVal: vehicle.purchaseCashVal || 0,
                          purchaseInstallmentsTotal: vehicle.purchaseInstallmentsTotal || 0,
                          purchaseInstallmentsPaid: vehicle.purchaseInstallmentsPaid || 0,
                          purchaseInstallmentPrice: vehicle.purchaseInstallmentPrice || 0,
                          docExpense: vehicle.docExpense || '',
                          finesExpense: vehicle.finesExpense || '',
                          payoffExpense: vehicle.payoffExpense || '',
                          otherExpenses: vehicle.otherExpenses || '',
                          transferInsuranceExpense: vehicle.transferInsuranceExpense || '',
                          customExpenses: vehicle.customExpenses || []
                        });
                        setIsEditingFinancial(true);
                      }}
                      className="text-[10px] font-black uppercase text-emerald-450 text-emerald-400 hover:text-emerald-350 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Editar Financeiro
                    </button>
                  )}
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preço de Aquisição:</span>
                    <span className="font-bold text-slate-202">{formatCurrency(vehicle.acquisitionPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soma de Reparos:</span>
                    <span className="font-bold text-amber-400">{formatCurrency(totalRepairs)}</span>
                  </div>
                  {docExpense > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">└ Documentação:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(docExpense)}</span>
                    </div>
                  )}
                  {finesExpense > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">└ Multas:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(finesExpense)}</span>
                    </div>
                  )}
                  {payoffExpense > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">└ Quitação Finan.:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(payoffExpense)}</span>
                    </div>
                  )}
                  {otherExpenses > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">└ Outras Despesas:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(otherExpenses)}</span>
                    </div>
                  )}
                  {transferInsuranceExpense > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">└ Transferência/Seguro:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(transferInsuranceExpense)}</span>
                    </div>
                  )}
                  {customExpensesList.map((item) => (
                    <div key={item.id} className="flex justify-between text-[11px]">
                      <span className="text-slate-550 text-slate-500">└ {item.description || 'Débito Personalizado'}:</span>
                      <span className="font-bold text-slate-400">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-b border-slate-850 pb-2 pt-1">
                    <span className="text-slate-300 font-bold">Total Investido (Custo):</span>
                    <span className="font-bold text-white">{formatCurrency(totalInvested)}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Preço de Venda {vehicle.isSold ? 'Negociado' : 'Cheio'}:</span>
                    <span className="font-bold text-sky-400">{formatCurrency(finalSalePrice)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-300 font-bold">Margem de Lucro {vehicle.isSold ? 'Real' : 'Cheio'}:</span>
                    <span className={`font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(netProfit)} ({profitMargin.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Margem Max. Desconto:</span>
                    <span className="font-bold text-amber-400">{vehicle.maxDiscountPercent || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Desconto Máximo (R$):</span>
                    <span className="font-bold text-amber-400">{formatCurrency(maxDiscountVal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mínimo de Revenda:</span>
                    <span className="font-bold text-white">{formatCurrency(minSalePrice)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-bold">Lucro Mínimo Garantido:</span>
                    <span className={`font-black text-sm ${profitAtMaxDiscount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(profitAtMaxDiscount)}
                    </span>
                  </div>

                  {profitAtMaxDiscount <= 0 && (vehicle.resalePrice || 0) > 0 && !vehicle.isSold && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-[8.5px] font-black text-rose-400 rounded-xl uppercase tracking-wider text-center">
                      ⚠️ Risco de Prejuízo ao dar Desconto Máximo!
                    </div>
                  )}
                </div>
              </div>

              {/* Card A: Condições de Aquisição (Compra) */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-headline font-black uppercase tracking-widest text-emerald-400 border-b border-slate-800/80 pb-2">
                  💵 Condições de Aquisição (Compra)
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Forma de Aquisição:</span>
                    <span className="font-bold text-slate-202">
                      {isPurchaseInstallments ? 'Consignado / Pago em Etapas' : 'À Vista'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-300 font-bold">Valor do Veículo (Total):</span>
                    <span className="font-bold text-white">{formatCurrency(vehicle.acquisitionPrice)}</span>
                  </div>

                  {totalAdditionalExpenses > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <p className="text-[8.5px] font-black text-emerald-455 text-emerald-400 uppercase tracking-wider">Débitos & Despesas Adicionais</p>
                      {payoffExpense > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quitação Financiamento:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(payoffExpense)}</span>
                        </div>
                      )}
                      {finesExpense > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Multas Pendentes:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(finesExpense)}</span>
                        </div>
                      )}
                      {docExpense > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Doc & Transferência:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(docExpense)}</span>
                        </div>
                      )}
                      {otherExpenses > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Outras Despesas Doc:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(otherExpenses)}</span>
                        </div>
                      )}
                      {transferInsuranceExpense > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transferência/Seguro:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(transferInsuranceExpense)}</span>
                        </div>
                      )}
                      {customExpensesList.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-slate-400">{item.description || 'Débito Personalizado'}:</span>
                          <span className="font-bold text-slate-202">{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isPurchaseInstallments ? (
                    <>
                      {vehicle.purchaseTradeInDesc && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Troca ({vehicle.purchaseTradeInDesc}):</span>
                          <span className="font-bold text-slate-202">{formatCurrency(purchaseTradeInVal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Entrada Dinheiro:</span>
                        <span className="font-bold text-slate-205">{formatCurrency(purchaseCashVal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parcelamento:</span>
                        <span className="font-bold text-slate-202">
                          {vehicle.purchaseInstallmentsTotal} parcelas de {formatCurrency(purchaseInstallmentPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parcelas Pagas:</span>
                        <span className="font-bold text-emerald-400">
                          {purchaseInstallmentsPaid} de {vehicle.purchaseInstallmentsTotal} ({formatCurrency(purchaseInstallmentsPaid * purchaseInstallmentPrice)})
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-300 font-bold">
                        <span>Total Pago Compra:</span>
                        <span className="text-emerald-450">{formatCurrency(purchaseTotalPaid)}</span>
                      </div>

                      <div className="flex justify-between pt-1 text-rose-400 font-black text-sm">
                        <span>Saldo Restante a Pagar:</span>
                        <span>{formatCurrency(purchaseDebt)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-[10px] font-bold text-emerald-400">
                      Veículo quitado integralmente à vista na aquisição.
                    </div>
                  )}
                </div>
              </div>

              {/* Card B: Condições de Venda (Venda) */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400">
                    💰 Condições de Negociação (Venda)
                  </h3>
                  {vehicle.isSold && (
                    <button
                      onClick={() => {
                        setSaleData(getInitialSaleData(vehicle));
                        setIsEditingSale(true);
                      }}
                      className="text-[9px] font-black uppercase text-sky-400 hover:underline"
                    >
                      Editar Venda
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {vehicle.isSold ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Preço Inicial Pretendido:</span>
                        <span className="font-bold text-slate-300">{formatCurrency(vehicle.resalePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Desconto Concedido:</span>
                        <span className="font-bold text-amber-400">-{formatCurrency(saleDiscount)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-2">
                        <span className="text-slate-300 font-bold">Valor Final Negociado:</span>
                        <span className="font-black text-sky-400">{formatCurrency(finalSalePrice)}</span>
                      </div>

                      {/* Trade-ins details */}
                      {vehicle.saleTradeIns && vehicle.saleTradeIns.length > 0 ? (
                        vehicle.saleTradeIns.map((t, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-slate-400">Troca ({t.desc}):</span>
                            <span className="font-bold text-slate-300">{formatCurrency(parseFloat(t.val) || 0)}</span>
                          </div>
                        ))
                      ) : (
                        saleTradeInVal > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Troca Recebida ({vehicle.saleTradeInDesc || 'Bem de Troca'}):</span>
                            <span className="font-bold text-slate-300">{formatCurrency(saleTradeInVal)}</span>
                          </div>
                        )
                      )}

                      {/* Payments details */}
                      {vehicle.salePayments && vehicle.salePayments.length > 0 ? (
                        vehicle.salePayments.map((p, idx) => {
                          if (p.type === 'installments') {
                            const instTotal = parseInt(p.installmentsTotal) || 0;
                            const instPaid = parseInt(p.installmentsPaid) || 0;
                            const instPrice = parseFloat(p.installmentPrice) || 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Parcelamento Loja ({instTotal}x de {formatCurrency(instPrice)}):</span>
                                  <span className="font-bold text-slate-300">{formatCurrency(instTotal * instPrice)}</span>
                                </div>
                                <div className="flex justify-between pl-3 text-[10px]">
                                  <span className="text-slate-500">Parcelas Quitadas:</span>
                                  <span className="font-bold text-emerald-400">
                                    {instPaid} de {instTotal} ({formatCurrency(instPaid * instPrice)})
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          const labelMap = {
                            pix: 'Pix',
                            cash: 'Dinheiro',
                            credit_card: 'Cartão de Crédito',
                            debit_card: 'Cartão de Débito',
                            financing: 'Financiamento Bancário',
                            billet: 'Boleto Bancário'
                          };
                          return (
                            <div key={idx} className="flex justify-between">
                              <span className="text-slate-400">{labelMap[p.type] || 'Outro Recebimento'}:</span>
                              <span className="font-bold text-slate-300">{formatCurrency(parseFloat(p.val) || 0)}</span>
                            </div>
                          );
                        })
                      ) : (
                        vehicle.saleMode === 'installments' ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Entrada Recebida:</span>
                              <span className="font-bold text-slate-300">{formatCurrency(saleCashVal)}</span>
                            </div>
                            {saleInstallmentsTotal > 0 && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Parcelas Acordadas:</span>
                                  <span className="font-bold text-slate-300">
                                    {saleInstallmentsTotal} parcelas de {formatCurrency(saleInstallmentPrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Parcelas Quitadas:</span>
                                  <span className="font-bold text-emerald-400">
                                    {saleInstallmentsPaid} de {saleInstallmentsTotal} ({formatCurrency(saleInstallmentsPaid * saleInstallmentPrice)})
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-[10px] font-bold text-emerald-400">
                            Valor total liquidado à vista pelo comprador.
                          </div>
                        )
                      )}

                      <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-300 font-bold">
                        <span>Total Recebido:</span>
                        <span className="text-emerald-400">{formatCurrency(saleTotalReceived)}</span>
                      </div>

                      {saleRemainingDebt > 0 && (
                        <div className="flex justify-between pt-1 text-amber-400 font-black text-sm">
                          <span>Saldo Devedor do Cliente:</span>
                          <span>{formatCurrency(saleRemainingDebt)}</span>
                        </div>
                      )}

                      {/* Amortization history */}
                      {vehicle.debtPayments && vehicle.debtPayments.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-left">
                          <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-1">
                            📜 Histórico de Amortização de Dívida
                          </h4>
                          <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                            {vehicle.debtPayments.map((dp, idx) => {
                              const labelMap = {
                                pix: 'Pix',
                                cash: 'Dinheiro',
                                credit_card: 'Cartão de Crédito',
                                debit_card: 'Cartão de Débito',
                                billet: 'Boleto Bancário'
                              };
                              return (
                                <div key={dp.id || idx} className="flex justify-between items-center text-[10px] text-slate-300">
                                  <span>
                                    {new Date(dp.date).toLocaleDateString('pt-BR')} - {labelMap[dp.method] || 'Outro'}:
                                  </span>
                                  <span className="font-bold text-emerald-400 font-bold">+{formatCurrency(dp.amount)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Debt settlement trigger and inline form */}
                      {saleRemainingDebt > 0.05 && (
                        <div className="mt-2.5">
                          {!isSettlingDebt ? (
                            <button
                              onClick={() => {
                                setDebtPaymentVal(vehicle.saleMode === 'installments' ? saleInstallmentPrice.toFixed(2) : saleRemainingDebt.toFixed(2));
                                setDebtPaymentMethod('pix');
                                setDebtAmortizationOption('reduce_term');
                                setIsSettlingDebt(true);
                              }}
                              className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20"
                            >
                              <DollarSign className="h-3.5 w-3.5" /> Registrar Recebimento / Abater Dívida
                            </button>
                          ) : (
                            <form onSubmit={handleConfirmDebtPayment} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3 text-left">
                              <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex justify-between items-center">
                                <span>💸 Registrar Recebimento</span>
                                <span className="text-[8px] font-black text-slate-550 uppercase">Saldo Devedor: {formatCurrency(saleRemainingDebt)}</span>
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase tracking-wider">Valor Pago pelo Cliente (R$)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={saleRemainingDebt.toFixed(2)}
                                    value={debtPaymentVal}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setDebtPaymentVal(e.target.value)}
                                    className="w-full h-8 px-2 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                                    required
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-700 uppercase tracking-wider">Meio de Pagamento</label>
                                  <select
                                    value={debtPaymentMethod}
                                    onChange={(e) => setDebtPaymentMethod(e.target.value)}
                                    className="w-full h-8 px-2 bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                                  >
                                    <option value="pix">Pix</option>
                                    <option value="cash">Dinheiro</option>
                                    <option value="credit_card">Cartão de Crédito</option>
                                    <option value="debit_card">Cartão de Débito</option>
                                    <option value="billet">Boleto Bancário</option>
                                  </select>
                                </div>
                              </div>

                              {vehicle.saleMode === 'installments' && parseFloat(debtPaymentVal) > saleInstallmentPrice && (saleInstallmentsTotal - saleInstallmentsPaid) > 1 && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fade-in">
                                  <p className="text-[8.5px] font-black text-amber-900 uppercase tracking-wider">
                                    ⚠️ O valor pago excede uma parcela de {formatCurrency(saleInstallmentPrice)}
                                  </p>
                                  <p className="text-[8px] text-amber-700 uppercase font-bold leading-tight">
                                    Como deseja recalcular o saldo excedente de {formatCurrency(parseFloat(debtPaymentVal) - saleInstallmentPrice)}?
                                  </p>
                                  <div className="flex flex-col gap-1.5 pt-1">
                                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                      <input
                                        type="radio"
                                        name="debtAmortOption"
                                        checked={debtAmortizationOption === 'reduce_term'}
                                        onChange={() => setDebtAmortizationOption('reduce_term')}
                                        className="h-3.5 w-3.5 text-amber-600 border-amber-300 focus:ring-amber-500"
                                      />
                                      <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider">
                                        Quitar parcelas futuras (reduzir o prazo)
                                      </span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                      <input
                                        type="radio"
                                        name="debtAmortOption"
                                        checked={debtAmortizationOption === 'reduce_value'}
                                        onChange={() => setDebtAmortizationOption('reduce_value')}
                                        className="h-3.5 w-3.5 text-amber-600 border-amber-300 focus:ring-amber-500"
                                      />
                                      <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider">
                                        Diminuir o valor das parcelas restantes
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-1.5">
                                <button
                                  type="submit"
                                  className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md transition-all"
                                >
                                  Confirmar Recebimento
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsSettlingDebt(false)}
                                  className="h-8 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-black">
                        <span className="text-slate-202">Lucro Líquido Real:</span>
                        <span className={netProfit >= 0 ? 'text-emerald-450' : 'text-rose-455'}>
                          {formatCurrency(netProfit)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center space-y-3">
                      <p className="text-slate-500 font-bold uppercase tracking-wider">
                        Veículo ainda não vendido (Ativo em Estoque)
                      </p>
                      <button
                        onClick={() => {
                          setSaleData(getInitialSaleData(vehicle));
                          setIsEditingSale(true);
                        }}
                        className="h-10 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5"
                      >
                        <DollarSign className="h-4 w-4" />
                        Registrar Negociação / Venda
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Row: Repairs List + Checklist Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column A: Cost Ledger / Repairs list */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-slate-300">
                    🔧 Lista de Custos e Reparos
                  </h3>
                  <button 
                    onClick={() => setActiveTab('repairs')}
                    className="text-[9px] font-black uppercase tracking-wider text-sky-400 hover:underline"
                  >
                    Gerenciar
                  </button>
                </div>

                {repairs.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-bold bg-slate-950/20 border border-dashed border-slate-855 rounded-2xl">
                    Nenhum conserto ou custo lançado.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {repairs.map(rep => (
                      <div key={rep.id} className="p-3 bg-slate-950/40 border border-slate-855 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-202 truncate uppercase">{rep.description}</p>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none inline-block mt-1 ${
                            rep.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : rep.status === 'in-progress'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rep.status === 'completed' ? 'Concluído' : rep.status === 'in-progress' ? 'Andamento' : 'Pendente'}
                          </span>
                        </div>
                        <span className="font-bold text-slate-300 shrink-0">{formatCurrency(rep.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column B: Checklist summary & failed items */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-slate-300">
                    🛡️ Vistoria de Entrada (Checklist)
                  </h3>
                  <button 
                    onClick={() => setActiveTab('checklist')}
                    className="text-[9px] font-black uppercase tracking-wider text-sky-400 hover:underline"
                  >
                    Vistoriar
                  </button>
                </div>

                {totalChecklist === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-bold bg-slate-950/20 border border-dashed border-slate-855 rounded-2xl">
                    Nenhum checklist de vistoria realizado ainda.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Stats Boxes */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-[8px] text-slate-500 font-bold uppercase">Conforme</p>
                        <p className="text-xs font-black text-emerald-400 mt-0.5">{okChecklist}</p>
                      </div>
                      <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <p className="text-[8px] text-slate-550 font-bold uppercase">Defeito</p>
                        <p className="text-xs font-black text-rose-400 mt-0.5">{failChecklist}</p>
                      </div>
                      <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl">
                        <p className="text-[8px] text-slate-550 font-bold uppercase">N/A</p>
                        <p className="text-xs font-black text-slate-400 mt-0.5">{naChecklist}</p>
                      </div>
                    </div>

                    {/* Failed list preview */}
                    {failedList.length > 0 ? (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                        <p className="text-[9px] font-black text-rose-455 uppercase tracking-wider">Itens Não Conformes:</p>
                        {failedList.map(([key, val]) => (
                          <div key={key} className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-start gap-2 text-[10px]">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-slate-202 uppercase">{key.replace('_', ' ')}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{val.notes || 'Sem anotações detalhadas'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Nenhum item com defeito identificado na vistoria.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

        {/* Accordion Item 2: Checklist Vistoria */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'checklist' ? null : 'checklist')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'checklist' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                📋
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'checklist' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Checklist Vistoria
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Vistoria detalhada e checklist de 100+ pontos de qualidade
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'checklist' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'checklist' && (
            <div className="p-4 md:p-6 border-t border-slate-850 bg-slate-950/20 animate-fade-in space-y-4">
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Modo de Edição do Checklist
                </span>
                {!isEditingChecklist ? (
                  <button
                    onClick={() => setIsEditingChecklist(true)}
                    className="h-8 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar Checklist
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingChecklist(false)}
                      className="h-8 px-4 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingChecklist(false);
                        alert('Checklist salvo com sucesso!');
                      }}
                      className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Salvar Checklist
                    </button>
                  </div>
                )}
              </div>
              <ChecklistTab 
                checklist={vehicle.checklist || {}} 
                onChange={handleUpdateChecklist}
                onAddRepairShortcut={handleAddRepairShortcut}
                readOnly={!isEditingChecklist}
              />
            </div>
          )}
        </div>

        {/* Accordion Item 3: Reparos e Custos */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'repairs' ? null : 'repairs')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'repairs' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                🩹
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'repairs' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Reparos e Custos
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Histórico de consertos, peças e despesas adicionais
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'repairs' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'repairs' && (
            <div className="p-4 md:p-6 border-t border-slate-855 bg-slate-950/20 animate-fade-in space-y-4">
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Modo de Edição de Reparos
                </span>
                {!isEditingRepairs ? (
                  <button
                    onClick={() => setIsEditingRepairs(true)}
                    className="h-8 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar Reparos
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingRepairs(false)}
                      className="h-8 px-4 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingRepairs(false);
                        alert('Reparos e Custos salvos com sucesso!');
                      }}
                      className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Salvar Reparos
                    </button>
                  </div>
                )}
              </div>
              <RepairsTab 
                repairs={vehicle.repairs || []} 
                acquisitionPrice={vehicle.acquisitionPrice}
                resalePrice={vehicle.resalePrice}
                onChange={handleUpdateRepairs}
                readOnly={!isEditingRepairs}
              />
            </div>
          )}
        </div>

        {/* Accordion Item 4: Bloco de Notas */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'diary' ? null : 'diary')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'diary' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                📝
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'diary' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Bloco de Notas
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Anotações gerais, contatos e histórico de negociação
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'diary' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'diary' && (
            <div className="p-4 md:p-6 border-t border-slate-850 bg-slate-950/20 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-headline font-black uppercase tracking-widest text-slate-300">
                    📓 Bloco de Notas / Histórico do Veículo
                  </h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-none">
                    Registre contatos com interessados, datas de reparos ou registros gerais do carro
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="h-8 px-4 bg-sky-500 hover:bg-sky-655 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingNotes ? 'Salvando...' : 'Salvar Bloco'}
                </button>
              </div>

              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full h-80 p-5 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-2xl text-xs font-medium text-slate-200 placeholder-slate-650 leading-relaxed"
                placeholder="Escreva livremente aqui..."
              />
            </div>
          )}
        </div>

        {/* Accordion Item 5: Galeria de Fotos */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all duration-300">
          <button
            onClick={() => setActiveTab(activeTab === 'photos' ? null : 'photos')}
            className={`w-full p-4 flex items-center justify-between text-left transition-all ${
              activeTab === 'photos' 
                ? 'bg-sky-500/10 text-white' 
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-xl shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-850/80">
                📸
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-wider ${activeTab === 'photos' ? 'text-sky-400' : 'text-slate-200'}`}>
                  Galeria de Fotos
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide break-words leading-tight mt-0.5">
                  Laudo visual com fotos registradas da vistoria
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeTab === 'photos' ? 'rotate-180 text-sky-400' : ''}`} />
            </div>
          </button>

          {activeTab === 'photos' && (
            <div className="p-4 md:p-6 border-t border-slate-855 bg-slate-950/20 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Gerenciamento de Fotos
                  </span>
                  {isEditingPhotos && (
                    <div className="flex gap-1.5 text-[9px] font-bold text-slate-500">
                      <select
                        value={compressSettings.maxDimension}
                        onChange={(e) => setCompressSettings(prev => ({ ...prev, maxDimension: parseInt(e.target.value) }))}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none text-[8px] font-black uppercase"
                        title="Resolução máxima da imagem"
                      >
                        <option value="800">800px</option>
                        <option value="1024">1024px</option>
                        <option value="1200">1200px</option>
                      </select>
                      <select
                        value={compressSettings.quality}
                        onChange={(e) => setCompressSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none text-[8px] font-black uppercase"
                        title="Qualidade da compressão"
                      >
                        <option value="0.5">50%</option>
                        <option value="0.7">70%</option>
                        <option value="0.85">85%</option>
                      </select>
                    </div>
                  )}
                </div>
                {!isEditingPhotos ? (
                  <button
                    onClick={() => {
                      setPhotosData(vehicle.images || Array(12).fill(null));
                      setIsEditingPhotos(true);
                    }}
                    className="h-8 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar Fotos
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingPhotos(false)}
                      className="h-8 px-4 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePhotos}
                      className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Salvar Fotos
                    </button>
                  </div>
                )}
              </div>

              {isEditingPhotos ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photosData.map((img, idx) => (
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
                            onClick={() => {
                              const updated = [...photosData];
                              updated[idx] = null;
                              setPhotosData(updated);
                            }}
                            className="absolute top-1.5 right-1.5 h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : compressingPhotoIdx === idx ? (
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
                            {idx === 0 ? 'Principal' : `Foto ${idx + 1}`}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setCompressingPhotoIdx(idx);
                                try {
                                  const compressed = await compressImage(file, compressSettings.maxDimension, compressSettings.quality);
                                  const updated = [...photosData];
                                  updated[idx] = compressed;
                                  setPhotosData(updated);
                                } catch (err) {
                                  alert('Erro ao comprimir imagem: ' + err.message);
                                } finally {
                                  setCompressingPhotoIdx(null);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              ) : validPhotos.length === 0 ? (
                <div className="py-16 text-center text-slate-500 border border-dashed border-slate-850 rounded-2xl text-xs font-bold space-y-2">
                  <Camera className="h-8 w-8 text-slate-600 mx-auto" />
                  <p>Nenhuma foto cadastrada para este veículo.</p>
                  <p className="text-[9px] text-slate-655 font-bold uppercase">Clique no botão acima para gerenciar e adicionar fotos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {validPhotos.map((photo, idx) => (
                    <div key={idx} className="aspect-[4/3] bg-slate-950 border border-slate-855 border-slate-850 rounded-2xl overflow-hidden shadow-lg group relative">
                      <img src={photo} alt={`Veículo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white">Foto {idx + 1}</span>
                        {photo.startsWith('data:image') && (
                          <span className="text-[8px] font-black uppercase text-emerald-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                            {getBase64SizeString(photo)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-headline font-black uppercase tracking-widest text-sky-400">
                  📤 Baixar Dados / Laudo
                </h3>
                <p className="text-[9.5px] text-slate-500 font-bold uppercase mt-1 leading-none">
                  Escolha as opções de exportação do veículo
                </p>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="h-8 w-8 hover:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Dados a Incluir</label>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportScope('customer')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-center transition-all ${
                      exportScope === 'customer'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="font-black text-xs">Somente Preço de Venda</span>
                    <span className="text-[9px] font-bold mt-1 text-slate-500 uppercase">Esconde dados financeiros confidenciais (excelente para clientes)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('full')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-center transition-all ${
                      exportScope === 'full'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="font-black text-xs">Todas as Informações + Finanças (DRE)</span>
                    <span className="text-[9px] font-bold mt-1 text-slate-500 uppercase">Resumo completo com custos de aquisição, reparos, ROI e saldo devedor</span>
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Formato de Arquivo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf')}
                    className={`py-3.5 rounded-xl border text-center font-black uppercase tracking-wider transition-all ${
                      exportFormat === 'pdf'
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    📄 Documento PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('txt')}
                    className={`py-3.5 rounded-xl border text-center font-black uppercase tracking-wider transition-all ${
                      exportFormat === 'txt'
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    📝 Arquivo de Texto
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-850 text-xs">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl font-black uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExport(exportScope, exportFormat);
                  setIsExportModalOpen(false);
                }}
                className="flex-1 py-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-xl font-black uppercase tracking-wider transition-all"
              >
                Baixar Laudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT FULLSCREEN OVERLAY */}
      {isEditingSale && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100vw', 
            height: '100vh', 
            zIndex: 999999, 
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
          }} 
          className="overflow-y-auto text-left text-slate-900 animate-fade-in"
        >
          {/* Header */}
          <header className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 md:px-12 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-sky-500 text-white p-2.5 rounded-xl shadow-lg shadow-sky-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-headline font-black uppercase tracking-widest text-slate-900">
                    Checkout de Venda
                  </h3>
                  <span className="px-2 py-0.5 bg-sky-50 border border-sky-100 text-sky-600 rounded text-[9px] font-black uppercase tracking-wider">
                    {vehicle.plate || 'Sem Placa'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                  Veículo: {vehicle.brand} {vehicle.model} ({vehicle.year})
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsEditingSale(false)}
              className="h-10 px-4 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-all border border-slate-200 bg-white font-black text-[9px] uppercase tracking-wider"
            >
              <X className="h-4 w-4" /> Cancelar Checkout
            </button>
          </header>

          {/* Form wrapper */}
          <form onSubmit={handleSaveSale} className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            {/* Left Column: Transaction Details Config */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Comprador & Desconto */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                  👤 Identificação e Descontos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* System Value reference */}
                  <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-[10px] uppercase text-slate-500">Valor de Revenda (Tabela):</span>
                    <span className="font-black text-slate-900 text-sm">{formatCurrency(vehicle.resalePrice)}</span>
                  </div>

                  {/* Buyer Name */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Nome Completo do Comprador</label>
                    <input
                      type="text"
                      value={saleData.buyerName}
                      onChange={(e) => setSaleData(prev => ({ ...prev, buyerName: e.target.value }))}
                      className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400"
                      placeholder="Ex: Maria Oliveira Santos"
                      required
                    />
                  </div>

                  {/* Discount given */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Desconto Concedido (R$)</label>
                    <CurrencyInput
                      value={saleData.saleDiscount}
                      onChange={(val) => setSaleData(prev => ({ ...prev, saleDiscount: val }))}
                      className="w-full h-10 px-3 bg-white border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-xl text-xs font-bold text-slate-900"
                      placeholder="0,00"
                    />
                  </div>

                  {/* Negotiated Price (read-only output) */}
                  {(() => {
                    const priceResale = parseFloat(vehicle.resalePrice) || 0;
                    const currentDiscount = parseFloat(saleData.saleDiscount) || 0;
                    const finalPrice = priceResale - currentDiscount;
                    const potentialProfit = priceResale - totalInvested;
                    const isPriceRed = currentDiscount > potentialProfit;
                    return (
                      <div className="space-y-1.5 relative">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700">Preço Final Negociado (R$)</label>
                          {isPriceRed && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded font-black uppercase tracking-wider animate-pulse">
                              ⚠️ PREJUÍZO!
                            </span>
                          )}
                        </div>
                        <div className={`w-full h-10 px-3 bg-white border rounded-xl text-xs font-black flex items-center justify-between ${isPriceRed ? 'text-rose-600 border-rose-500 bg-rose-50' : 'text-sky-600 border-slate-300'}`}>
                          <span>{formatCurrency(finalPrice)}</span>
                          {isPriceRed && (
                            <span className="text-[9px] font-bold text-rose-500">
                              (Perda de {formatCurrency(totalInvested - finalPrice)})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION: VEÍCULOS DE TROCA */}
              <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-3 gap-3">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      🚗 Veículos / Bens de Troca
                    </h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Informe se algum veículo foi pego na negociação</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSaleData(prev => ({
                          ...prev,
                          hasTradeIn: false,
                          saleTradeIns: []
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                        !saleData.hasTradeIn
                          ? 'bg-slate-200 border-slate-300 text-slate-700 font-black shadow-sm'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Não houve troca
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSaleData(prev => {
                          const tradeIns = prev.saleTradeIns.length > 0 ? prev.saleTradeIns : [{ id: Date.now(), desc: '', val: '' }];
                          return {
                            ...prev,
                            hasTradeIn: true,
                            saleTradeIns: tradeIns
                          };
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                        saleData.hasTradeIn
                          ? 'bg-sky-500 border-sky-500 text-white font-black shadow-lg shadow-sky-500/10'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Houve Troca
                    </button>
                  </div>
                </div>

                {saleData.hasTradeIn && (
                  <div className="space-y-3">
                    {saleData.saleTradeIns.map((trade, idx) => (
                      <div key={trade.id} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-white p-3 border border-slate-200 rounded-xl relative">
                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Descrição do Veículo (Troca {idx + 1})</label>
                          <input
                            type="text"
                            value={trade.desc}
                            onChange={(e) => {
                              const updated = saleData.saleTradeIns.map(t => t.id === trade.id ? { ...t, desc: e.target.value } : t);
                              setSaleData(prev => ({ ...prev, saleTradeIns: updated }));
                            }}
                            className="w-full h-8 px-2 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                            placeholder="Ex: Honda Civic LXR 2.0 Flex 2016"
                            required
                          />
                        </div>
                        <div className="w-full md:w-48 space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Valor Pago / Avaliação (R$)</label>
                          <CurrencyInput
                            value={trade.val}
                            onChange={(val) => {
                              const updated = saleData.saleTradeIns.map(t => t.id === trade.id ? { ...t, val } : t);
                              setSaleData(prev => ({ ...prev, saleTradeIns: updated }));
                            }}
                            className="w-full h-8 px-2 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                            placeholder="0,00"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = saleData.saleTradeIns.filter(t => t.id !== trade.id);
                            setSaleData(prev => ({
                              ...prev,
                              saleTradeIns: updated,
                              hasTradeIn: updated.length > 0
                            }));
                          }}
                          className="h-8 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg flex items-center justify-center transition-all w-full md:w-auto"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setSaleData(prev => ({
                          ...prev,
                          saleTradeIns: [...prev.saleTradeIns, { id: Date.now(), desc: '', val: '' }]
                        }))}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                      >
                        + Adicionar Outro Veículo de Troca
                      </button>
                      <div className="text-[10px] font-black text-slate-700">
                        SUBTOTAL TROCAS: <span className="text-sky-600 font-extrabold">{formatCurrency(saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: FORMAS DE RECEBIMENTO / PAGAMENTOS RECEBIDOS NO ATO */}
              <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      💵 Valores Recebidos à Vista / Entrada
                    </h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Adicione todos os valores já pagos (Pix, Dinheiro, Cartões, etc.)</p>
                  </div>
                </div>

                {saleData.salePayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                      Nenhum pagamento registrado. Informe ao menos um pagamento ou sinal.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSaleData(prev => ({
                        ...prev,
                        salePayments: [...prev.salePayments, { id: Date.now(), type: 'pix', val: '' }]
                      }))}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      + Adicionar Pagamento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {saleData.salePayments.map((payment, idx) => (
                      <div key={payment.id} className="flex flex-col md:flex-row gap-3 items-end md:items-center bg-white p-3 border border-slate-200 rounded-xl relative">
                        <div className="w-full md:w-48 space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Meio de Pagamento</label>
                          <select
                            value={payment.type}
                            onChange={(e) => {
                              const updated = saleData.salePayments.map(p => p.id === payment.id ? { ...p, type: e.target.value } : p);
                              setSaleData(prev => ({ ...prev, salePayments: updated }));
                            }}
                            className="w-full h-8 px-2 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                          >
                            <option value="pix">Pix</option>
                            <option value="cash">Dinheiro</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="financing">Financiamento Bancário</option>
                            <option value="billet">Boleto Bancário</option>
                          </select>
                        </div>
                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[8px] font-black uppercase tracking-wider text-slate-500">Valor Recebido (R$)</label>
                          <div className="flex gap-1.5 items-center">
                            <CurrencyInput
                              value={payment.val}
                              onChange={(val) => {
                                const updated = saleData.salePayments.map(p => p.id === payment.id ? { ...p, val } : p);
                                setSaleData(prev => ({ ...prev, salePayments: updated }));
                              }}
                              className="flex-1 h-8 px-2 bg-white border border-slate-200 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                              placeholder="0,00"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const priceResale = parseFloat(vehicle.resalePrice) || 0;
                                const disc = parseFloat(saleData.saleDiscount) || 0;
                                const finalPrice = priceResale - disc;
                                const totalTradeIn = saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0);
                                const otherPayments = saleData.salePayments
                                  .filter(p => p.id !== payment.id)
                                  .reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0);
                                const remaining = Math.max(0, finalPrice - (totalTradeIn + otherPayments));
                                
                                const updated = saleData.salePayments.map(p => 
                                  p.id === payment.id ? { ...p, val: String(remaining) } : p
                                );
                                setSaleData(prev => ({ ...prev, salePayments: updated }));
                              }}
                              className="h-8 px-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap"
                            >
                              Restante
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = saleData.salePayments.filter(p => p.id !== payment.id);
                            setSaleData(prev => ({ ...prev, salePayments: updated }));
                          }}
                          className="h-8 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg flex items-center justify-center transition-all w-full md:w-auto"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setSaleData(prev => ({
                          ...prev,
                          salePayments: [...prev.salePayments, { id: Date.now(), type: 'pix', val: '' }]
                        }))}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                      >
                        + Adicionar Outro Pagamento
                      </button>
                      <div className="text-[10px] font-black text-slate-700">
                        SUBTOTAL RECEBIDOS: <span className="text-slate-900 font-extrabold">{formatCurrency(saleData.salePayments.reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: SALDO DEVEDOR / A PRAZO (INSTALLMENTS) */}
              {(() => {
                const priceResale = parseFloat(vehicle.resalePrice) || 0;
                const disc = parseFloat(saleData.saleDiscount) || 0;
                const finalPrice = priceResale - disc;
                const totalTradeIn = saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0);
                const totalPayments = saleData.salePayments.reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0);
                const remainingBalance = finalPrice - (totalTradeIn + totalPayments);

                if (remainingBalance <= 0.05) {
                  return (
                    <div className="md:col-span-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <div>
                          <p className="font-black uppercase tracking-wider text-[9px] text-emerald-900">Negociação 100% Liquidada</p>
                          <p className="font-bold text-[9px] text-emerald-600 uppercase mt-0.5">Nenhum saldo restante pendente de parcelamento</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-900">{formatCurrency(finalPrice)}</span>
                    </div>
                  );
                }

                const instTotal = parseInt(saleData.saleInstallmentsTotal) || 12;
                const calculatedPrice = remainingBalance / instTotal;
                const instPrice = saleData.isInstallmentPriceOverridden && saleData.saleInstallmentPrice
                  ? parseFloat(saleData.saleInstallmentPrice) || 0
                  : calculatedPrice;

                return (
                  <div className="md:col-span-2 p-5 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕒</span>
                        <div>
                          <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">
                            Total Restante Após Pagamentos
                          </h4>
                          <p className="text-[8.5px] text-amber-700 font-bold uppercase mt-1">
                            Saldo devedor residual: <span className="font-black text-amber-900">{formatCurrency(remainingBalance)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Box/Selector to mark remainder as installments */}
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100/70 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-150 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={!!saleData.markRemainingAsInstallments}
                          onChange={(e) => setSaleData(prev => ({ ...prev, markRemainingAsInstallments: e.target.checked }))}
                          className="h-4 w-4 text-amber-600 border-amber-300 focus:ring-amber-500 rounded cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                          Marcar o restante no prazo
                        </span>
                      </label>
                    </div>

                    {saleData.markRemainingAsInstallments ? (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Total Installments Select */}
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-700">Qtd. Total de Parcelas</label>
                            <select
                              value={saleData.saleInstallmentsTotal}
                              onChange={(e) => setSaleData(prev => ({ ...prev, saleInstallmentsTotal: e.target.value }))}
                              className="w-full h-8 px-2 bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                              required
                            >
                              {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>{n}x</option>
                              ))}
                            </select>
                          </div>

                          {/* Installments Paid */}
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-700">Parcelas Já Pagas (Sinal/Histórico)</label>
                            <input
                              type="number"
                              min="0"
                              max={saleData.saleInstallmentsTotal}
                              value={saleData.saleInstallmentsPaid}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = Math.min(parseInt(e.target.value) || 0, parseInt(saleData.saleInstallmentsTotal) || 1);
                                setSaleData(prev => ({ ...prev, saleInstallmentsPaid: val.toString() }));
                              }}
                              className="w-full h-8 px-2 bg-white border border-slate-300 focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold text-slate-900"
                              placeholder="0"
                              required
                            />
                          </div>

                          {/* Value per Installment */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[8px] font-black uppercase tracking-wider text-slate-700">Valor da Parcela (R$)</label>
                              {saleData.isInstallmentPriceOverridden && (
                                <button
                                  type="button"
                                  onClick={() => setSaleData(prev => ({ ...prev, isInstallmentPriceOverridden: false, saleInstallmentPrice: '' }))}
                                  className="text-[7.5px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-wider"
                                  title="Resetar 🔄"
                                >
                                  Resetar 🔄
                                </button>
                              )}
                            </div>
                            <CurrencyInput
                              value={saleData.isInstallmentPriceOverridden ? saleData.saleInstallmentPrice : instPrice.toFixed(2)}
                              onChange={(val) => setSaleData(prev => ({ ...prev, isInstallmentPriceOverridden: true, saleInstallmentPrice: val }))}
                              className={`w-full h-8 px-2 bg-white border focus:border-sky-500 focus:outline-none rounded-lg text-[11px] font-bold ${
                                saleData.isInstallmentPriceOverridden ? 'text-sky-600 border-sky-300 font-extrabold' : 'text-slate-900 border-slate-300'
                              }`}
                              placeholder="0,00"
                              required
                            />
                          </div>
                        </div>

                        <div className="text-[10px] text-amber-900 font-bold bg-amber-100/50 p-2.5 rounded-lg flex justify-between items-center">
                          <span>VALOR TOTAL PARCELADO E REGISTRADO:</span>
                          <span className="font-black text-sm">{formatCurrency(instTotal * instPrice)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-100/20 border border-dashed border-amber-300 rounded-xl text-center text-[9px] font-bold uppercase tracking-wider text-amber-800">
                        ℹ️ O saldo de {formatCurrency(remainingBalance)} ficará registrado como saldo devedor em aberto na ficha do veículo.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Resumo do Checkout da Venda */}
              {(() => {
                const priceResale = parseFloat(vehicle.resalePrice) || 0;
                const disc = parseFloat(saleData.saleDiscount) || 0;
                const finalPrice = priceResale - disc;
                const potProfit = priceResale - totalInvested;
                const isPriceRed = disc > potProfit;
                
                const totalTradeIn = saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0);
                const totalPayments = saleData.salePayments.reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0);

                // Installment calculations for summary
                const remainingBalance = finalPrice - (totalTradeIn + totalPayments);
                let installmentsVal = 0;
                if (remainingBalance > 0.05) {
                  const instTotal = parseInt(saleData.saleInstallmentsTotal) || 12;
                  const calculatedPrice = remainingBalance / instTotal;
                  const instPrice = saleData.isInstallmentPriceOverridden && saleData.saleInstallmentPrice
                    ? parseFloat(saleData.saleInstallmentPrice) || 0
                    : calculatedPrice;
                  installmentsVal = instTotal * instPrice;
                }

                const totalComposition = totalTradeIn + totalPayments + installmentsVal;

                const profitVal = finalPrice - totalInvested;
                const diffVal = finalPrice - totalComposition;

                return (
                  <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-slate-800">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 flex justify-between items-center">
                      <span>📋 Resumo do Checkout da Venda</span>
                      {Math.abs(diffVal) < 0.05 ? (
                        <span className="text-[8px] px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-black uppercase tracking-wider">
                          Valores Coincidentes
                        </span>
                      ) : (
                        <span className="text-[8px] px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-black uppercase tracking-wider animate-pulse">
                          Diferença: {formatCurrency(Math.abs(diffVal))}
                        </span>
                      )}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Detalhes de Custo */}
                      <div className="space-y-1.5">
                        <h5 className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Detalhamento dos Custos</h5>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Preço de Custo (Compra):</span>
                          <span className="font-bold text-slate-900">{formatCurrency(vehicle.acquisitionPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Investido em Peças/Reparos:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalRepairs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Documentação e Débitos:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalAdditionalExpenses)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                          <span className="text-slate-700">Total Investido (Custo Geral):</span>
                          <span className="text-slate-900">{formatCurrency(totalInvested)}</span>
                        </div>
                      </div>

                      {/* Negociação e Lucros */}
                      <div className="space-y-1.5">
                        <h5 className="text-[8px] font-black text-slate-550 uppercase tracking-wider">Simulação do Resultado</h5>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Preço Estimado Inicial:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(priceResale)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Desconto Concedido:</span>
                          <span className="font-bold text-amber-600">-{formatCurrency(disc)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Desconto Máximo Permitido:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(maxDiscountVal)}</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                          <span className="text-slate-700">Preço Final Negociado:</span>
                          <span className={isPriceRed ? "text-rose-600 font-black" : "text-sky-600"}>
                            {formatCurrency(finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Composição de Recebimentos */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <h5 className="text-[8px] font-black text-slate-550 uppercase tracking-wider">Composição do Recebimento</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase font-bold">Bens de Troca (+)</span>
                          <span className="font-bold text-sky-600">{formatCurrency(totalTradeIn)}</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[9px] uppercase font-bold">À Vista / Entrada (+)</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalPayments)}</span>
                        </div>
                        {remainingBalance > 0.05 && (
                          <div>
                            <span className="text-slate-550 block text-[9px] uppercase font-bold">Saldo a Prazo (+)</span>
                            <span className="font-bold text-amber-600">{formatCurrency(installmentsVal)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1.5 text-xs font-bold">
                        <span className="text-slate-700 font-bold">Soma Total dos Recebimentos:</span>
                        <span className="text-emerald-600">{formatCurrency(totalComposition)}</span>
                      </div>
                      {Math.abs(diffVal) > 0.05 && (
                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wide text-center pt-1 animate-pulse">
                          ⚠️ Atenção: A soma dos recebimentos ({formatCurrency(totalComposition)}) difere do preço negociado ({formatCurrency(finalPrice)}) por {formatCurrency(Math.abs(diffVal))}!
                        </p>
                      )}
                    </div>

                    {/* Lucro e Margem */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white text-left">
                      <div>
                        <p className="text-[8px] font-black text-slate-550 uppercase tracking-wider leading-none">Lucro Líquido Real da Venda</p>
                        <p className={`text-base font-black mt-1 ${profitVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(profitVal)} ({totalInvested > 0 ? ((profitVal / totalInvested) * 100).toFixed(1) : 0}%)
                        </p>
                      </div>
                      {profitVal < 0 && (
                        <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-[9px] font-black text-rose-600 rounded-lg uppercase tracking-wider animate-pulse">
                          ⚠️ Venda com Prejuízo!
                        </span>
                      )}
                      {profitVal >= 0 && profitVal < (potProfit - maxDiscountVal) && (
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-[9px] font-black text-amber-600 rounded-lg uppercase tracking-wider">
                          Abaixo da Meta
                        </span>
                      )}
                      {profitVal >= (potProfit - maxDiscountVal) && (
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-600 rounded-lg uppercase tracking-wider">
                          Excelente Margem
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Column: Financial Report & Actions */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 h-fit">
              {/* Resumo do Checkout da Venda */}
              {(() => {
                const priceResale = parseFloat(vehicle.resalePrice) || 0;
                const disc = parseFloat(saleData.saleDiscount) || 0;
                const finalPrice = priceResale - disc;
                const potProfit = priceResale - totalInvested;
                const isPriceRed = disc > potProfit;
                
                const totalTradeIn = saleData.saleTradeIns.reduce((sum, t) => sum + (parseFloat(t.val) || 0), 0);
                const totalPayments = saleData.salePayments.reduce((sum, p) => sum + (parseFloat(p.val) || 0), 0);

                // Installment calculations for summary
                const remainingBalance = finalPrice - (totalTradeIn + totalPayments);
                let installmentsVal = 0;
                if (remainingBalance > 0.05) {
                  const instTotal = parseInt(saleData.saleInstallmentsTotal) || 12;
                  const calculatedPrice = remainingBalance / instTotal;
                  const instPrice = saleData.isInstallmentPriceOverridden && saleData.saleInstallmentPrice
                    ? parseFloat(saleData.saleInstallmentPrice) || 0
                    : calculatedPrice;
                  installmentsVal = instTotal * instPrice;
                }

                const totalComposition = totalTradeIn + totalPayments + installmentsVal;

                const profitVal = finalPrice - totalInvested;
                const diffVal = finalPrice - totalComposition;

                return (
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 text-slate-800 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 flex justify-between items-center">
                      <span>📋 Resumo do Checkout da Venda</span>
                      {Math.abs(diffVal) < 0.05 ? (
                        <span className="text-[8px] px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-black uppercase tracking-wider">
                          Valores Coincidentes
                        </span>
                      ) : (
                        <span className="text-[8px] px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-black uppercase tracking-wider animate-pulse">
                          Diferença: {formatCurrency(Math.abs(diffVal))}
                        </span>
                      )}
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      {/* Detalhes de Custo */}
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <h5 className="text-[8px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Detalhamento dos Custos</h5>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Preço de Custo (Compra):</span>
                          <span className="font-bold text-slate-900">{formatCurrency(vehicle.acquisitionPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Investido em Peças/Reparos:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalRepairs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Documentação e Débitos:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalAdditionalExpenses)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-black">
                          <span className="text-slate-700 uppercase text-[8px]">Total Investido (Custo Geral):</span>
                          <span className="text-slate-900">{formatCurrency(totalInvested)}</span>
                        </div>
                      </div>

                      {/* Negociação e Lucros */}
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <h5 className="text-[8px] font-black text-slate-550 uppercase tracking-wider border-b border-slate-200 pb-1">Simulação do Resultado</h5>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Preço Estimado Inicial:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(priceResale)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Desconto Concedido:</span>
                          <span className="font-bold text-amber-600">-{formatCurrency(disc)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[8px]">Desconto Máximo Permitido:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(maxDiscountVal)}</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-black">
                          <span className="text-slate-700 uppercase text-[8px]">Preço Final Negociado:</span>
                          <span className={isPriceRed ? "text-rose-600 font-black" : "text-sky-600"}>
                            {formatCurrency(finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Composição de Recebimentos */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <h5 className="text-[8px] font-black text-slate-550 uppercase tracking-wider border-b border-slate-200 pb-1">Composição do Recebimento</h5>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-550 block text-[8px] uppercase font-bold">Bens de Troca (+)</span>
                          <span className="font-bold text-sky-600">{formatCurrency(totalTradeIn)}</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[8px] uppercase font-bold">Entrada (+)</span>
                          <span className="font-bold text-slate-900">{formatCurrency(totalPayments)}</span>
                        </div>
                        <div>
                          <span className="text-slate-550 block text-[8px] uppercase font-bold">A Prazo (+)</span>
                          <span className="font-bold text-amber-600">{formatCurrency(installmentsVal)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1.5 text-xs font-bold">
                        <span className="text-slate-700 font-bold">Soma Total dos Recebimentos:</span>
                        <span className="text-emerald-600">{formatCurrency(totalComposition)}</span>
                      </div>
                      {Math.abs(diffVal) > 0.05 && (
                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wide text-center pt-1 animate-pulse">
                          ⚠️ Diferença de recebimento: {formatCurrency(Math.abs(diffVal))}!
                        </p>
                      )}
                    </div>

                    {/* Lucro e Margem */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-left">
                      <div>
                        <p className="text-[8px] font-black text-slate-550 uppercase tracking-wider leading-none">Lucro Líquido Real da Venda</p>
                        <p className={`text-base font-black mt-1 ${profitVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(profitVal)} ({totalInvested > 0 ? ((profitVal / totalInvested) * 100).toFixed(1) : 0}%)
                        </p>
                      </div>
                      {profitVal < 0 && (
                        <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-[9px] font-black text-rose-600 rounded-lg uppercase tracking-wider animate-pulse">
                          ⚠️ Venda com Prejuízo!
                        </span>
                      )}
                      {profitVal >= 0 && profitVal < (potProfit - maxDiscountVal) && (
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-[9px] font-black text-amber-600 rounded-lg uppercase tracking-wider">
                          Abaixo da Meta
                        </span>
                      )}
                      {profitVal >= (potProfit - maxDiscountVal) && (
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-600 rounded-lg uppercase tracking-wider">
                          Excelente Margem
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <button
                  type="submit"
                  className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-4 w-4" /> Confirmar e Salvar Venda
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSale(false)}
                  className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 transition-all"
                >
                  Cancelar e Voltar
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
