import React, { useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, AlertTriangle, Plus, ChevronDown, FileText, Eye, EyeOff } from 'lucide-react';

const CHECKLIST_CATEGORIES = [
  {
    id: 'exterior_light',
    title: '1. No Chão — Exterior do Veículo e Iluminação',
    subcategories: [
      {
        id: 'iluminacao_dianteira',
        title: '💡 Iluminação Dianteira',
        items: [
          { key: 'farol_baixo', label: 'Farol Baixo' },
          { key: 'farol_alto', label: 'Farol Alto' },
          { key: 'luz_rodagem_diurna', label: 'Luz de Rodagem Diurna (DRL)' },
          { key: 'farol_neblina_dianteiro', label: 'Faróis de Neblina Dianteiros' }
        ]
      },
      {
        id: 'iluminacao_traseira',
        title: '🚗 Iluminação Traseira & Sinalização',
        items: [
          { key: 'lanterna_traseira', label: 'Lanternas Traseiras (Luz de Posição)' },
          { key: 'luz_re', label: 'Luz de Ré' },
          { key: 'luz_freio', label: 'Luz de Freio Principal' },
          { key: 'break_light', label: 'Break-light (Luz de Freio Central)' },
          { key: 'setas_dianteiras', label: 'Setas Dianteiras' },
          { key: 'setas_traseiras', label: 'Setas Traseiras' },
          { key: 'pisca_alerta', label: 'Pisca-Alerta' },
          { key: 'luz_placa', label: 'Luz de Placa Traseira' },
          { key: 'lentes_farois_lanternas', label: 'Lentes dos Faróis e Lanternas (Estado Físico)' }
        ]
      },
      {
        id: 'limpadores_vidros',
        title: '💦 Limpadores & Vidros',
        items: [
          { key: 'palhetas_limpador', label: 'Palhetas dos Limpadores (Estado)' },
          { key: 'bracos_limpador', label: 'Braços do Limpador' },
          { key: 'esguicho_parabrisa', label: 'Esguichos de Água (Funcionamento)' },
          { key: 'parabrisa_trincas', label: 'Para-brisa (Trincas ou Danos)' },
          { key: 'espelhos_retrovisores', label: 'Espelhos Retrovisores Externos' }
        ]
      },
      {
        id: 'estrutura_fechamento',
        title: '🔒 Estrutura & Fechamentos',
        items: [
          { key: 'trava_capo', label: 'Trava do Capô' },
          { key: 'porta_malas_fechadura', label: 'Fechadura do Porta-Malas' },
          { key: 'trincos_portas', label: 'Trincos das Portas' },
          { key: 'dobradicas_lubrificacao', label: 'Lubrificação de Dobradiças e Limitadores' },
          { key: 'alinhamento_carroceria', label: 'Alinhamento dos Painéis da Carroceria' }
        ]
      }
    ]
  },
  {
    id: 'interior_control',
    title: '2. No Chão — Interior do Veículo e Controles',
    subcategories: [
      {
        id: 'painel_controles',
        title: '📊 Painel & Controles',
        items: [
          { key: 'luzes_espias_painel', label: 'Luzes Espias e de Advertência do Painel' },
          { key: 'iluminacao_painel_console', label: 'Iluminação do Painel e Console' },
          { key: 'comandos_painel', label: 'Comandos Físicos do Painel' }
        ]
      },
      {
        id: 'pedais_freio',
        title: '⚙️ Pedais & Freio de Mão',
        items: [
          { key: 'pedal_freio_curso', label: 'Curso e Folga do Pedal de Freio' },
          { key: 'pedal_embreagem_curso', label: 'Curso e Folga do Pedal de Embreagem' },
          { key: 'pedal_acelerador', label: 'Pedal do Acelerador' },
          { key: 'cobertura_pedais', label: 'Pedaleiras (Borrachas de Cobertura)' },
          { key: 'alavanca_freio_estacionamento', label: 'Freio de Estacionamento (Curso da Alavanca)' }
        ]
      },
      {
        id: 'conforto_climatizacao',
        title: '✨ Conforto & Climatização',
        items: [
          { key: 'buzina_funcionamento', label: 'Buzina (Funcionamento)' },
          { key: 'vidros_eletricos_comando', label: 'Comando dos Vidros Elétricos' },
          { key: 'travas_eletricas_comando', label: 'Comando das Travas Elétricas' },
          { key: 'retrovisores_eletricos', label: 'Ajuste dos Retrovisores Elétricos' },
          { key: 'ar_condicionado_resfriamento', label: 'Ar-Condicionado (Resfriamento)' },
          { key: 'fluxo_ar_cabine', label: 'Direcionamento e Fluxo de Ar' }
        ]
      },
      {
        id: 'seguranca_interna',
        title: '🛡️ Segurança Interna',
        items: [
          { key: 'cintos_seguranca_fivelas', label: 'Cintos de Segurança (Fivelas e Travas)' },
          { key: 'cintos_seguranca_retracao', label: 'Retração dos Cintos de Segurança' }
        ]
      }
    ]
  },
  {
    id: 'engine_compartment',
    title: '3. Sob o Capô — Compartimento do Motor',
    subcategories: [
      {
        id: 'fluidos_lubrificacao',
        title: '🧪 Fluidos & Lubrificação',
        items: [
          { key: 'oleo_motor_nivel', label: 'Óleo do Motor (Nível)' },
          { key: 'oleo_motor_viscosidade', label: 'Óleo do Motor (Viscosidade/Estado)' },
          { key: 'fluido_freio_nivel', label: 'Fluido de Freio (Nível)' },
          { key: 'fluido_freio_contaminacao', label: 'Fluido de Freio (Contaminação)' },
          { key: 'liquido_arrefecimento_nivel', label: 'Líquido de Arrefecimento (Nível)' },
          { key: 'liquido_arrefecimento_aditivo', label: 'Líquido de Arrefecimento (Aditivo)' },
          { key: 'radiador_tampa', label: 'Radiador e Tampa do Reservatório' },
          { key: 'fluido_direcao_nivel', label: 'Fluido da Direção Hidráulica' }
        ]
      },
      {
        id: 'ar_combustivel',
        title: '💨 Sistemas de Ar & Combustível',
        items: [
          { key: 'filtro_ar_motor', label: 'Filtro de Ar do Motor' },
          { key: 'filtro_combustivel_externo', label: 'Filtro de Combustível Externo' },
          { key: 'linhas_combustivel_motor', label: 'Linhas de Combustível (Compartimento)' },
          { key: 'tanque_partida_frio', label: 'Reservatório de Partida a Frio' }
        ]
      },
      {
        id: 'sistemas_eletricos',
        title: '⚡ Sistemas Eletroeletrônicos',
        items: [
          { key: 'bateria_fixacao_suporte', label: 'Bateria (Fixação Física)' },
          { key: 'bateria_limpeza_polos', label: 'Bateria (Limpeza e Bornes)' },
          { key: 'tensao_bateria', label: 'Medição de Tensão da Bateria' },
          { key: 'alternador_carga', label: 'Teste de Carga do Alternador' }
        ]
      },
      {
        id: 'mecanica_transmissao',
        title: '🔧 Mecânica & Transmissão',
        items: [
          { key: 'mangueiras_arrefecimento', label: 'Mangueiras de Arrefecimento' },
          { key: 'mangueiras_vacuo', label: 'Tubulações e Mangueiras de Vácuo' },
          { key: 'velas_ignicao', label: 'Velas de Ignição' },
          { key: 'cabos_bobinas_ignicao', label: 'Cabos e Bobinas de Ignição' },
          { key: 'correia_acessorios', label: 'Correia de Acessórios (Estado/Tensão)' },
          { key: 'correia_dentada_estado', label: 'Correia Dentada e Tensores' },
          { key: 'junta_tampa_valvulas', label: 'Vazamentos na Junta de Tampa de Válvulas' },
          { key: 'corpo_borboleta_tbi', label: 'Corpo de Borboleta (TBI)' },
          { key: 'sistema_pcv', label: 'Válvula e Mangueira PCV (Respiro)' }
        ]
      },
      {
        id: 'clima_cabine',
        title: '❄️ Climatização de Cabine',
        items: [
          { key: 'filtro_cabine_polen', label: 'Filtro de Cabine (Pólen)' }
        ]
      }
    ]
  },
  {
    id: 'half_elevation',
    title: '4. Meia Elevação — Rodas, Pneus e Componentes Periféricos',
    subcategories: [
      {
        id: 'pneus_calibragem',
        title: '🛞 Pneus & Calibragem',
        items: [
          { key: 'pneu_dianteiro_esquerdo', label: 'Pneu Dianteiro Esquerdo (Sulcos/TWI)' },
          { key: 'pneu_dianteiro_direito', label: 'Pneu Dianteiro Direito (Sulcos/TWI)' },
          { key: 'pneu_traseiro_esquerdo', label: 'Pneu Traseiro Esquerdo (Sulcos/TWI)' },
          { key: 'pneu_traseiro_direito', label: 'Pneu Traseiro Direito (Sulcos/TWI)' },
          { key: 'desgaste_irregular_pneus', label: 'Desgaste Irregular nos Pneus' },
          { key: 'flancos_bolhas_cortes', label: 'Flancos dos Pneus (Bolhas/Cortes)' },
          { key: 'estepe_conservacao', label: 'Estepe (Conservação e Sulcos)' },
          { key: 'calibragem_cinco_pneus', label: 'Calibragem dos 5 Pneus' }
        ]
      },
      {
        id: 'freios_rodas',
        title: '🛑 Freios & Rodas',
        items: [
          { key: 'pastilhas_freio_dianteiras', label: 'Pastilhas de Freio Dianteiras' },
          { key: 'discos_freio_dianteiros', label: 'Discos de Freio Dianteiros' },
          { key: 'sapatas_lonas_traseiras', label: 'Sapatas/Lonas de Freio Traseiras' },
          { key: 'tambores_freio_traseiros', label: 'Tambores de Freio Traseiros' },
          { key: 'flexiveis_freio_mangueiras', label: 'Flexíveis e Mangueiras de Freio' },
          { key: 'rodas_trincas_amassados', label: 'Rodas (Trincas e Amassados)' },
          { key: 'aperto_parafusos_rodas', label: 'Aperto dos Parafusos das Rodas' }
        ]
      },
      {
        id: 'suspensao_direcao',
        title: '🎯 Suspensão & Direção',
        items: [
          { key: 'rolamentos_cubos_roda', label: 'Rolamentos dos Cubos de Roda' },
          { key: 'amortecedores_dianteiros', label: 'Amortecedores Dianteiros (Vazamento/Estado)' },
          { key: 'amortecedores_traseiros', label: 'Amortecedores Traseiros (Vazamento/Estado)' },
          { key: 'molas_helicoidais', label: 'Molas Helicoidais' },
          { key: 'pivos_bandejas_buchas', label: 'Pivôs, Bandejas e Buchas' },
          { key: 'bieletas_barra_estabilizadora', label: 'Bieletas e Buchas da Barra Estabilizadora' },
          { key: 'terminais_direcao', label: 'Terminais de Direção' },
          { key: 'barras_axiais', label: 'Barras Axiais da Direção' },
          { key: 'coifas_caixa_direcao', label: 'Coifas da Caixa de Direção' },
          { key: 'coifas_juntas_homocinetica', label: 'Coifas de Juntas Homocinéticas' }
        ]
      }
    ]
  },
  {
    id: 'full_elevation',
    title: '5. Elevação Total — Parte Inferior do Veículo',
    subcategories: [
      {
        id: 'fluidos_vazamentos',
        title: '🛢️ Fluidos & Vazamentos Inferiores',
        items: [
          { key: 'oleo_motor_drenagem', label: 'Bujão e Drenagem de Óleo do Motor' },
          { key: 'fluido_cambio_nivel', label: 'Nível/Vazamento de Óleo do Câmbio' },
          { key: 'oleo_diferencial', label: 'Óleo do Diferencial (se aplicável)' },
          { key: 'vazamento_carter', label: 'Vazamentos no Cárter do Motor' }
        ]
      },
      {
        id: 'escape_estrutura',
        title: '🧱 Escape & Estrutura',
        items: [
          { key: 'tubulacoes_freio_combustivel', label: 'Tubulações Rígidas de Freio e Combustível' },
          { key: 'cabos_freio_estacionamento', label: 'Cabos e Guias do Freio de Estacionamento' },
          { key: 'escapamento_tubos', label: 'Tubos de Escapamento e Abafadores' },
          { key: 'catalisador_escapamento', label: 'Catalisador (Integridade)' },
          { key: 'coxins_suportes_escapamento', label: 'Coxins e Fixações do Escapamento' },
          { key: 'assoalho_estrutura', label: 'Assoalho e Longarinas (Oxidação/Danos)' },
          { key: 'protetor_carter_danos', label: 'Protetor de Cárter' },
          { key: 'eixo_carda_cruzetas', label: 'Eixo Cardã, Cruzetas e Suportes' }
        ]
      }
    ]
  },
  {
    id: 'diagnostics_final',
    title: '6. Diagnóstico Eletrônico e Processos Finais',
    subcategories: [
      {
        id: 'scanner_eletronico',
        title: '🔌 Varredura Eletrônica & Scanner',
        items: [
          { key: 'scanner_leitura_dtc', label: 'Leitura Completa de DTC (Códigos de Falha)' },
          { key: 'scanner_abs_esp', label: 'Módulos Eletrônicos: ABS e ESP' },
          { key: 'scanner_airbag', label: 'Módulos Eletrônicos: Airbag' },
          { key: 'sensores_tempo_real', label: 'Sensores em Tempo Real (Sonda Lambda, MAF/MAP)' }
        ]
      },
      {
        id: 'testes_praticos',
        title: '🏁 Testes Práticos & Finalização',
        items: [
          { key: 'reset_indicador_revisao', label: 'Reset de Indicador de Revisão' },
          { key: 'teste_emissoes_gases', label: 'Teste de Emissões/Opacidade' },
          { key: 'teste_rodagem_freio', label: 'Teste de Rodagem (Eficiência de Frenagem)' },
          { key: 'teste_rodagem_barulhos', label: 'Teste de Rodagem (Barulhos e Vibrações)' },
          { key: 'teste_rodagem_direcao', label: 'Teste de Rodagem (Estabilidade/Alinhamento)' },
          { key: 'temperatura_ar_condicionado', label: 'Temperatura de Saída do Ar-Condicionado' },
          { key: 'acionamento_eletroventilador', label: 'Acionamento do Eletroventilador' },
          { key: 'laudo_tecnico_final', label: 'Preenchimento Completo do Laudo' }
        ]
      }
    ]
  }
];

