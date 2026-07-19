// Este arquivo está 100% pronto para integração com o Supabase.
// Para utilizá-lo, você precisará:
// 1. Instalar a dependência do Supabase rodando: npm install @supabase/supabase-js
// 2. Configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
// 3. Criar uma tabela chamada 'vehicles' no Supabase com estrutura compatível.

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

  async getVehicles() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase não configurado ou cliente indisponível');
    
    const { data, error } = await client
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
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
