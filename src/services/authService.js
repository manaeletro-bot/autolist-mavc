// Serviço de Autenticação e Controle de Sessão Multi-Tenant

const DEFAULT_ADMIN = {
  id: 'usr_admin',
  email: 'admin@autolist.com',
  passwordHash: 'admin123', // Em prod utilizará Supabase Auth ou Hash
  name: 'Gestor Principal',
  storeName: 'Matriz MAVC',
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString()
};

function initUsersStore() {
  const existing = localStorage.getItem('vora_users');
  if (!existing) {
    localStorage.setItem('vora_users', JSON.stringify([DEFAULT_ADMIN]));
  }
}

initUsersStore();

export const authService = {
  // Retorna o usuário logado atualmente ou null
  getCurrentUser() {
    try {
      const activeData = localStorage.getItem('vora_active_user');
      return activeData ? JSON.parse(activeData) : null;
    } catch (e) {
      return null;
    }
  },

  // Efetua login
  async login(email, password) {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const cleanEmail = (email || '').trim().toLowerCase();
    
    const user = users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('E-mail não cadastrado no sistema.');
    }

    if (user.passwordHash !== password) {
      throw new Error('Senha incorreta.');
    }

    if (user.status === 'suspended') {
      throw new Error('Esta conta está suspensa pelo Gestor. Entre em contato com o suporte.');
    }

    // Retirar campo de senha da sessão
    const sessionUser = { ...user };
    delete sessionUser.passwordHash;

    localStorage.setItem('vora_active_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Efetua cadastro de nova conta
  async register({ email, password, name, storeName }) {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const cleanEmail = (email || '').trim().toLowerCase();

    if (users.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      throw new Error('Este e-mail já está cadastrado. Faça login para continuar.');
    }

    const newUser = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      passwordHash: password,
      name: name.trim(),
      storeName: (storeName || 'Minha Revenda').trim(),
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('vora_users', JSON.stringify(users));

    // Define sessão ativa automaticamente
    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;

    localStorage.setItem('vora_active_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Efetua Logout
  logout() {
    localStorage.removeItem('vora_active_user');
  },

  // --- Funções Exclusivas do Portal do Gestor (Admin) ---

  // Lista todos os usuários cadastrados no sistema
  async getAllUsers() {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    return users.map(u => {
      const safe = { ...u };
      delete safe.passwordHash;
      return safe;
    });
  },

  // Alterar status do usuário (ativo / suspenso)
  async updateUserStatus(userId, status) {
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = status;
      localStorage.setItem('vora_users', JSON.stringify(users));
      
      // Se alterou o status do usuário ativo atual, atualiza a sessão
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.status = status;
        localStorage.setItem('vora_active_user', JSON.stringify(current));
      }
    }
    return true;
  },

  // Alterar nível de permissão (user / admin)
  async updateUserRole(userId, role) {
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].role = role;
      localStorage.setItem('vora_users', JSON.stringify(users));

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.role = role;
        localStorage.setItem('vora_active_user', JSON.stringify(current));
      }
    }
    return true;
  },

  // Excluir conta de usuário
  async deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('vora_users', JSON.stringify(users));
    return true;
  }
};
