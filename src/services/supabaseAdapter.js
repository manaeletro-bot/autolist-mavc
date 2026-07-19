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
      .order('created_at', { ascending: false });

    if (userId && !isAdmin) {
      query = query.or(`user_id.eq.${userId},user_id.is.null,user_id.eq.usr_demo_lojista,user_id.eq.usr_admin,user_id.eq.usr_gestor_master`);
    }

    const { data, error } = await query;
      
    if (error) throw error;
    return data;
  },

  async createVehicle(vehicleData) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');

    const { data, error } = await client
      .from('vehicles')
      .insert([vehicleData])
      .select();

    if (error) throw error;
    return data[0];
  },

  async updateVehicle(id, vehicleData) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');

    const { data, error } = await client
      .from('vehicles')
      .update(vehicleData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
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
