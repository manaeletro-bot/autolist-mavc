const API_BASE = '/api';

export const DEFAULT_SEED_VEHICLES = [
  {
    "id": 6,
    "user_id": "usr_demo_lojista",
    "createdAt": "2026-07-19T18:13:38.070Z",
    "updatedAt": "2026-07-19T21:19:35.781Z",
    "brand": "Tesla",
    "model": "Model Y Long Range",
    "year": "2023",
    "color": "Branco",
    "plate": "EVY2026",
    "chassis": "",
    "km": "18000",
    "fuelLevel": "100%",
    "acquisitionPrice": "240000",
    "resalePrice": "285000",
    "maxDiscountPercent": 5,
    "images": [
      "/images/tesla/tesla_1.jpg",
      "/images/tesla/tesla_2.jpg",
      "/images/tesla/tesla_3.jpg",
      "/images/tesla/tesla_4.jpg",
      "/images/tesla/tesla_5.jpg"
    ],
    "checklist": {
      "farol_baixo": {
        "status": "FAIL",
        "notes": ""
      },
      "farol_alto": {
        "status": "OK",
        "notes": ""
      }
    },
    "repairs": [
      {
        "id": 1784495975767,
        "description": "Reparar: Farol Baixo (Sem detalhes)",
        "price": 0,
        "status": "pending",
        "date": "2026-07-19T21:19:35.767Z"
      }
    ],
    "generalNotes": "Veículo elétrico 100% conservado, piloto automático completo.",
    "fuelType": "eletrico",
    "doors": "4",
    "occupants": "5",
    "options": [
      "Ar Condicionado Digital Dual Zone",
      "Teto Panorâmico",
      "Piloto Automático Autônomo",
      "Painel Multimídia 15 Polegadas",
      "Bancos de Couro Aquecidos",
      "Câmeras 360 Graus"
    ],
    "isSold": false,
    "purchaseMode": "full",
    "purchaseTradeInDesc": "",
    "purchaseTradeInVal": "",
    "purchaseCashVal": "",
    "purchaseInstallmentsTotal": "",
    "purchaseInstallmentsPaid": "",
    "purchaseInstallmentPrice": "",
    "previousOwner": "Único Dono"
  },
  {
    "id": 1,
    "user_id": "usr_demo_lojista",
    "brand": "Ford",
    "model": "Focus 2.0 Titanium Hatch",
    "year": "2019",
    "color": "Preto",
    "plate": "ABC1D23",
    "chassis": "",
    "km": 52000,
    "fuelLevel": "1/2",
    "acquisitionPrice": 50000,
    "resalePrice": 62000,
    "maxDiscountPercent": 5,
    "doors": "4",
    "occupants": "5",
    "options": [
      "Ar Condicionado",
      "Direção Hidráulica",
      "Vidros Elétricos",
      "Travas Elétricas",
      "Alarme",
      "Airbags"
    ],
    "isSold": false,
    "checklist": {
      "estepe": {
        "status": "OK",
        "notes": ""
      },
      "macaco": {
        "status": "FAIL",
        "notes": "Falta macaco"
      },
      "saude_eletrica": {
        "status": "FAIL",
        "notes": "Bateria fraca"
      }
    },
    "repairs": [
      {
        "id": 1784479018522,
        "description": "Reparar: Macaco Hidráulico/Mecânico (Falta macaco)",
        "price": 150,
        "status": "pending",
        "date": "2026-07-19T16:36:58.522Z"
      },
      {
        "id": 1784479090353,
        "description": "Troca de Oleo",
        "price": 250,
        "status": "pending",
        "date": "2026-07-19T16:38:10.353Z"
      },
      {
        "id": 1784480223187,
        "description": "Reparar: Saúde elétrica (Bateria fraca)",
        "price": 350,
        "status": "pending",
        "date": "2026-07-19T16:57:03.187Z"
      }
    ],
    "generalNotes": "Veículo completo com revisões em dia.",
    "fuelType": "flex",
    "images": [
      "/images/focus/focus_1.jpg",
      "/images/focus/focus_2.jpg",
      "/images/focus/focus_3.jpg",
      "/images/focus/focus_4.jpg"
    ],
    "purchaseMode": "full",
    "purchaseTradeInDesc": "",
    "purchaseTradeInVal": "",
    "purchaseCashVal": "",
    "purchaseInstallmentsTotal": "",
    "purchaseInstallmentsPaid": "",
    "purchaseInstallmentPrice": "",
    "previousOwner": "Particular",
    "updatedAt": "2026-07-19T18:38:09.268Z"
  },
  {
    "id": 2,
    "user_id": "usr_demo_lojista",
    "brand": "Honda",
    "model": "HR-V EXL 1.5 Turbo",
    "year": "2021",
    "color": "Cinza",
    "plate": "HON2B45",
    "chassis": "",
    "km": 32000,
    "fuelLevel": "1/4",
    "acquisitionPrice": 110000,
    "resalePrice": 132000,
    "maxDiscountPercent": 4,
    "doors": "4",
    "occupants": "5",
    "options": [
      "Ar Condicionado",
      "Direção Elétrica",
      "Vidros Elétricos",
      "Travas Elétricas",
      "Alarme",
      "Airbags",
      "Freio ABS",
      "Central Multimídia"
    ],
    "isSold": false,
    "checklist": {},
    "repairs": [],
    "generalNotes": "Estado excelente de conservação, única dona.",
    "updatedAt": "2026-07-19T17:02:48.106Z",
    "images": [
      "/images/hrv/hrv_1.webp",
      "/images/hrv/hrv_2.webp",
      "/images/hrv/hrv_3.webp",
      "/images/hrv/hrv_4.webp"
    ]
  },
  {
    "id": 3,
    "user_id": "usr_demo_lojista",
    "brand": "Toyota",
    "model": "SW4 SRX 2.8 Diesel 4x4",
    "year": "2020",
    "color": "Branca",
    "plate": "TOY4X99",
    "chassis": "",
    "km": 75000,
    "fuelLevel": "Reserva",
    "acquisitionPrice": 280000,
    "resalePrice": 325000,
    "maxDiscountPercent": 5,
    "doors": "4",
    "occupants": "7",
    "options": [
      "Ar Condicionado",
      "Direção Hidráulica",
      "Vidros Elétricos",
      "Travas Elétricas",
      "Alarme",
      "Freio ABS",
      "Airbags",
      "Tração 4x4",
      "Central Multimídia",
      "Painel Digital"
    ],
    "isSold": false,
    "checklist": {},
    "repairs": [],
    "generalNotes": "SUV de 7 lugares completo em excelente estado.",
    "images": [
      "/images/sw4/sw4_1.jpg",
      "/images/sw4/sw4_2.webp",
      "/images/sw4/sw4_3.jpg",
      "/images/sw4/sw4_4.webp"
    ]
  },
  {
    "id": 4,
    "user_id": "usr_demo_lojista",
    "brand": "BYD",
    "model": "Dolphin Mini EV",
    "year": "2024",
    "color": "Verde Sprout",
    "plate": "BYD1E22",
    "chassis": "",
    "km": 5000,
    "fuelLevel": "100%",
    "acquisitionPrice": 95000,
    "resalePrice": 115000,
    "maxDiscountPercent": 3,
    "doors": "4",
    "occupants": "4",
    "options": [
      "Ar Condicionado",
      "Direção Elétrica",
      "Vidros Elétricos",
      "Travas Elétricas",
      "Alarme",
      "Freio ABS",
      "Airbags",
      "Central Multimídia",
      "Painel Digital"
    ],
    "isSold": false,
    "checklist": {},
    "repairs": [],
    "generalNotes": "Veículo elétrico semi-novo, bateria 100% de saúde.",
    "images": [
      "/images/byd/byd_1.jpg",
      "/images/byd/byd_2.jpg",
      "/images/byd/byd_3.jpg",
      "/images/byd/byd_4.webp"
    ]
  },
  {
    "id": 5,
    "user_id": "usr_demo_lojista",
    "brand": "Chevrolet",
    "model": "Onix LTZ 1.0 Turbo",
    "year": "2022",
    "color": "Prata",
    "plate": "GM12E34",
    "chassis": "",
    "km": 42000,
    "fuelLevel": "Cheio",
    "acquisitionPrice": 65000,
    "resalePrice": 78000,
    "maxDiscountPercent": 7,
    "doors": "4",
    "occupants": "5",
    "options": [
      "Ar Condicionado",
      "Direção Elétrica",
      "Vidros Elétricos",
      "Travas Elétricas",
      "Alarme",
      "Airbags",
      "Freio ABS"
    ],
    "isSold": true,
    "checklist": {},
    "repairs": [],
    "generalNotes": "Vendido em 15/07/2026 com lucro esperado de R$ 13.000,00.",
    "fuelType": "flex",
    "previousOwner": "",
    "updatedAt": "2026-07-19T19:46:20.272Z",
    "purchaseMode": "full",
    "purchaseTradeInDesc": "",
    "purchaseTradeInVal": 0,
    "purchaseCashVal": 0,
    "purchaseInstallmentsTotal": 0,
    "purchaseInstallmentsPaid": 0,
    "purchaseInstallmentPrice": 0,
    "images": [
      "/images/onix/onix_1.jpg",
      "/images/onix/onix_2.jpg",
      "/images/onix/onix_3.jpg",
      "/images/onix/onix_4.jpg"
    ]
  }
];

