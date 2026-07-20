const API_BASE = '/api';

export const DEFAULT_SEED_VEHICLES = [
  {
    id: 6,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T18:13:38.070Z",
    updatedAt: "2026-07-19T21:19:35.781Z",
    brand: "Tesla",
    model: "Model Y Long Range",
    year: "2023",
    color: "Branco",
    plate: "EVY2026",
    chassis: "",
    km: 18000,
    fuelLevel: "100%",
    acquisitionPrice: 240000,
    resalePrice: 285000,
    maxDiscountPercent: 5,
    images: [
      "/images/tesla/tesla_1.jpg",
      "/images/tesla/tesla_2.jpg",
      "/images/tesla/tesla_3.jpg",
      "/images/tesla/tesla_4.jpg",
      "/images/tesla/tesla_5.jpg"
    ],
    checklist: {
      farol_baixo: { status: "FAIL", notes: "" },
      farol_alto: { status: "OK", notes: "" }
    },
    repairs: [
      {
        id: 1784495975767,
        description: "Reparar: Farol Baixo (Sem detalhes)",
        price: 0,
        status: "pending",
        date: "2026-07-19T21:19:35.767Z"
      }
    ],
    generalNotes: "Veículo elétrico 100% conservado, piloto automático completo.",
    fuelType: "eletrico",
    doors: "4",
    occupants: "5",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Teto Panorâmico",
      "Bancos em Couro",
      "Piloto Automático",
      "Central Multimídia",
      "Câmera de Ré / 360",
      "Sensor de Estacionamento"
    ],
    isSold: false
  },
  {
    id: 1,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T16:00:00.000Z",
    updatedAt: "2026-07-19T18:00:00.000Z",
    brand: "Ford",
    model: "Focus 2.0 Titanium Hatch",
    year: "2018",
    color: "Cinza",
    plate: "ABC1D23",
    chassis: "9BFKXXXXXXXXX",
    km: 45000,
    fuelLevel: "3/4",
    acquisitionPrice: 42000,
    resalePrice: 58900,
    maxDiscountPercent: 8,
    images: [
      "/images/focus/focus_1.jpg",
      "/images/focus/focus_2.jpg",
      "/images/focus/focus_3.jpg",
      "/images/focus/focus_4.jpg"
    ],
    checklist: {
      oleo_motor: { status: "OK", notes: "Troca recente" },
      pneu_dianteiro_esq: { status: "OK", notes: "Meia vida" }
    },
    repairs: [],
    generalNotes: "Veículo em excelente estado de conservação. Revisões em dia.",
    fuelType: "flex",
    doors: "4",
    occupants: "5",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Direção Elétrica",
      "Bancos em Couro",
      "Central Multimídia",
      "Câmera de Ré / 360",
      "Sensor de Estacionamento"
    ],
    isSold: false
  },
  {
    id: 2,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T16:30:00.000Z",
    updatedAt: "2026-07-19T18:30:00.000Z",
    brand: "Honda",
    model: "HR-V EXL 1.5 Turbo",
    year: "2021",
    color: "Prata",
    plate: "HON2B45",
    chassis: "93HXXXXXXXXX",
    km: 32000,
    fuelLevel: "1/2",
    acquisitionPrice: 88000,
    resalePrice: 109900,
    maxDiscountPercent: 6,
    images: [
      "/images/hrv/hrv_1.webp",
      "/images/hrv/hrv_2.webp",
      "/images/hrv/hrv_3.webp",
      "/images/hrv/hrv_4.webp"
    ],
    checklist: {
      ar_condicionado: { status: "OK", notes: "Higienizado" }
    },
    repairs: [],
    generalNotes: "Único dono, manual e chave reserva.",
    fuelType: "flex",
    doors: "4",
    occupants: "5",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Direção Elétrica",
      "Bancos em Couro",
      "Piloto Automático",
      "Central Multimídia",
      "Câmera de Ré / 360",
      "Sensor de Estacionamento"
    ],
    isSold: false
  },
  {
    id: 3,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T17:00:00.000Z",
    updatedAt: "2026-07-19T19:00:00.000Z",
    brand: "Toyota",
    model: "SW4 SRX 2.8 Diesel 4x4",
    year: "2022",
    color: "Preto",
    plate: "TOY4X99",
    chassis: "8AJXXXXXXXXX",
    km: 25000,
    fuelLevel: "4/4",
    acquisitionPrice: 210000,
    resalePrice: 249900,
    maxDiscountPercent: 5,
    images: [
      "/images/sw4/sw4_1.jpg",
      "/images/sw4/sw4_2.webp",
      "/images/sw4/sw4_3.jpg",
      "/images/sw4/sw4_4.webp"
    ],
    checklist: {},
    repairs: [],
    generalNotes: "SUV de luxo 7 lugares, tração 4x4 com reduzida.",
    fuelType: "diesel",
    doors: "4",
    occupants: "7",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Bancos em Couro",
      "Tração 4x4",
      "Piloto Automático",
      "Central Multimídia",
      "Câmera de Ré / 360",
      "Sensor de Estacionamento"
    ],
    isSold: false
  },
  {
    id: 4,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T17:15:00.000Z",
    updatedAt: "2026-07-19T19:15:00.000Z",
    brand: "BYD",
    model: "Dolphin Mini EV",
    year: "2024",
    color: "Verde Sprout",
    plate: "BYD1E22",
    chassis: "LGXXXXXXXXX",
    km: 5000,
    fuelLevel: "100%",
    acquisitionPrice: 82000,
    resalePrice: 99800,
    maxDiscountPercent: 4,
    images: [
      "/images/byd/byd_1.jpg",
      "/images/byd/byd_2.jpg",
      "/images/byd/byd_3.jpg",
      "/images/byd/byd_4.webp"
    ],
    checklist: {},
    repairs: [],
    generalNotes: "100% Elétrico urbano, garantia de fábrica ativa.",
    fuelType: "eletrico",
    doors: "4",
    occupants: "4",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Direção Elétrica",
      "Central Multimídia",
      "Câmera de Ré / 360",
      "Sensor de Estacionamento"
    ],
    isSold: false
  },
  {
    id: 5,
    user_id: 'usr_demo_lojista',
    createdAt: "2026-07-19T17:30:00.000Z",
    updatedAt: "2026-07-19T19:30:00.000Z",
    brand: "Chevrolet",
    model: "Onix LTZ 1.0 Turbo",
    year: "2023",
    color: "Azul Seeker",
    plate: "GM12E34",
    chassis: "9BGXXXXXXXXX",
    km: 18000,
    fuelLevel: "1/2",
    acquisitionPrice: 52000,
    resalePrice: 68500,
    maxDiscountPercent: 7,
    images: [
      "/images/onix/onix_1.jpg",
      "/images/onix/onix_2.jpg",
      "/images/onix/onix_3.jpg",
      "/images/onix/onix_4.jpg"
    ],
    checklist: {},
    repairs: [],
    generalNotes: "Econômico, OnStar e Wi-Fi nativo.",
    fuelType: "flex",
    doors: "4",
    occupants: "5",
    options: [
      "Ar Condicionado Digital Dual Zone",
      "Direção Elétrica",
      "Central Multimídia",
      "Sensor de Estacionamento"
    ],
    isSold: false
  }
];

