import { createClient } from '@supabase/supabase-js';

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
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    user_id: row.user_id || row.userId || null,
    brand: row.brand || '',
    model: row.model || '',
    year: row.year ? String(row.year) : '',
    color: row.color || '',
    plate: row.plate || '',
    chassis: row.chassis || '',
    km: row.km || 0,
    fuelLevel: row.fuellevel ?? row.fuelLevel ?? '1/2',
    fuelType: row.fueltype ?? row.fuelType ?? 'flex',
    acquisitionPrice: row.acquisitionprice ?? row.acquisitionPrice ?? 0,
    resalePrice: row.resaleprice ?? row.resalePrice ?? 0,
    maxDiscountPercent: row.maxdiscountpercent ?? row.maxDiscountPercent ?? 0,
    images: row.images || [],
    checklist: row.checklist || {},
    repairs: row.repairs || [],
    generalNotes: row.generalnotes ?? row.generalNotes ?? '',
    doors: row.doors ? String(row.doors) : '4',
    occupants: row.occupants ? String(row.occupants) : '5',
    options: row.options || [],
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
    purchaseMode: row.purchasemode ?? row.purchaseMode ?? 'full',
    purchaseTradeInDesc: row.purchasetradeindesc ?? row.purchaseTradeInDesc ?? '',
    purchaseTradeInVal: row.purchasetradeinval ?? row.purchaseTradeInVal ?? 0,
    purchaseCashVal: row.purchasecashval ?? row.purchaseCashVal ?? 0,
    purchaseInstallmentsTotal: row.purchaseinstallmentstotal ?? row.purchaseInstallmentsTotal ?? 0,
    purchaseInstallmentsPaid: row.purchaseinstallmentspaid ?? row.purchaseInstallmentsPaid ?? 0,
    purchaseInstallmentPrice: row.purchaseinstallmentprice ?? row.purchaseInstallmentPrice ?? 0,
    previousOwner: row.previousowner ?? row.previousOwner ?? ''
  };
}

export function mapToSupabase(data) {
  const row = {};
  if (data.user_id !== undefined) row.user_id = data.user_id;
  if (data.brand !== undefined) row.brand = data.brand;
  if (data.model !== undefined) row.model = data.model;
  if (data.year !== undefined) row.year = String(data.year);
  if (data.color !== undefined) row.color = data.color;
  if (data.plate !== undefined) row.plate = data.plate;
  if (data.chassis !== undefined) row.chassis = data.chassis;
  if (data.km !== undefined) row.km = parseInt(data.km) || 0;
  if (data.fuelLevel !== undefined) row.fuellevel = data.fuelLevel;
  if (data.fuelType !== undefined) row.fueltype = data.fuelType;
  if (data.acquisitionPrice !== undefined) row.acquisitionprice = parseFloat(data.acquisitionPrice) || 0;
  if (data.resalePrice !== undefined) row.resaleprice = parseFloat(data.resalePrice) || 0;
  if (data.maxDiscountPercent !== undefined) row.maxdiscountpercent = parseFloat(data.maxDiscountPercent) || 0;
  if (data.images !== undefined) row.images = data.images;
  if (data.checklist !== undefined) row.checklist = data.checklist;
  if (data.repairs !== undefined) row.repairs = data.repairs;
  if (data.generalNotes !== undefined) row.generalnotes = data.generalNotes;
  if (data.doors !== undefined) row.doors = String(data.doors);
  if (data.occupants !== undefined) row.occupants = String(data.occupants);
  if (data.options !== undefined) row.options = data.options;
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
  if (data.purchaseMode !== undefined) row.purchasemode = data.purchaseMode;
  if (data.purchaseTradeInDesc !== undefined) row.purchasetradeindesc = data.purchaseTradeInDesc;
  if (data.purchaseTradeInVal !== undefined) row.purchasetradeinval = data.purchaseTradeInVal;
  if (data.purchaseCashVal !== undefined) row.purchasecashval = data.purchaseCashVal;
  if (data.purchaseInstallmentsTotal !== undefined) row.purchaseinstallmentstotal = data.purchaseInstallmentsTotal;
  if (data.purchaseInstallmentsPaid !== undefined) row.purchaseinstallmentspaid = data.purchaseInstallmentsPaid;
  if (data.purchaseInstallmentPrice !== undefined) row.purchaseinstallmentprice = data.purchaseInstallmentPrice;
  if (data.previousOwner !== undefined) row.previousowner = data.previousOwner;
  return row;
}

export const supabaseAdapter = {
  isConfigured() {
    return !!(supabaseUrl && supabaseAnonKey);
  },

  async getVehicles(userId, isAdmin) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');
    
    let query = client
      .from('vehicles')
      .select('*')
      .order('id', { ascending: false });

    if (userId && !isAdmin) {
      query = query.or(`user_id.eq.${userId},user_id.is.null,user_id.eq.usr_demo_lojista,user_id.eq.usr_admin,user_id.eq.usr_gestor_master`);
    }

    const { data, error } = await query;
      
    if (error) throw error;
    return (data || []).map(mapFromSupabase);
  },

  async createVehicle(vehicleData) {
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
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');

    const { error } = await client
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};