export function isDemoAccount(userId) {
  if (!userId) return true;
  if (userId === 'usr_demo_lojista' || userId === 'usr_admin' || userId === 'usr_gestor_master' || userId === 'usr_demo_expirado') return true;
  try {
    const active = JSON.parse(localStorage.getItem('vora_active_user') || '{}');
    const email = (active.email || '').trim().toLowerCase();
    if (email === 'lojista@autolist.com' || email === 'expirado@autolist.com' || email === 'admin@autolist.com' || email === 'gestor@autolist.com') {
      return true;
    }
  } catch (e) {}
  return false;
}

export const localAdapter = {
  async getVehicles(userId, isAdmin) {
    const isDemoUser = isDemoAccount(userId);

    if (isDemoUser) {
      const storedDemo = localStorage.getItem('vora_demo_vehicles');
      if (storedDemo !== null) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {}
      }

      // Restaura a cópia padrão inicial limpa dos 6 veículos de teste se vora_demo_vehicles estiver ausente ou vazio
      const freshSeed = JSON.parse(JSON.stringify(DEFAULT_SEED_VEHICLES));
      localStorage.setItem('vora_demo_vehicles', JSON.stringify(freshSeed));
      return freshSeed;
    } else {
      // Usuário personalizado novo (inicia com 0 veículos e persiste suas alterações)
      const userKey = `vora_user_vehicles_${userId}`;
      const storedUser = localStorage.getItem(userKey);
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {}
      }
      localStorage.setItem(userKey, JSON.stringify([]));
      return [];
    }
  },

  async createVehicle(vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = isDemoAccount(userId);
    const storageKey = isDemoUser ? 'vora_demo_vehicles' : `vora_user_vehicles_${userId}`;

    let list = [];
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {}
    }

    if (list.length === 0 && isDemoUser) {
      list = JSON.parse(JSON.stringify(DEFAULT_SEED_VEHICLES));
    }

    const newVehicle = {
      ...vehicleData,
      id: vehicleData.id || Date.now(),
      createdAt: vehicleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newVehicle);
    localStorage.setItem(storageKey, JSON.stringify(list));
    return newVehicle;
  },

  async updateVehicle(id, vehicleData) {
    const userId = vehicleData.user_id;
    const isDemoUser = isDemoAccount(userId);
    const storageKey = isDemoUser ? 'vora_demo_vehicles' : `vora_user_vehicles_${userId}`;

    let list = [];
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {}
    }

    if (list.length === 0 && isDemoUser) {
      list = JSON.parse(JSON.stringify(DEFAULT_SEED_VEHICLES));
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
    return { success: true };
  }
};
