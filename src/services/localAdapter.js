const API_BASE = '/api';

export const localAdapter = {
  async getVehicles(userId, isAdmin) {
    const response = await fetch(`${API_BASE}/vehicles?_t=${Date.now()}`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('Erro ao buscar veículos da API local');
    }
    const all = await response.json();
    if (!userId || isAdmin) return all;

    // Retorna veículos pertencentes ao usuário, legado sem user_id ou criados nos testes
    return all.filter(v => !v.user_id || v.user_id === userId || v.user_id === 'usr_demo_lojista' || v.user_id === 'usr_admin' || v.user_id === 'usr_gestor_master');
  },

  async createVehicle(vehicleData) {
    const response = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar veículo na API local');
    }
    return response.json();
  },

  async updateVehicle(id, vehicleData) {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vehicleData),
    });
    if (!response.ok) {
      throw new Error(`Erro ao atualizar veículo #${id} na API local`);
    }
    return response.json();
  },

  async deleteVehicle(id) {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Erro ao excluir veículo #${id} na API local`);
    }
    return response.json();
  }
};
