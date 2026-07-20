# 📖 Documentação Técnica (AUTOLIST - MAVC)

Este arquivo descreve a arquitetura do projeto, fluxo de dados e lógica interna das rotas e componentes.

## Arquitetura do Projeto

O sistema é uma aplicação SPA (Single Page Application) construída sobre a stack moderna de JavaScript.

*   **Frontend:** React (SPA) + Vite.
*   **Estilização:** CSS Vanilla integrado no TailwindCSS para consistência de design e rapidez de carregamento.
*   **Backend:** Servidor Node.js com Express para lidar com leitura/escrita do banco de dados local.
*   **Banco de Dados Híbrido:**
    *   **Local:** Arquivo JSON `data/db.json` gerenciado por requisições Express (`/api/vehicles`).
    *   **Produção:** Conexão direta com tabelas de banco de dados do Supabase. A alternância é feita dinamicamente no frontend por meio de um estado global de contexto de banco.

## Estrutura de Componentes Principais

*   `Layout.jsx`: Container principal que gerencia o menu lateral desktop, o drawer sanduíche mobile e o gatekeeper de bloqueio de conta (`SubscriptionLockModal`). Também exibe a alternância de Banco Local vs Banco Produção.
*   `SubscriptionLockModal.jsx`: Modal de bloqueio de tela com design iOS 18 Glassmorphism Dark, acionada automaticamente quando o plano do lojista expira (prazo de 2 dias de teste) ou a conta é suspensa, oferecendo link direto para o suporte WhatsApp (+55 62 99404-9949).
*   `Dashboard.jsx`: Painel principal com barra de busca superturbinada e grid responsivo de veículos.
*   `VehicleForm.jsx`: Formulário para criar ou editar as informações do veículo, incluindo fotos em base64 e campos de Combustível (Flex, Gasolina, Diesel, 100% Elétrico, Híbrido, Outros).
*   `VehicleDetails.jsx`: Exibe a ficha técnica e os acordeões expansíveis de Resumo, Checklist, Reparos, Diário e Galeria de Fotos. Também controla a exclusão interna e a geração do relatório customizado (PDF e TXT).
*   `ChecklistTab.jsx`: Renderiza a listagem de categorias do checklist como acordeões verticais independentes.
*   `RepairsTab.jsx`: Gerencia a lista de peças e serviços do carro.

## Fluxo de Busca Inteligente (Filtro Dinâmico)
A busca inteligente varre recursivamente no frontend os campos de:
*   Marca, Modelo, Placa e Chassi.
*   Ano do modelo.
*   Tipo de combustível (ex: "elétrico", "diesel").
*   Proprietário anterior e Comprador.
*   Valores de aquisição e venda.

## Histórico de Alterações (Vora DOC)

*   **[Vora DOC 001](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/001.md):** Identidade visual consolidada, menu mobile drawer à direita, ocultação de KPIs agregados da home, botão excluir apenas interno, campo Combustível na ficha técnica, PDF/TXT customizado e acordeão de abas principais de detalhes.
*   **[Vora DOC 002](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/002.md):** Refatoração do Checklist de Vistoria de abas horizontais com scroll lateral para acordeões verticais de categorias com chevrons e indicadores vermelhos de falhas. Exposição de host no Vite (`host: true`).
*   **[Vora DOC 003](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/003.md):** Semeadura de fotos reais Unsplash no banco local, expansão de slots de imagens de 6 para 12 no cadastro e detalhes, acordeões de categorias e subcategorias recolhidos por padrão no checklist sob lógica de exclusão mútua, e contadores dinâmicos formatados como `X / Y`.
*   **[Vora DOC 004](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/004.md):** Estrutura de checklist dinâmica persistida em localStorage, permitindo inserção rápida de novas categorias, subcategorias e itens de verificação, ocultação de itens com remoção dos contadores ativos e categoria dedicada "Itens Ocultados" para exibição e restauração.
*   **[Vora DOC 005](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/005.md):** Integração completa PWA (Progressive Web App). Geração de favicon e ícones iOS/Android baseados na imagem original `image/ICOM.png`. Criação de `manifest.json` com configurações de standalone e `sw.js` contendo cache Stale-While-Revalidate com bypass da API. Registro automático do Service Worker em `main.jsx`.
*   **[Vora DOC 006](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/006.md):** Integração Checklist-Reparos automática, compressão de imagens via Canvas (lado cliente), Keep-Alive da Vercel (Cron Job de 3 dias para acordar Supabase) e rastreamento de débitos burocráticos/despesas adicionais de documentação e multas.
*   **[Vora DOC 007](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/007.md):** Lançamento da infraestrutura cloud 100% isolada e renomeação definitiva para **AUTOLIST - MAVC**. Criação de repositório GitHub independente (`manaeletro-bot/autolist-mavc`), nova instância Supabase Cloud com cliente oficial `@supabase/supabase-js`, deploy na Vercel ([autolist-mavc.vercel.app](https://autolist-mavc.vercel.app)) e relatório confidencial `CREDENCIAIS_ACESSO.md`.
*   **[Vora DOC 008](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/008.md):** Otimizações de UX mobile: card simplificado no Dashboard, correção de truncamento em subtítulos sanfona (`break-words leading-tight`), cabeçalho dinâmico integrado no `Layout.jsx` (Marca, Placa, Modelo e Voltar no topo), elevação de botões de ação e conversão de mídias para 16:9 landscape (`1280x720`) com desfoque de fundo.
*   **[Vora DOC 009](file:///c:/Users/marci/Auto%20list/VORA%20CLOUD%20-%20OS/documentacao/Vora%20DOC/009.md):** Controle rígido de teste de 2 dias (`test_2d`), gatekeeper `SubscriptionLockModal.jsx` com padrão iOS 18 Glassmorphism Dark, suporte direto via WhatsApp (+55 62 99404-9949), rolagem nativa vertical e solução de conflitos de CSS com `.lock-mode`.


