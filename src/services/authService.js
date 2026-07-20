// Serviço de Autenticação e Controle de Sessão Multi-Tenant & Gestor Master

const MASTER_GESTOR_CREDENTIALS = {
  id: 'usr_gestor_master',
  email: 'gestor@autolist.com',
  passwordHash: 'gestor2026',
  name: 'Gestor Master MAVC',
  storeName: 'Matriz Gestão MAVC',
  role: 'admin',
  status: 'active',
  plan: 'lifetime',
  planExpiresAt: null,
  createdAt: new Date().toISOString()
};

const DEFAULT_ADMIN = {
  id: 'usr_admin',
  email: 'admin@autolist.com',
  passwordHash: 'admin123',
  name: 'Administrador Teste',
  storeName: 'AUTOLIST Teste MAVC',
  role: 'admin',
  status: 'active',
  plan: 'lifetime',
  planExpiresAt: null,
  createdAt: new Date().toISOString()
};

const DEFAULT_LOJISTA = {
  id: 'usr_demo_lojista',
  email: 'lojista@autolist.com',
  passwordHash: '123456',
  name: 'Lojista Teste',
  storeName: 'Auto Motors MAVC',
  role: 'user',
  status: 'active',
  plan: 'test_3d',
  planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString()
};

function initUsersStore() {
  const existing = localStorage.getItem('vora_users');
  if (!existing) {
    localStorage.setItem('vora_users', JSON.stringify([MASTER_GESTOR_CREDENTIALS, DEFAULT_ADMIN, DEFAULT_LOJISTA]));
  } else {
    const users = JSON.parse(existing);
    let updated = false;

    if (!users.some(u => u.email === MASTER_GESTOR_CREDENTIALS.email)) {
      users.unshift(MASTER_GESTOR_CREDENTIALS);
      updated = true;
    }
    if (!users.some(u => u.email === DEFAULT_ADMIN.email)) {
      users.push(DEFAULT_ADMIN);
      updated = true;
    }
    if (!users.some(u => u.email === DEFAULT_LOJISTA.email)) {
      users.push(DEFAULT_LOJISTA);
      updated = true;
    }

    if (updated) {
      localStorage.setItem('vora_users', JSON.stringify(users));
    }
  }
}

initUsersStore();

export function calculateExpirationDate(planType) {
  const now = new Date();
  if (planType === 'test_3d') {
    return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (planType === 'monthly') {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (planType === 'yearly') {
    return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (planType === 'lifetime') {
    return null; // Sem expiração
  }
  return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
}

export const authService = {
  // --- Sessão do Lojista (Painel Principal) ---
  resetDemoSession() {
    localStorage.removeItem('vora_demo_vehicles');
  },

  getCurrentUser() {
    try {
      const activeData = localStorage.getItem('vora_active_user');
      return activeData ? JSON.parse(activeData) : null;
    } catch (e) {
      return null;
    }
  },

  async login(email, password) {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const cleanEmail = (email || '').trim().toLowerCase();

    // Se for o usuário de teste lojista, reinicia a sessão de teste para os veículos padrão
    if (cleanEmail === 'lojista@autolist.com') {
      this.resetDemoSession();
    }

    // Permite login com credenciais do Gestor Master no painel do usuário
    if (cleanEmail === MASTER_GESTOR_CREDENTIALS.email && password === MASTER_GESTOR_CREDENTIALS.passwordHash) {
      const sessionUser = { ...MASTER_GESTOR_CREDENTIALS };
      delete sessionUser.passwordHash;
      localStorage.setItem('vora_active_user', JSON.stringify(sessionUser));
      return sessionUser;
    }

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

    // Verificar se o plano expirou (apenas se não for vitalício)
    if (user.plan !== 'lifetime' && user.planExpiresAt) {
      if (new Date(user.planExpiresAt) < new Date()) {
        throw new Error('Sua assinatura / período de teste expirou. Entre em contato com o Gestor para renovar seu plano.');
      }
    }

    const sessionUser = { ...user };
    delete sessionUser.passwordHash;

    localStorage.setItem('vora_active_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

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
      plan: 'test_3d',
      planExpiresAt: calculateExpirationDate('test_3d'),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('vora_users', JSON.stringify(users));

    const sessionUser = { ...newUser };
    delete sessionUser.passwordHash;

    // Inicializa veículos do novo usuário como array vazio (do zero!)
    localStorage.setItem(`vora_user_vehicles_${newUser.id}`, JSON.stringify([]));

    localStorage.setItem('vora_active_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout() {
    const active = this.getCurrentUser();
    if (active && (active.id === 'usr_demo_lojista' || active.email === 'lojista@autolist.com')) {
      this.resetDemoSession();
    }
    localStorage.removeItem('vora_active_user');
  },

  // --- Sessão Exclusiva do Portal do Gestor (/gestor) ---
  getGestorSession() {
    try {
      const data = localStorage.getItem('vora_gestor_active');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async gestorLogin(emailOrUser, password) {
    const cleanInput = (emailOrUser || '').trim().toLowerCase();
    
    if ((cleanInput === MASTER_GESTOR_CREDENTIALS.email || cleanInput === 'gestor') && password === MASTER_GESTOR_CREDENTIALS.passwordHash) {
      const session = {
        name: MASTER_GESTOR_CREDENTIALS.name,
        email: MASTER_GESTOR_CREDENTIALS.email,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('vora_gestor_active', JSON.stringify(session));
      return session;
    }
    throw new Error('Credenciais de Gestor incorretas. Verifique o e-mail e a senha master (gestor@autolist.com / gestor2026).');
  },

  gestorLogout() {
    localStorage.removeItem('vora_gestor_active');
  },

  // --- Operações do Gestor ---
  async getAllUsers() {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    return users.map(u => {
      const safe = { ...u };
      delete safe.passwordHash;
      return safe;
    });
  },

  async updateUserStatus(userId, status) {
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = status;
      localStorage.setItem('vora_users', JSON.stringify(users));
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.status = status;
        localStorage.setItem('vora_active_user', JSON.stringify(current));
      }
    }
    return true;
  },

  async updateUserPlan(userId, planType) {
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].plan = planType;
      users[index].planExpiresAt = calculateExpirationDate(planType);
      localStorage.setItem('vora_users', JSON.stringify(users));

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.plan = planType;
        current.planExpiresAt = users[index].planExpiresAt;
        localStorage.setItem('vora_active_user', JSON.stringify(current));
      }
    }
    return true;
  },

  async createUserByGestor({ name, storeName, email, password, planType }) {
    initUsersStore();
    const users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    const cleanEmail = (email || '').trim().toLowerCase();

    if (users.some(u => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      throw new Error('Este e-mail já possui um lojista cadastrado.');
    }

    const newUser = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      passwordHash: password || '123456',
      name: name.trim(),
      storeName: (storeName || 'Revenda Lojista').trim(),
      role: 'user',
      status: 'active',
      plan: planType || 'test_3d',
      planExpiresAt: calculateExpirationDate(planType || 'test_3d'),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('vora_users', JSON.stringify(users));
    return newUser;
  },

  async deleteUser(userId) {
    let users = JSON.parse(localStorage.getItem('vora_users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('vora_users', JSON.stringify(users));
    return true;
  }
};
