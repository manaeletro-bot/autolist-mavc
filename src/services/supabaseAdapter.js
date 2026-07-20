import { createClient } from '@supabase/supabase-js';
import { localAdapter, isDemoAccount } from './localAdapter';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (e) {
    console.warn('Erro ao inicializar cliente Supabase.', e);
  }
  return null;
}

export function mapFromSupabase(row) {
  if (!row) return null;

  const rawNotes = row.generalnotes || '';
  let generalNotes = rawNotes;
  let extras = {};

  if (rawNotes.includes('\n\n---VORA_METADATA---\n')) {
    const parts = rawNotes.split('\n\n---VORA_METADATA---\n');
    generalNotes = parts[0];
    try {
      extras = JSON.parse(parts[1]);
    } catch (e) {
      console.warn('Error parsing metadata from generalnotes:', e);
    }
  }

  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    user_id: extras.user_id || null,
    brand: row.brand || '',
    model: row.model || '',
    year: row.year ? String(row.year) : '',
    color: row.color || '',
    plate: row.plate || '',
    chassis: row.chassis || '',
    km: row.km || 0,
    fuelLevel: row.fuellevel ?? row.fuelLevel ?? '1/2',
    fuelType: extras.fuelType ?? 'flex',
    acquisitionPrice: row.acquisitionprice ?? row.acquisitionPrice ?? 0,
    resalePrice: row.resaleprice ?? row.resalePrice ?? 0,
    maxDiscountPercent: row.maxdiscountpercent ?? row.maxDiscountPercent ?? 0,
    images: row.images || [],
    checklist: row.checklist || {},
    repairs: row.repairs || [],
    generalNotes: generalNotes,
    doors: extras.doors ?? '4',
    occupants: extras.occupants ?? '5',
    options: extras.options || [],
    isSold: row.issold ?? row.isSold ?? false,
    buyerName: row.buyername ?? row.buyerName ?? '',
    salePrice: row.saleprice ?? row.salePrice ?? 0,
    saleDate: row.saledate ?? row.saleDate ?? null,
    docExpense: row.docexpense ?? row.docExpense ?? 0,
    finesExpense: row.finesexpense ?? row.finesExpense ?? 0,
    payoffExpense: row.payoffexpense ?? row.payoffExpense ?? 0,
    otherExpenses: row.otherexpenses ?? row.otherExpenses ?? 0,
    transferInsuranceExpense: row.transferinsuranceexpense ?? row.transferInsuranceExpense ?? 0,
    customExpenses: row.customexpenses ?? row.customExpenses ?? [],
    purchaseMode: extras.purchaseMode ?? 'full',
    purchaseTradeInDesc: extras.purchaseTradeInDesc ?? '',
    purchaseTradeInVal: extras.purchaseTradeInVal ?? 0,
    purchaseCashVal: extras.purchaseCashVal ?? 0,
    purchaseInstallmentsTotal: extras.purchaseInstallmentsTotal ?? 0,
    purchaseInstallmentsPaid: extras.purchaseInstallmentsPaid ?? 0,
    purchaseInstallmentPrice: extras.purchaseInstallmentPrice ?? 0,
    previousOwner: extras.previousOwner ?? '',
    
    // Sale and debt settlement columns mapped from metadata
    saleDiscount: extras.saleDiscount ?? 0,
    saleMode: extras.saleMode ?? 'full',
    saleTradeInDesc: extras.saleTradeInDesc ?? '',
    saleTradeInVal: extras.saleTradeInVal ?? 0,
    saleCashVal: extras.saleCashVal ?? 0,
    saleInstallmentsTotal: extras.saleInstallmentsTotal ?? 0,
    saleInstallmentsPaid: extras.saleInstallmentsPaid ?? 0,
    saleInstallmentPrice: extras.saleInstallmentPrice ?? 0,
    saleTradeIns: extras.saleTradeIns || [],
    salePayments: extras.salePayments || [],
    debtPayments: extras.debtPayments || []
  };
}

