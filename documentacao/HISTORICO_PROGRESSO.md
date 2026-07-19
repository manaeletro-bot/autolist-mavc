# 📅 Histórico de Progresso do Projeto (AUTOLIST - MAVC)

Este arquivo registra a linha do tempo e a evolução das versões do sistema AUTOLIST - MAVC.

## Linha do Tempo de Versões

### Versão 2.0 - Infraestrutura Cloud Independente & Renomeação de Marca (Atual)
*   **Foco:** Publicação do projeto em ambiente cloud 100% isolado sob o novo nome **AUTOLIST - MAVC**.
*   **Melhorias:**
    *   Renomeação da marca e identificadores do projeto de AUTOLIST - MEVC para **AUTOLIST - MAVC**.
    *   Criação de repositório Git isolado no GitHub (`manaeletro-bot/autolist-mavc`).
    *   Instalação da biblioteca oficial `@supabase/supabase-js` e ativação do adaptador cloud nativo.
    *   Provisionamento de nova instância Supabase Cloud, criação da tabela `vehicles` e políticas RLS de leitura/escrita.
    *   Deploy em produção na Vercel ([autolist-mavc.vercel.app](https://autolist-mavc.vercel.app)) com variáveis de ambiente e Keep-Alive Cron configurados.
    *   Criação de relatório de credenciais confidenciais e proteção no `.gitignore`.

### Versão 1.9 - Rastreamento de Débitos, Quitações e Custos de Documentação
*   **Foco:** Fornecer aos revendedores controle total sobre as despesas e passivos do veículo para cálculo preciso da margem de lucro real.
*   **Melhorias:**
    *   Criação de novos campos de despesas de aquisição: Quitação de Financiamento, Multas Pendentes, Documentação e Transferência, e Outras Despesas Relacionadas.
    *   Implementação de cálculo automático do total investido (soma do valor de compra + reparos + todas as despesas e débitos adicionais).
    *   Atualização em tempo real das margens de lucro estimadas e lucros mínimos assegurados (calculados com base no desconto máximo parametrizado).
    *   Exibição de detalhamento de despesas no painel financeiro (DRE) e no cadastro/edição de veículos.
    *   Sanitização robusta dos novos campos nos adaptadores de dados.

### Versão 1.8 - Sistema de Controle de Compressão, Estatísticas de Imagem e Keep-Alive Supabase
*   **Foco:** Otimização de espaço em banco de dados e prevenção de hibernação automática do Supabase.
*   **Melhorias:**
    *   Exposição de controles de compressão de imagem (seletores de resolução máxima: 800px, 1024px, 1200px; e qualidade: 50%, 70%, 85%) diretamente na área de gerenciamento de fotos em `VehicleForm.jsx` e `VehicleDetails.jsx`.
    *   Cálculo e exibição em tempo real do tamanho em KB/MB ocupado por cada imagem no formato base64 antes do salvamento no banco de dados.
    *   Feedback visual imediato sobre a compressão com etiquetas exibidas em cima de cada foto carregada.
    *   Criação de rota de API Vercel Serverless `/api/keep-alive` e configuração de Cron Job (`vercel.json`) executada a cada 3 dias para realizar requisições automáticas e evitar a suspensão do banco de dados gratuito do Supabase.

### Versão 1.7 - Integração Automatizada de Checklist e Reparos
*   **Foco:** Automatizar o fluxo onde defeitos constatados na vistoria geram pendências de reparo automaticamente.
*   **Melhorias:**
    *   Sincronização automática entre o Checklist de Vistoria e a aba de "Reparos e Custos". Marcar um item como "Defeito" gera um reparo pendente com custo de `R$ 0,00`.
    *   Remoção automática de reparos pendentes e zerados caso o defeito correspondente seja desmarcado ou marcado como conforme.
    *   Unificação de estado atômica no componente pai `VehicleDetails.jsx` para evitar condições de corrida (race conditions) no React durante salvamentos concorrentes de estado.
    *   Remoção do botão manual de atalho "+" da listagem de itens do checklist, tornando a integração totalmente invisível e intuitiva.

### Versão 1.6 - Compatibilidade PWA (Progressive Web App)
*   **Foco:** Transformação da plataforma em um aplicativo web progressivo instalável para celulares e computadores com controle de cache.
*   **Melhorias:**
    *   Criação do arquivo `manifest.json` com nome, cores do tema, escopo e caminhos do ícone.
    *   Implementação de Service Worker (`sw.js`) para caching de assets estáticos através da estratégia *Stale-While-Revalidate* e controle offline.
    *   Configuração do ícone de alta qualidade `image/ICOM.png` como favicon do site, ícone de atalho iOS e ícone oficial de instalação PWA.
    *   Configuração de tags HTML específicas no cabeçalho do `index.html` para dar suporte a recursos mobile de visualização em tela cheia (standalone).

### Versão 1.5 - Checklist Dinâmico Personalizável e Ocultação de Itens
*   **Foco:** Personalização em tempo real da vistoria e controle fino de visibilidade dos itens de verificação.
*   **Melhorias:**
    *   Substituição do checklist estático por estrutura dinâmica persistida em `localStorage`.
    *   Possibilidade de adicionar novas Categorias (no fim da lista), Subcategorias (dentro de cada categoria) e Itens (dentro de cada subcategoria aberta).
    *   Botão discreto para Ocultar itens redundantes ou não aplicáveis do checklist.
    *   Criação da categoria especial "Itens Ocultados" ao final do checklist para visualizar e restaurar itens ocultados.
    *   Atualização automática de estatísticas e contadores gerais para desconsiderar itens ocultados.
    *   Opção "Restaurar Padrão" para retornar o checklist à estrutura inicial a qualquer momento.

### Versão 1.4 - Otimização de Imagens e Refinamento do Checklist
*   **Foco:** Carregamento de imagens reais de teste, expansão da capacidade de fotos e melhoria da navegação/progresso do checklist.
*   **Melhorias:**
    *   Banco de dados local semeado com 10 imagens Unsplash em cada veículo de teste.
    *   Filtros de fotos atualizados para suportar URLs externas em paralelo com base64.
    *   Capacidade de fotos da galeria e do formulário aumentada de 6 para 12 slots.
    *   Interface de checklist reconfigurada para iniciar categorias e subcategorias recolhidas.
    *   Exclusão mútua implementada nas subcategorias e fechamento preventivo de subcategorias ao alternar categorias principais.
    *   Contadores de progresso de itens inspecionados (`realizados / total`) inseridos nas cabeceiras de categorias e subcategorias.

### Versão 1.3 - Menus Sanfona e Exclusão de Barras Horizontais
*   **Foco:** Refatoração de navegação de detalhes e checklist para remover barras de rolagem horizontal em telas de celular.
*   **Melhorias:**
    *   Conversão do menu de abas em um Menu Sanfona (Accordion) vertical.
    *   Conversão das abas de categorias do Checklist de Vistoria em um acordeão vertical independente.
    *   Implementação do seletor e exportador customizado de dados em formato PDF e TXT (com filtros de preço ou completo).

### Versão 1.2 - Combustível, Privacidade e Super-Busca
*   **Foco:** Ajustes de privacidade financeira, campo de combustível na ficha técnica e busca superturbinada.
*   **Melhorias:**
    *   Inclusão do campo "Combustível" no cadastro (Flex, Gasolina, Diesel, 100% Elétrico, Híbrido, Outros).
    *   Remoção completa da marca e referências "Bosch" do layout.
    *   Remoção do painel financeiro geral da tela inicial (privacidade), mantendo-o apenas na aba "Financeiro".
    *   Reposicionamento do botão "Excluir Veículo" da listagem principal para o lado interno dos detalhes do veículo.
    *   Barra de busca otimizada para filtrar por modelo, placa, chassi, ano, proprietários e combustíveis.
    *   Eliminação do título duplicado do dashboard.

### Versão 1.1 - Banco de Dados Local & Supabase
*   **Foco:** Conectividade de banco de dados híbrido.
*   **Melhorias:**
    *   Criação de chaveador dinâmico de Banco de Dados (`Local db.json` vs `Produção Supabase`) na barra lateral esquerda.

### Versão 1.0 - Lançamento da Plataforma Inicial
*   **Foco:** MVP de Gestão de Vistorias e Cadastro de Veículos.
*   **Melhorias:**
    *   Dashboard principal com listagem de veículos.
    *   Formulário de cadastro/edição básica de veículos.
    *   Checklist de 100+ pontos de qualidade.
