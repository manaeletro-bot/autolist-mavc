import { localAdapter } from './localAdapter';
import { supabaseAdapter } from './supabaseAdapter';

// Determina se devemos usar o Supabase. 
// O usuário pode forçar o modo local nas configurações mesmo se o Supabase estiver configurado.
export function getActiveAdapter() {
  const storedMode = localStorage.getItem('vora_db_mode');
  const hasSupabase = supabaseAdapter.isConfigured();

  if (hasSupabase && storedMode !== 'local') {
    return { adapter: supabaseAdapter, mode: 'supabase' };
  }
  return { adapter: localAdapter, mode: 'local' };
}

export const db = {
  // Retorna o modo atual ('local' ou 'supabase')
  getMode() {
    return getActiveAdapter().mode;
  },

  // Altera o modo preferido
  setMode(mode) {
    if (mode === 'supabase' && !supabaseAdapter.isConfigured()) {
      throw new Error('Supabase não configurado nas variáveis de ambiente (.env)');
    }
    localStorage.setItem('vora_db_mode', mode);
  },

  // Verifica se o Supabase está configurado no .env
  isSupabaseAvailable() {
    return supabaseAdapter.isConfigured();
  },

  async getVehicles() {
    const { adapter } = getActiveAdapter();
    return adapter.getVehicles();
  },

  async createVehicle(vehicleData) {
    const { adapter } = getActiveAdapter();
    // Sanitização de dados básicos
    const cleaned = {
      brand: vehicleData.brand || '',
      model: vehicleData.model || '',
      year: vehicleData.year || '',
      color: vehicleData.color || '',
      plate: vehicleData.plate || '',
      chassis: vehicleData.chassis || '',
      km: parseInt(vehicleData.km) || 0,
      fuelLevel: vehicleData.fuelLevel || '1/2',
      acquisitionPrice: parseFloat(vehicleData.acquisitionPrice) || 0,
      resalePrice: parseFloat(vehicleData.resalePrice) || 0,
      maxDiscountPercent: parseFloat(vehicleData.maxDiscountPercent) || 0,
      images: vehicleData.images || [],
      checklist: vehicleData.checklist || {},
      repairs: vehicleData.repairs || [],
      generalNotes: vehicleData.generalNotes || '',
      
      // Debts and doc expenses
      docExpense: parseFloat(vehicleData.docExpense) || 0,
      finesExpense: parseFloat(vehicleData.finesExpense) || 0,
      payoffExpense: parseFloat(vehicleData.payoffExpense) || 0,
      otherExpenses: parseFloat(vehicleData.otherExpenses) || 0,
      transferInsuranceExpense: parseFloat(vehicleData.transferInsuranceExpense) || 0,
      customExpenses: Array.isArray(vehicleData.customExpenses)
        ? vehicleData.customExpenses.map(item => ({
            id: item.id || Date.now() + Math.random().toString(36).substring(2, 5),
            description: item.description || '',
            price: parseFloat(item.price) || 0
          }))
        : []
    };
    return adapter.createVehicle(cleaned);
  },

  async updateVehicle(id, vehicleData) {
    const { adapter } = getActiveAdapter();
    return adapter.updateVehicle(id, vehicleData);
  },

  async deleteVehicle(id) {
    const { adapter } = getActiveAdapter();
    return adapter.deleteVehicle(id);
  }
};
