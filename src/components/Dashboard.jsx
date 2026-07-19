import React, { useState } from 'react';
import { Search, Car, ChevronRight, Trash2, Plus } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export default function Dashboard({ vehicles, onSelectVehicle, onDeleteVehicle, onAddVehicleClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const activeVehicles = vehicles.filter(v => !v.isSold);
  const soldVehicles = vehicles.filter(v => v.isSold);

  // Supercharged search bar matching logic
  const matchesSearch = (v) => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return true;

    // Financial metrics for search
    const repairsCost = (v.repairs || []).reduce((sum, r) => sum + (r.price || 0), 0);
    const totalCarInvested = (v.acquisitionPrice || 0) + repairsCost;
    const profit = (v.resalePrice || 0) - totalCarInvested;

    // Match status/smart queries
    if (s === 'com reparo' || s === 'com reparos') {
      return (v.repairs || []).length > 0;
    }
    if (s === 'sem reparo' || s === 'sem reparos') {
      return (v.repairs || []).length === 0;
    }
    if (s === 'com lucro' || s === 'lucroso') {
      return profit > 0;
    }
    if (s === 'com prejuízo' || s === 'prejuízo' || s === 'prejuizo' || s === 'com prejuizo') {
      return profit <= 0;
    }
    if (s === 'vendido' || s === 'vendidos') {
      return v.isSold;
    }
    if (s === 'ativo' || s === 'ativos' || s === 'estoque' || s === 'em estoque') {
      return !v.isSold;
    }
    if (s === 'consignado' || s === 'consignados') {
      return v.purchaseMode === 'installments';
    }

    // Standard fields matching
    const brandMatch = (v.brand || '').toLowerCase().includes(s);
    const modelMatch = (v.model || '').toLowerCase().includes(s);
    const plateMatch = (v.plate || '').toLowerCase().includes(s);
    const chassisMatch = (v.chassis || '').toLowerCase().includes(s);
    const yearMatch = String(v.year || '').toLowerCase().includes(s);
    const colorMatch = (v.color || '').toLowerCase().includes(s);
    const prevOwnerMatch = (v.previousOwner || '').toLowerCase().includes(s);
    const buyerMatch = (v.buyerName || '').toLowerCase().includes(s);
    const fuelMatch = 
      (v.fuelLevel || '').toLowerCase().includes(s) ||
      (v.fuelType || '').toLowerCase().includes(s) ||
      (v.fuelType === 'eletrico' && 'elétrico'.includes(s)) ||
      (v.fuelType === 'hibrido' && 'híbrido'.includes(s));

    // Price and currency matching (numeric clean search)
    const cleanNum = s.replace(/[^\d]/g, '');
    let priceMatch = false;
    if (cleanNum) {
      const acqStr = String(v.acquisitionPrice || '');
      const resStr = String(v.resalePrice || '');
      priceMatch = acqStr.includes(cleanNum) || resStr.includes(cleanNum);
    }

    return (
      brandMatch ||
      modelMatch ||
      plateMatch ||
      chassisMatch ||
      yearMatch ||
      colorMatch ||
      prevOwnerMatch ||
      buyerMatch ||
      fuelMatch ||
      priceMatch
    );
  };

  const filteredActive = activeVehicles.filter(v => matchesSearch(v));
  const filteredSold = soldVehicles.filter(v => matchesSearch(v));

  return (
    <div className="space-y-6">
      
      {/* Top Action Row */}
      <div className="flex justify-end pb-1">
        <button
          onClick={onAddVehicleClick}
          className="h-11 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Novo Veículo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/40 p-3.5 border border-slate-800/80 rounded-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-850 focus:border-sky-500 focus:outline-none rounded-xl text-xs font-bold text-white placeholder-slate-500"
            placeholder="Buscar por placa, chassi, modelo, ano, proprietário antigo, comprador, preço de compra/revenda..."
          />
        </div>
      </div>



      {/* SECTION 1: Active Vehicles in Stock */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-headline font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
          <span className="h-2 w-2 bg-sky-500 rounded-full animate-pulse"></span>
          Veículos em Estoque / Ativos ({filteredActive.length})
        </h3>

        {filteredActive.length === 0 ? (
          <div className="glass-panel py-12 text-center rounded-3xl border border-dashed border-slate-850 space-y-3">
            <Car className="h-10 w-10 text-slate-700 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-headline font-black uppercase tracking-wider text-slate-400">Nenhum veículo ativo</h4>
              <p className="text-[9px] text-slate-500 font-bold max-w-xs mx-auto">
                Todos os veículos ativos foram vendidos ou nenhum corresponde aos critérios de pesquisa.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredActive.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={() => onSelectVehicle(vehicle)} 
                onDelete={onDeleteVehicle} 
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Sold Vehicles (Histórico) */}
      <div className="space-y-4 pt-4 border-t border-slate-900">
        <h3 className="text-[10px] font-headline font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="h-2 w-2 bg-emerald-500/40 rounded-full"></span>
          Histórico de Veículos Vendidos ({filteredSold.length})
        </h3>

        {filteredSold.length === 0 ? (
          <div className="py-6 text-center text-slate-600 text-[10px] font-bold uppercase border border-dashed border-slate-850/60 rounded-2xl">
            Nenhum veículo vendido no histórico.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSold.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={() => onSelectVehicle(vehicle)} 
                onDelete={onDeleteVehicle} 
                isSoldStyle={true} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Subcomponent for vehicle cards to prevent repetitive code, enforcing exactly 1 vehicle per row
function VehicleCard({ vehicle, onClick, onDelete, isSoldStyle = false }) {
  const repairsCost = (vehicle.repairs || []).reduce((sum, r) => sum + (r.price || 0), 0);
  const totalInvestedVehicle = (vehicle.acquisitionPrice || 0) + repairsCost;
  const profitVehicle = (vehicle.resalePrice || 0) - totalInvestedVehicle;
  const profitPercent = totalInvestedVehicle > 0 ? (profitVehicle / totalInvestedVehicle) * 100 : 0;
  
  const mainPhoto = (vehicle.images || []).find(img => img && (img.startsWith('data:image') || img.startsWith('http') || img.startsWith('https') || img.startsWith('/'))) || null;

  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-3xl overflow-hidden hover:border-sky-500/40 hover:scale-[1.005] active:scale-99 cursor-pointer transition-all shadow-lg flex flex-col md:flex-row group w-full ${
        isSoldStyle ? 'opacity-55 grayscale-[25%] hover:opacity-90 hover:grayscale-0' : ''
      }`}
    >
      {/* Photo Column */}
      <div className="h-44 md:h-auto md:w-56 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-850 relative flex items-center justify-center text-slate-750 shrink-0">
        {mainPhoto ? (
          <img src={mainPhoto} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-60">
            <Car className="h-8 w-8 text-slate-600" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sem Foto</span>
          </div>
        )}

        {/* Sold Badge inside photo */}
        {isSoldStyle && (
          <span className="absolute bottom-3.5 left-3.5 bg-emerald-500 text-white border border-emerald-450 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase leading-none shadow-md">
            Vendido
          </span>
        )}
      </div>

      {/* Content Column */}
      <div className="p-5 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Info */}
        <div className="space-y-2.5 min-w-0">
          <div>
            <h4 className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
              {(vehicle.brand || 'Marca N/D').toUpperCase()}
            </h4>
            <h3 className={`text-base font-headline font-black text-white uppercase tracking-tight mt-1 leading-tight group-hover:text-sky-400 transition-colors ${
              isSoldStyle ? 'line-through text-slate-400 decoration-slate-600' : ''
            }`}>
              {vehicle.model || 'Modelo N/D'}
            </h3>
          </div>

          {/* Placa & Ano Badges (Destacados na parte de baixo) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Placa bem destacada */}
            <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-sky-500/40 text-sky-400 font-mono font-black text-[11px] px-2.5 py-1 rounded-lg shadow-sm tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              {vehicle.plate || 'SEM PLACA'}
            </span>

            {/* Ano */}
            <span className="inline-flex items-center bg-slate-900 border border-slate-800 text-slate-300 font-headline font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {vehicle.year ? `Ano ${vehicle.year}` : 'Ano N/D'}
            </span>
          </div>
        </div>

        {/* Financial info */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-850/60 pt-3 md:pt-0">
          <div className="flex gap-6 text-left">
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider leading-none">Investimento</p>
              <p className="text-xs font-bold text-slate-200 mt-1 leading-none">{formatCurrency(totalInvestedVehicle)}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider leading-none">Preço Revenda</p>
              <p className="text-xs font-bold text-slate-200 mt-1 leading-none">{formatCurrency(vehicle.resalePrice)}</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider leading-none">Lucro Estimado</p>
              <p className={`text-xs font-black mt-1 leading-none ${profitVehicle >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(profitVehicle)} ({profitPercent.toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
