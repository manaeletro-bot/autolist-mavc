# 🛠️ Regras de Desenvolvimento (AUTOLIST - MAVC)

Este arquivo descreve as regras e diretrizes que devem ser obedecidas por qualquer IA ou desenvolvedor atuando neste repositório.

## Regras de Design e UX/UI

### Regra 1: Design Premium & Estética Glassmorphism
*   Todo o sistema deve seguir uma interface limpa, com bordas arredondadas amplas (`rounded-2xl`, `rounded-3xl`) e efeitos de desfoque de fundo de vidro (`backdrop-blur-sm`, `bg-slate-900/40`, bordas semi-transparentes).

### Regra 2: Zero Barras de Rolagem Horizontal
*   Em viewports de celulares (largura menor que 768px), nenhuma aba, menu ou tabela deve ter barra de rolagem horizontal. Todo conteúdo deve se adaptar verticalmente utilizando grids responsivos ou menus sanfona (accordion) expansíveis.

### Regra 3: Menu Sanduíche à Direita (Mobile)
*   Em resoluções mobile, o menu sanduíche (drawer lateral) deve deslizar obrigatoriamente a partir da **direita** da tela.

## Regras Funcionais e de Segurança

### Regra 4: Privacidade Financeira
*   Os KPIs financeiros gerais da empresa (lucro total, investimentos acumulados, média de lucro, etc.) são estritamente privados e não devem aparecer na tela inicial (Dashboard). Eles só podem ser acessados na tela dedicada "Financeiro".

### Regra 5: Confirmação e Segurança ao Excluir
*   O botão de exclusão de veículos não deve ficar exposto nos cards da listagem principal do Dashboard. A exclusão de um veículo só é permitida na tela de detalhes (lado de dentro), exigindo confirmação de exclusão para evitar acidentes.

### Regra 6: Portabilidade da Ficha Técnica e DRE
*   Ao exportar os dados do veículo, sempre apresentar uma janela modal que ofereça a opção de omitir dados confidenciais de compra/reparos (criando uma versão limpa para enviar ao cliente) ou exportar a DRE completa (para backup ou integração com outros sistemas de anotações).

### Regra 7: Comportamento das Sanfonas no Checklist
*   Todas as categorias e subcategorias de vistoria devem iniciar completamente recolhidas ao acessar o painel de checklist. O comportamento deve ser de exclusão mútua (abrir uma categoria ou subcategoria fecha automaticamente a que estava aberta anteriormente).

### Regra 8: Contadores de Progresso em Tempo Real
*   Tanto os cabeçalhos de categorias principais quanto as subcategorias do checklist devem exibir um contador dinâmico de progresso da inspeção utilizando o formato literal `{verificados} / {total}` (ex: `3 / 23`). Um item é considerado verificado quando possui o status `OK` (Conforme) ou `FAIL` (Defeito).

### Regra 9: Customização Estrutural do Checklist
*   O usuário tem permissão para estender a lista de verificação criando novas categorias principais, subcategorias e itens em tempo real. A estrutura modificada deve ser persistida localmente (ex: `localStorage`) de maneira que persista entre as seções, e deve oferecer uma opção rápida para restaurar o checklist padrão (`CHECKLIST_CATEGORIES`).

### Regra 10: Isolamento de Itens Ocultados
*   Qualquer item de verificação pode ser ocultado pelo usuário. Uma vez oculto, o item não deve computar para os contadores de progresso e nem ser renderizado em sua subcategoria original. Em vez disso, deve ser listado em uma categoria estática virtual "Itens Ocultados" ao final da lista, contendo uma opção de restauração instantânea que o devolve à subcategoria original com seu estado preservado.

### Regra 11: Suporte e Integridade do PWA
*   Qualquer alteração em arquivos estáticos (HTML/CSS/JS) ou metadados de marca deve manter a integridade dos arquivos `public/manifest.json` e `public/sw.js`. Novos ativos ou atualizações devem manter suporte a carregamento rápido e offline, e a lógica de bypass de cache para a API (`/api/*`) deve ser estritamente preservada para evitar que requisições ao backend sirvam dados em cache e obsoletos.

### Regra 12: Integração Automática Checklist-Reparos
*   Marcar qualquer item do checklist como "Defeito" (FAIL) deve gerar automaticamente um registro pendente correspondente na lista de "Reparos e Custos" com preço zerado. Se o defeito for corrigido (marcado como "Conforme" ou "Não Aplicável"), o registro pendente associado de valor zerado deve ser removido automaticamente. A atualização do checklist e reparos deve ser realizada de forma atômica para evitar condições de corrida de estado.

### Regra 13: Otimização e Compressão de Imagens
*   Todas as imagens enviadas pelos usuários (no formulário de cadastro ou na visualização de detalhes) devem passar por compressão em tempo real no lado do cliente utilizando canvas (formato JPEG). O painel deve disponibilizar seletores de configuração de compressão (resolução e qualidade) de forma visível e exibir o tamanho final em KB/MB ocupado por cada imagem no banco de dados para transparência de economia de armazenamento.

### Regra 14: Cálculo Consolidado de Passivos e Despesas Extras
*   Qualquer cálculo de custo total ou investimento consolidado no veículo deve somar obrigatoriamente: o valor original de aquisição, a soma total de reparos e serviços, e todas as despesas burocráticas registradas (quitação de financiamento, multas e custos de documentação/transferência). Margens de desconto máximo e lucros simulados devem ser deduzidos desse custo consolidado total para prevenir prejuízos ao lojista.


