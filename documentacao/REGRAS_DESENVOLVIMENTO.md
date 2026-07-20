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

### Regra 15: Proteção de Credenciais e Isolamento de Projetos Cloud
*   Qualquer chave privada, senha de banco de dados, token PAT ou URL interna gerada durante o provisionamento de novos ambientes deve ser armazenada estritamente em arquivos de documentação locais e protegidos no `.gitignore` (ex: `CREDENCIAIS_ACESSO.md`). É terminantemente proibido subir relatórios de senhas ou arquivos de chave sensíveis no versionamento público do GitHub. Além disso, deploys e bancos de dados cloud devem ser criados de forma 100% independente para cada produto.

### Regra 16: Proporção 16:9 e Adaptação Responsiva de Mídias
*   Todas as fotos de veículos exibidas nos cards e galerias devem possuir proporção horizontal landscape 16:9 (`1280x720`). Mídias gravadas ou enviadas originalmente em orientação retrato (vertical) devem ser adaptadas com fundo preenchido/desfocado de forma a evitar que a frente ou a traseira dos veículos sejam cortadas pela propriedade CSS `object-cover`.

### Regra 17: Integração de Navegação Interna no Cabeçalho Mobile
*   Em dispositivos móveis, quando o usuário abre os detalhes de um veículo, a barra de título superior fixa (`Layout.jsx`) deve assumir a identidade do veículo (Marca, Placa, Modelo e Botão Voltar). Isso elimina duplicidades visuais e permite elevar os botões primários de ação (`Vender`, `Baixar`, `Excluir`) para o topo da área útil de conteúdo.

### Regra 18: Limite de Teste (2 Dias) e Direcionamento ao Suporte
*   Todo novo lojista cadastrado possui um prazo rígido de 2 dias de teste gratuito (`test_2d`). Quando o prazo expira ou a conta é suspensa pelo Gestor, o sistema deve bloquear o acesso no nível do middleware de interface (`Layout.jsx` / `authService.js`), exibindo a modal de bloqueio `SubscriptionLockModal.jsx` com o número direto de suporte e renovação via WhatsApp (**+55 62 99404-9949**).

### Regra 19: Padrão iOS 18 Glassmorphism e Isolamento de Sobrescritas CSS
*   Modais de bloqueio e avisos críticos de sistema devem utilizar a linguagem **iOS 18 Glassmorphism Dark** (preto profundo translúcido `bg-zinc-950/80 backdrop-blur-3xl`, brilhos neon sutis e tipografia em branco puro `#FFFFFF`). Qualquer modal que possa ultrapassar a altura da viewport deve conter limite `max-h-[90vh]` e rolagem vertical nativa (`overflow-y-auto scrollbar-thin`). Além disso, para evitar que regras de tema claro substituam cores escuras em modais, a classe de contexto (ex: `lock-mode`) deve ser aplicada ao `body` e isolada no `index.css`.

### Regra 20: Auto-Seleção Instantânea em Campos Numéricos (`onFocus select`)
*   Todo e qualquer campo de texto ou número destinado a valores financeiros (preços, parcelas, débitos, descontos, KM) deve obrigatoriamente implementar a propriedade `onFocus={(e) => e.target.select()}` e aceitar estado inicial de string vazia (`''`). Isso garante que ao clicar ou tocar na caixa de entrada, o valor existente seja 100% selecionado para substituição direta instantânea sem atrito de ter que apagar zeros residuais.

### Regra 21: Padrão de Alto Contraste para Subformulários (Estilo Limpo)
*   Caixas e subgrupos de formulários (como Débitos e Documentação) não devem ser pintados com fundos escuros pesados (`bg-slate-900`/`bg-slate-950`). Devem utilizar fundo suave claro (`bg-slate-50/70`), contorno fino de 1px ("fio de cabelo" `border-slate-200`), rótulos em preto puro (`text-slate-900 font-bold`) e campos de texto em fundo branco puro (`bg-white`) com bordas bem delineadas, assegurando leitura perfeita em dispositivos móveis sob luz solar ou temas claros.

### Regra 22: Padronização Global de Inputs Monetários com `CurrencyInput`
*   Todos os campos que lidam com entrada de valores em Reais (BRL) devem utilizar o componente `CurrencyInput`. É estritamente proibido usar inputs nativos do tipo `number` para campos financeiros a fim de evitar flutuações acidentais ao utilizar o scroll do mouse e assegurar formatação automática na saída de campo (onBlur).

### Regra 23: Formatação Fiel e Segura do Padrão de Moeda Brasileiro (BRL)
*   A formatação de valores monetários para exibição deve utilizar uma lógica robusta e manual de formatação de strings baseada em regex e fatiamento numérico (como a função `formatToBRL`). Isso garante que a pontuação de milhar seja sempre um ponto (`.`) e a decimal seja sempre uma vírgula (`,`) (ex: `5.000,00`), neutralizando qualquer falha de suporte ou locale regional do navegador.

### Regra 24: Reset de Scroll Obrigatório em SPA
*   Toda navegação interna em Single Page Application (SPA), seja por troca de aba ou por seleção de detalhes de um veículo, deve resetar a rolagem vertical do container de conteúdo principal (`mainRef.current.scrollTop = 0`). Isso impede a persistência de scroll da listagem anterior e garante que o usuário sempre inicie no topo do novo formulário ou painel de detalhes.