export function mapToSupabase(data) {
  const row = {};
  
  // Standard existing columns in the vehicles table
  if (data.brand !== undefined) row.brand = data.brand;
  if (data.model !== undefined) row.model = data.model;
  if (data.year !== undefined) row.year = String(data.year);
  if (data.color !== undefined) row.color = data.color;
  if (data.plate !== undefined) row.plate = data.plate;
  if (data.chassis !== undefined) row.chassis = data.chassis;
  if (data.km !== undefined) row.km = parseInt(data.km) || 0;
  if (data.fuelLevel !== undefined) row.fuellevel = data.fuelLevel;
  if (data.acquisitionPrice !== undefined) row.acquisitionprice = parseFloat(data.acquisitionPrice) || 0;
  if (data.resalePrice !== undefined) row.resaleprice = parseFloat(data.resalePrice) || 0;
  if (data.maxDiscountPercent !== undefined) row.maxdiscountpercent = parseFloat(data.maxDiscountPercent) || 0;
  if (data.images !== undefined) row.images = data.images;
  if (data.checklist !== undefined) row.checklist = data.checklist;
  if (data.repairs !== undefined) row.repairs = data.repairs;
  if (data.isSold !== undefined) row.issold = data.isSold;
  if (data.buyerName !== undefined) row.buyername = data.buyerName;
  if (data.salePrice !== undefined) row.saleprice = parseFloat(data.salePrice) || 0;
  if (data.saleDate !== undefined) row.saledate = data.saleDate;
  if (data.docExpense !== undefined) row.docexpense = parseFloat(data.docExpense) || 0;
  if (data.finesExpense !== undefined) row.finesexpense = parseFloat(data.finesExpense) || 0;
  if (data.payoffExpense !== undefined) row.payoffexpense = parseFloat(data.payoffExpense) || 0;
  if (data.otherExpenses !== undefined) row.otherexpenses = parseFloat(data.otherExpenses) || 0;
  if (data.transferInsuranceExpense !== undefined) row.transferinsuranceexpense = parseFloat(data.transferInsuranceExpense) || 0;
  if (data.customExpenses !== undefined) row.customexpenses = data.customExpenses;

  // Serialize missing columns/extras in generalnotes to prevent schema errors
  const extras = {};
  if (data.user_id !== undefined) extras.user_id = data.user_id;
  if (data.fuelType !== undefined) extras.fuelType = data.fuelType;
  if (data.doors !== undefined) extras.doors = data.doors;
  if (data.occupants !== undefined) extras.occupants = data.occupants;
  if (data.options !== undefined) extras.options = data.options;
  if (data.purchaseMode !== undefined) extras.purchaseMode = data.purchaseMode;
  if (data.purchaseTradeInDesc !== undefined) extras.purchaseTradeInDesc = data.purchaseTradeInDesc;
  if (data.purchaseTradeInVal !== undefined) extras.purchaseTradeInVal = data.purchaseTradeInVal;
  if (data.purchaseCashVal !== undefined) extras.purchaseCashVal = data.purchaseCashVal;
  if (data.purchaseInstallmentsTotal !== undefined) extras.purchaseInstallmentsTotal = data.purchaseInstallmentsTotal;
  if (data.purchaseInstallmentsPaid !== undefined) extras.purchaseInstallmentsPaid = data.purchaseInstallmentsPaid;
  if (data.purchaseInstallmentPrice !== undefined) extras.purchaseInstallmentPrice = data.purchaseInstallmentPrice;
  if (data.previousOwner !== undefined) extras.previousOwner = data.previousOwner;

  if (data.saleDiscount !== undefined) extras.saleDiscount = data.saleDiscount;
  if (data.saleMode !== undefined) extras.saleMode = data.saleMode;
  if (data.saleTradeInDesc !== undefined) extras.saleTradeInDesc = data.saleTradeInDesc;
  if (data.saleTradeInVal !== undefined) extras.saleTradeInVal = data.saleTradeInVal;
  if (data.saleCashVal !== undefined) extras.saleCashVal = data.saleCashVal;
  if (data.saleInstallmentsTotal !== undefined) extras.saleInstallmentsTotal = data.saleInstallmentsTotal;
  if (data.saleInstallmentsPaid !== undefined) extras.saleInstallmentsPaid = data.saleInstallmentsPaid;
  if (data.saleInstallmentPrice !== undefined) extras.saleInstallmentPrice = data.saleInstallmentPrice;
  if (data.saleTradeIns !== undefined) extras.saleTradeIns = data.saleTradeIns;
  if (data.salePayments !== undefined) extras.salePayments = data.salePayments;
  if (data.debtPayments !== undefined) extras.debtPayments = data.debtPayments;

  const baseNotes = data.generalNotes || '';
  row.generalnotes = baseNotes + '\n\n---VORA_METADATA---\n' + JSON.stringify(extras);

  return row;
}

export const supabaseAdapter = {
  isConfigured() {
    return !!(supabaseUrl && supabaseAnonKey);
  },

  async getVehicles(userId, isAdmin) {
    const isDemoUser = isDemoAccount(userId);
    if (isDemoUser) {
      return localAdapter.getVehicles(userId, isAdmin);
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');
    
    let query = client
      .from('vehicles')
      .select('*')
      .order('id', { ascending: false });

    // We do NOT use query.eq('user_id') here to avoid schema exceptions,
    // instead we filter the records in memory below.
    const { data, error } = await query;
      
    if (error) throw error;
    
    const list = (data || []).map(mapFromSupabase);
    if (userId && !isAdmin) {
      return list.filter(v => String(v.user_id) === String(userId));
    }
    return list;
  },

  async createVehicle(vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = isDemoAccount(userId);
    if (isDemoUser) {
      return localAdapter.createVehicle(vehicleData);
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');

    const mapped = mapToSupabase(vehicleData);
    const { data, error } = await client
      .from('vehicles')
      .insert([mapped])
      .select();

    if (error) throw error;
    return mapFromSupabase(data[0]);
  },

  async updateVehicle(id, vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = isDemoAccount(userId);
    if (isDemoUser) {
      return localAdapter.updateVehicle(id, vehicleData);
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');

    const mapped = mapToSupabase(vehicleData);
    const { data, error } = await client
      .from('vehicles')
      .update(mapped)
      .eq('id', id)
      .select();

    if (error) throw error;
    return mapFromSupabase(data[0]);
  },

  async deleteVehicle(id) {
    localAdapter.deleteVehicle(id);

    const client = getSupabaseClient();
    if (!client) return { success: true };

    try {
      await client
        .from('vehicles')
        .delete()
        .eq('id', id);
    } catch (e) {}

    return { success: true };
  }
};