const getInitialChecklistStructure = () => {
  const stored = localStorage.getItem('vora_custom_checklist_structure');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return CHECKLIST_CATEGORIES;
};

export default function ChecklistTab({ checklist, onChange, onAddRepairShortcut, readOnly = false }) {
  const [checklistStructure, setChecklistStructure] = useState(getInitialChecklistStructure);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openNotes, setOpenNotes] = useState({});
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  // States for adding items
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [addingSubcategoryForCatId, setAddingSubcategoryForCatId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [addingItemForSubId, setAddingItemForSubId] = useState(null);

  const saveStructure = (newStructure) => {
    setChecklistStructure(newStructure);
    localStorage.setItem('vora_custom_checklist_structure', JSON.stringify(newStructure));
  };

  const handleResetStructure = () => {
    if (window.confirm("Deseja realmente restaurar o checklist para a estrutura padrão? Todas as categorias, subcategorias e itens personalizados serão removidos.")) {
      saveStructure(CHECKLIST_CATEGORIES);
    }
  };

  const handleAddCategorySubmit = (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat = {
      id: `custom_cat_${Date.now()}`,
      title: newCategoryName.trim(),
      subcategories: []
    };
    const updated = [...checklistStructure, newCat];
    saveStructure(updated);
    setNewCategoryName('');
    setShowAddCategoryInput(false);
    setActiveCategory(newCat.id);
  };

  const handleAddSubcategorySubmit = (catId) => {
    if (!newSubcategoryName.trim()) return;
    const updated = checklistStructure.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          subcategories: [
            ...cat.subcategories,
            {
              id: `custom_sub_${Date.now()}`,
              title: newSubcategoryName.trim(),
              items: []
            }
          ]
        };
      }
      return cat;
    });
    saveStructure(updated);
    setNewSubcategoryName('');
    setAddingSubcategoryForCatId(null);
  };

  const handleAddItemSubmit = (catId, subId) => {
    if (!newItemName.trim()) return;
    const updated = checklistStructure.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub => {
            if (sub.id === subId) {
              return {
                ...sub,
                items: [
                  ...sub.items,
                  {
                    key: `custom_item_${Date.now()}`,
                    label: newItemName.trim()
                  }
                ]
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });
    saveStructure(updated);
    setNewItemName('');
    setAddingItemForSubId(null);
  };

  const handleHideItem = (key) => {
    const updated = checklistStructure.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        items: sub.items.map(item => {
          if (item.key === key) {
            return { ...item, hidden: true };
          }
          return item;
        })
      }))
    }));
    saveStructure(updated);
  };

  const handleUnhideItem = (key) => {
    const updated = checklistStructure.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        items: sub.items.map(item => {
          if (item.key === key) {
            return { ...item, hidden: false };
          }
          return item;
        })
      }))
    }));
    saveStructure(updated);
  };

  const toggleCategory = (catId) => {
    setActiveCategory(prev => {
      setActiveSubcategory(null);
      return prev === catId ? null : catId;
    });
  };

  const toggleSubcategory = (subId) => {
    setActiveSubcategory(prev => prev === subId ? null : subId);
  };

  const toggleNotes = (key) => {
    setOpenNotes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStatusChange = (key, status, label) => {
    if (readOnly) return;
    const currentItem = checklist[key] || { status: 'NA', notes: '' };
    // If the same status is clicked, toggle it back to 'NA' (unselected/N/A)
    const newStatus = currentItem.status === status ? 'NA' : status;
    const newChecklist = {
      ...checklist,
      [key]: {
        ...currentItem,
        status: newStatus
      }
    };

    const repairDesc = `Reparar: ${label}`;
    if (newStatus === 'FAIL') {
      onChange(newChecklist, repairDesc, null);
    } else {
      onChange(newChecklist, null, repairDesc);
    }
  };

  const handleNotesChange = (key, notes) => {
    if (readOnly) return;
    const currentItem = checklist[key] || { status: 'NA', notes: '' };
    onChange({
      ...checklist,
      [key]: {
        ...currentItem,
        notes
      }
    });
  };

  // Stats calculation
  const totalItems = checklistStructure.reduce((acc, cat) => 
    acc + cat.subcategories.reduce((sAcc, sub) => 
      sAcc + sub.items.filter(i => !i.hidden).length, 0
    ), 0
  );
  const okCount = Object.values(checklist).filter(item => item.status === 'OK').length;
  const failCount = Object.values(checklist).filter(item => item.status === 'FAIL').length;
  const pendingCount = Math.max(0, totalItems - (okCount + failCount));

  // Extract all hidden items for the dedicated category
  const allHiddenItems = [];
  checklistStructure.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.items.forEach(item => {
        if (item.hidden) {
          allHiddenItems.push({
            ...item,
            categoryTitle: cat.title,
            subcategoryTitle: sub.title
          });
        }
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Conformes</p>
          <p className="text-base font-headline font-black text-emerald-400 mt-1">{okCount}</p>
        </div>
        <div className="text-center border-l border-slate-800">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Com Defeito</p>
          <p className="text-base font-headline font-black text-rose-400 mt-1">{failCount}</p>
        </div>
        <div className="text-center border-l border-slate-800 font-headline">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Não Verificados / N/A</p>
          <p className={`text-base font-black mt-1 ${pendingCount > 0 ? 'text-slate-400' : 'text-slate-500'}`}>
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Category Accordion List */}
      <div className="space-y-4">
        {checklistStructure.map(cat => {
          const categoryKeys = cat.subcategories.reduce((acc, sub) => 
            acc.concat(sub.items.filter(i => !i.hidden).map(i => i.key)), []
          );
          const failedInCategory = categoryKeys.some(k => checklist[k]?.status === 'FAIL');
          const totalCategoryItems = cat.subcategories.reduce((acc, sub) => 
            acc + sub.items.filter(i => !i.hidden).length, 0
          );
          const verifiedCategoryItems = categoryKeys.filter(k => checklist[k]?.status === 'OK' || checklist[k]?.status === 'FAIL').length;
          const isOpen = activeCategory === cat.id;

          return (
            <div 
              key={cat.id} 
              className="glass-panel rounded-2xl overflow-hidden border border-slate-800 transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                  isOpen 
                    ? 'bg-sky-500/10 text-white' 
                    : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="min-w-0">
                    <p className={`text-xs font-black uppercase tracking-wider ${isOpen ? 'text-sky-400' : 'text-slate-200'}`}>
                      {cat.title}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate mt-0.5">
                      {totalCategoryItems} itens a verificar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {failedInCategory && (
                    <span className="h-2 w-2 rounded-full bg-rose-500" title="Contém defeitos"></span>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-850/80">
                    {verifiedCategoryItems} / {totalCategoryItems}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="p-4 border-t border-slate-855 bg-slate-950/20 space-y-4 animate-fade-in">
                  {cat.subcategories.map((sub, subIdx) => {
                    const isSubOpen = activeSubcategory === sub.id;
                    const subKeys = sub.items.map(i => i.key);
                    const totalSubItems = sub.items.length;
                    const verifiedSubItems = subKeys.filter(k => checklist[k]?.status === 'OK' || checklist[k]?.status === 'FAIL').length;

                    return (
                      <div key={sub.id || subIdx} className="space-y-3">
                        <button
                          type="button"
                          onClick={() => toggleSubcategory(sub.id)}
                          className="w-full flex items-center justify-between border-b border-slate-800 pb-2 mt-2 first:mt-0 hover:text-sky-300 transition-all text-left"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                            {sub.title}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                              {verifiedSubItems} / {totalSubItems}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform text-slate-500 ${isSubOpen ? 'rotate-180 text-sky-400' : ''}`} />
                          </div>
                        </button>

                        {isSubOpen && (
                          <div className="space-y-3 animate-fade-in">
                            {sub.items.filter(item => !item.hidden).map(item => {
                              const state = checklist[item.key] || { status: 'NA', notes: '' };
                              const isFailed = state.status === 'FAIL';

                              return (
                                <div 
                                  key={item.key}
                                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                    state.status === 'OK' 
                                      ? 'bg-emerald-500/5 border-emerald-500/10' 
                                      : state.status === 'FAIL' 
                                      ? 'bg-rose-500/5 border-rose-500/15'
                                      : 'bg-slate-900/40 border-slate-800/80'
                                  }`}
                                >
                                  {/* Extremidade Esquerda: Botão Conforme */}
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(item.key, 'OK', item.label)}
                                    disabled={readOnly}
                                    className={`h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                                      state.status === 'OK'
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                        : 'bg-slate-950 border border-slate-855 text-slate-500 hover:text-slate-300 hover:border-slate-750 disabled:opacity-45'
                                    }`}
                                  >
                                    Conforme
                                  </button>

                                  {/* Centro: Texto do Item e Botão de Notas */}
                                  <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1">
                                    <div className="flex items-center gap-1.5 justify-center max-w-full">
                                      <span className={`text-[10px] font-bold uppercase tracking-tight text-center leading-tight ${
                                        state.status === 'OK'
                                          ? 'text-emerald-455 text-emerald-400'
                                          : state.status === 'FAIL'
                                          ? 'text-rose-455 text-rose-400'
                                          : 'text-slate-300'
                                      }`}>
                                        {item.label}
                                      </span>
                                      {(!readOnly || state.notes) && (
                                        <button
                                          type="button"
                                          onClick={() => toggleNotes(item.key)}
                                          className={`p-1 rounded-lg shrink-0 transition-all ${
                                            state.notes || openNotes[item.key]
                                              ? 'text-sky-400 bg-sky-500/10'
                                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                          }`}
                                          title="Anotações"
                                        >
                                          <FileText className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      {!readOnly && (
                                        <button
                                          type="button"
                                          onClick={() => handleHideItem(item.key)}
                                          className="p-1 rounded-lg shrink-0 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10 transition-all"
                                          title="Ocultar item"
                                        >
                                          <EyeOff className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Campo de anotações (se aberto ou se tiver anotação) */}
                                    {(openNotes[item.key] || state.notes) && (
                                      <div className="w-full max-w-md mt-2 animate-fade-in">
                                        <input
                                          type="text"
                                          value={state.notes}
                                          onChange={(e) => handleNotesChange(item.key, e.target.value)}
                                          disabled={readOnly}
                                          className="w-full h-8 px-3 bg-slate-950 border border-slate-855 focus:border-sky-500 focus:outline-none rounded-xl text-[10px] font-medium text-slate-300 placeholder-slate-650"
                                          placeholder={readOnly ? "Sem anotações" : "Digite anotações ou observações..."}
                                          autoFocus={openNotes[item.key]}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Extremidade Direita: Ações de Defeito / Conserto */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(item.key, 'FAIL', item.label)}
                                      disabled={readOnly}
                                      className={`h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                                        state.status === 'FAIL'
                                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                                          : 'bg-slate-950 border border-slate-855 text-slate-500 hover:text-slate-300 hover:border-slate-750 disabled:opacity-45'
                                      }`}
                                    >
                                      Defeito
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {!readOnly && (
                              <div className="pt-2 border-t border-slate-900/30">
                                {addingItemForSubId === sub.id ? (
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleAddItemSubmit(cat.id, sub.id);
                                    }}
                                    className="flex gap-2 p-2 bg-slate-950/40 border border-slate-850 rounded-xl animate-fade-in"
                                  >
                                    <input
                                      type="text"
                                      value={newItemName}
                                      onChange={(e) => setNewItemName(e.target.value)}
                                      placeholder="Nome do item..."
                                      className="flex-1 bg-slate-950 border border-slate-855 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                                      autoFocus
                                    />
                                    <button
                                      type="submit"
                                      className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                                    >
                                      Ok
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAddingItemForSubId(null)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                                    >
                                      Cancelar
                                    </button>
                                  </form>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddingItemForSubId(sub.id);
                                      setNewItemName('');
                                    }}
                                    className="w-full py-1.5 border border-dashed border-slate-800 hover:border-sky-500/30 hover:bg-sky-500/5 rounded-xl flex items-center justify-center gap-1.5 text-slate-500 hover:text-sky-400 text-[9px] font-black uppercase tracking-wider transition-all"
                                  >
                                    <Plus className="h-3 w-3" /> Adicionar Item de Verificação
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!readOnly && (
                    <div className="pt-2">
                      {addingSubcategoryForCatId === cat.id ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddSubcategorySubmit(cat.id);
                          }}
                          className="flex gap-2 p-2 bg-slate-950/20 border border-slate-850 rounded-xl animate-fade-in"
                        >
                          <input
                            type="text"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            placeholder="Nome da subcategoria..."
                            className="flex-1 bg-slate-950 border border-slate-855 rounded-lg px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Ok
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingSubcategoryForCatId(null)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSubcategoryForCatId(cat.id);
                            setNewSubcategoryName('');
                          }}
                          className="w-full py-2 border border-dashed border-slate-850/50 hover:border-sky-500/30 hover:bg-sky-500/5 rounded-xl flex items-center justify-center gap-1.5 text-slate-500 hover:text-sky-400 text-[9px] font-black uppercase tracking-wider transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" /> Adicionar Nova Subcategoria
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Categoria dos Ocultados */}
        {allHiddenItems.length > 0 && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 transition-all duration-300">
            <button
              type="button"
              onClick={() => toggleCategory('hidden_items')}
              className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                activeCategory === 'hidden_items'
                  ? 'bg-rose-500/10 text-white'
                  : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="min-w-0">
                  <p className={`text-xs font-black uppercase tracking-wider ${activeCategory === 'hidden_items' ? 'text-rose-405' : 'text-slate-200'}`}>
                    👁️ Itens Ocultados
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate mt-0.5">
                    {allHiddenItems.length} itens desativados nesta vistoria
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-455 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-850/80">
                  {allHiddenItems.length} ocultos
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-slate-400 ${activeCategory === 'hidden_items' ? 'rotate-180 text-rose-455' : ''}`} />
              </div>
            </button>

            {activeCategory === 'hidden_items' && (
              <div className="p-4 border-t border-slate-855 bg-slate-950/20 space-y-3 animate-fade-in">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mb-1 leading-relaxed">
                  Os itens abaixo foram ocultados do checklist de verificação e não influenciam no progresso ou estatísticas. Clique em "Exibir" para restaurá-los à subcategoria original.
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {allHiddenItems.map(hItem => (
                    <div 
                      key={hItem.key} 
                      className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 animate-fade-in"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wide leading-tight">
                          {hItem.label}
                        </p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                          Categoria Original: <span className="text-sky-450/80">{hItem.categoryTitle.replace(/^\d+\.\s*/, '')}</span> &gt; <span className="text-sky-455/80">{hItem.subcategoryTitle}</span>
                        </p>
                      </div>
                      
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleUnhideItem(hItem.key)}
                          className="h-8 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 hover:border-sky-500/40 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" /> Exibir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="space-y-3">
          {showAddCategoryInput ? (
            <form 
              onSubmit={handleAddCategorySubmit}
              className="flex gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl animate-fade-in"
            >
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da nova categoria principal..."
                className="flex-1 bg-slate-950 border border-slate-855 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Ok
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryInput(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryInput(true);
                  setNewCategoryName('');
                }}
                className="flex-1 py-3 border border-dashed border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-sky-400 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" /> Adicionar Nova Categoria
              </button>
              
              <button
                type="button"
                onClick={handleResetStructure}
                className="px-4 py-3 border border-slate-800 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-amber-400 text-xs font-bold transition-all"
                title="Restaurar Checklist Padrão"
              >
                Restaurar Padrão
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
        <p className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> Informação
        </p>
        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">
          Marque os itens não conformes identificados durante a recepção do veículo. Itens marcados como "Defeito" habilitam o botão rápido de criação de tarefas na aba de reparos para acelerar o cálculo final de despesas.
        </p>
      </div>
    </div>
  );
}