export const localAdapter = {
  async getVehicles(userId, isAdmin) {
    const isDemoUser = !userId || userId === 'usr_demo_lojista' || userId === 'usr_admin' || userId === 'usr_gestor_master';

    if (isDemoUser) {
      const storedDemo = localStorage.getItem('vora_demo_vehicles');
      if (storedDemo) {
        try {
          return JSON.parse(storedDemo);
        } catch (e) {}
      }
      try {
        const response = await fetch(`${API_BASE}/vehicles?_t=${Date.now()}`, { cache: 'no-cache' });
        if (response.ok) {
          const apiData = await response.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            localStorage.setItem('vora_demo_vehicles', JSON.stringify(apiData));
            return apiData;
          }
        }
      } catch (e) {}

      localStorage.setItem('vora_demo_vehicles', JSON.stringify(DEFAULT_SEED_VEHICLES));
      return DEFAULT_SEED_VEHICLES;
    } else {
      // Usuário personalizado novo
      const userKey = `vora_user_vehicles_${userId}`;
      const storedUser = localStorage.getItem(userKey);
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {}
      }
      // Novo lojista começa com 0 veículos (do zero!)
      localStorage.setItem(userKey, JSON.stringify([]));
      return [];
    }
  },

  async createVehicle(vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = !userId || userId === 'usr_demo_lojista' || userId === 'usr_admin' || userId === 'usr_gestor_master';
    const storageKey = isDemoUser ? 'vora_demo_vehicles' : `vora_user_vehicles_${userId}`;

    let list = [];
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) {}
    } else if (isDemoUser) {
      list = [...DEFAULT_SEED_VEHICLES];
    }

    const newVehicle = {
      ...vehicleData,
      id: vehicleData.id || Date.now(),
      createdAt: vehicleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newVehicle);
    localStorage.setItem(storageKey, JSON.stringify(list));

    if (isDemoUser) {
      try {
        await fetch(`${API_BASE}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVehicle)
        });
      } catch (e) {}
    }

    return newVehicle;
  },

  async updateVehicle(id, vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = !userId || userId === 'usr_demo_lojista' || userId === 'usr_admin' || userId === 'usr_gestor_master';
    const storageKey = isDemoUser ? 'vora_demo_vehicles' : `vora_user_vehicles_${userId}`;

    let list = [];
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) {}
    } else if (isDemoUser) {
      list = [...DEFAULT_SEED_VEHICLES];
    }

    const index = list.findIndex(v => String(v.id) === String(id));
    let updated;
    if (index !== -1) {
      updated = { ...list[index], ...vehicleData, updatedAt: new Date().toISOString() };
      list[index] = updated;
    } else {
      updated = { ...vehicleData, id, updatedAt: new Date().toISOString() };
      list.unshift(updated);
    }

    localStorage.setItem(storageKey, JSON.stringify(list));

    if (isDemoUser) {
      try {
        await fetch(`${API_BASE}/vehicles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {}
    }

    return updated;
  },

  async deleteVehicle(id) {
    const keys = Object.keys(localStorage).filter(k => k === 'vora_demo_vehicles' || k.startsWith('vora_user_vehicles_'));
    for (const key of keys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          let list = JSON.parse(stored);
          const filtered = list.filter(v => String(v.id) !== String(id));
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch (e) {}
      }
    }

    try {
      await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' });
    } catch (e) {}

    return { success: true };
  }
};
