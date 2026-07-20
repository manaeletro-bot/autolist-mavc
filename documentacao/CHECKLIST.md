# 🔳 Checklist de Qualidade (QA)

Roteiro de testes de regressão antes de entregas ou encerramentos de milestones.

## Testes de Interface (Responsividade e Estética)
- [x] O título no topo do sistema está correto como "AUTOLIST - MAVC" e possui o subtítulo "Inspeção Veicular & Gestão Financeira"?
- [x] Não há referências remanescentes ao termo "Bosch" ou imagens correlatas?
- [x] O menu sanduíche mobile abre deslizando a partir do lado direito?
- [x] Não há opções duplicadas no menu lateral (a opção "Novo Veículo" foi devidamente removida)?
- [x] A tela do Dashboard está livre de barras de rolagem horizontais em telas menores?
- [x] Os KPIs financeiros da empresa aparecem estritamente na seção "Financeiro" e estão ocultos no Dashboard inicial?

## Testes de Funcionalidade de Veículos
- [x] O formulário de cadastro permite selecionar e salvar todos os tipos de combustíveis (Flex, Gasolina, Diesel, 100% Elétrico, Híbrido, Outros)?
- [x] O campo de combustível aparece corretamente na ficha técnica sob a seção de especificações técnicas do veículo?
- [x] A busca inteligente localiza veículos corretamente por modelo, placa, chassi, proprietários e combustíveis (ex: digitar "diesel" ou "híbrido")?
- [x] Não é possível excluir veículos a partir dos cards do Dashboard? O botão vermelho de exclusão está disponível apenas dentro dos detalhes do veículo?

## Testes de Acordeão (Menu Sanfona)
- [x] Ao clicar em um veículo, os detalhes do veículo são apresentados em um menu sanfona vertical?
- [x] O painel "Resumo & Finanças" inicia aberto por padrão?
- [x] Ao abrir outra aba (como "Checklist Vistoria"), a anterior é devidamente fechada?
- [x] As categorias dentro do Checklist de Vistoria estão organizadas em uma sanfona vertical, sem qualquer barra de rolagem horizontal para troca de abas?
- [x] Ao carregar a aba de Checklist, TODAS as categorias e subcategorias iniciam 100% recolhidas?
- [x] A lógica de exclusão mútua das sanfonas funciona corretamente tanto para categorias quanto para subcategorias (abrir uma fecha as outras)?
- [x] A alternância de categorias principais fecha automaticamente qualquer subcategoria que tenha sido deixada aberta em outra categoria?

## Testes de Exportação
- [x] Ao clicar em "Baixar Dados" na tela de detalhes do veículo, abre a modal de opções?
- [x] A exportação funciona tanto para PDF quanto para TXT?
- [x] A exportação com "Somente Preço de Venda" omite informações de compra e custos internos, enquanto a exportação "Completa" traz toda a DRE?

## Testes de Imagens e Contadores (V1.4)
- [x] O formulário de cadastro e a aba de fotos suportam até 12 slots de imagens?
- [x] Veículos de teste carregam com 10 imagens reais de alta resolução provenientes do Unsplash?
- [x] Imagens vindas de links externos (HTTP/HTTPS) são renderizadas perfeitamente tanto no Dashboard quanto na galeria interna?
- [x] Cabeçalhos de categorias e subcategorias exibem contadores dinâmicos de progresso atualizados em tempo real no formato `X / Y` (ex: `2 / 23`)?

## Testes de Checklist Dinâmico (V1.5)
- [x] Ao clicar em "Adicionar Nova Categoria" no fim da lista, abre o formulário em linha e cria a categoria corretamente?
- [x] Ao clicar em "Adicionar Nova Subcategoria" no final das subcategorias de uma categoria, cria a subcategoria corretamente?
- [x] Ao clicar em "Adicionar Item de Verificação" no final dos itens de uma subcategoria, cria o item corretamente?
- [x] Ao clicar em ocultar (ícone EyeOff) em um item de verificação, ele é removido da visualização normal?
- [x] Os contadores de progresso e estatísticas de vistoria são decrementados quando um item é ocultado?
- [x] O item ocultado aparece na categoria especial "Itens Ocultados" ao final da lista?
- [x] Ao expandir a categoria "Itens Ocultados" e clicar em "Exibir" em um item, ele retorna para a subcategoria e categoria original com seu status/anotações intactos?
- [x] O botão "Restaurar Padrão" redefine a estrutura para as categorias estáticas iniciais do projeto?

## Testes de PWA (V1.6)
- [x] O arquivo `manifest.json` está presente na pasta `public/` (e após o build na pasta `dist/`)?
- [x] Os ícones de 192px, 512px e favicon gerados a partir de `image/ICOM.png` estão corretos e referenciados no manifesto?
- [x] O Service Worker (`sw.js`) está registrado com sucesso no console do navegador ao acessar o site?
- [x] A cor de tema (#0ea5e9) e metatags para suporte standalone em aparelhos iOS estão integradas no `index.html`?
- [x] O aplicativo é detectado como instalável (aparece ícone de "+" ou instalar no menu do navegador)?
- [x] O Service Worker intercepta requisições de assets estáticos aplicando cache, porém ignora e faz bypass das requisições de API (`/api/*`)?

## Testes de Integração Checklist-Reparos (V1.7)
- [x] Marcar um item do checklist como "Defeito" (FAIL) cria automaticamente um novo item de reparo pendente com valor de R$ 0,00?
- [x] Corrigir o item marcado anteriormente no checklist (mudando para OK ou NA) remove automaticamente o reparo zerado associado?
- [x] A sincronização do estado ocorre de forma atômica e não sobrescreve os valores digitados manualmente para outros reparos já existentes?

## Testes de Compressão de Imagens e Infraestrutura (V1.8)
- [x] Ao carregar uma foto no formulário de cadastro ou na galeria interna, são exibidos seletores de Resolução e Qualidade?
- [x] O painel calcula e exibe em tempo real o tamanho em KB/MB ocupado por cada imagem no formato base64?
- [x] A rota `/api/keep-alive` responde com sucesso e realiza o ping seguro ao banco de dados utilizando a chave secreta de autorização?

## Testes de Débitos e Custos de Documentação (V1.9)
- [x] É possível preencher valores para Quitação, Multas, Documentação e Outras Despesas no cadastro e na modal financeira?
- [x] O valor do Investimento Total na simulação e na aba de detalhes soma corretamente todos os débitos e reparos ao preço de compra?
- [x] O Lucro Alvo e o Lucro Mínimo Assegurado (com base no desconto máximo) decrescem corretamente conforme novos débitos são inseridos?
- [x] Os detalhes das despesas adicionais são exibidos de forma identada/agrupada na DRE e nas Condições de Aquisição (Compra)?

## Testes de Lançamento e Infraestrutura Nuvem (V2.0)
- [x] O título e marca do sistema no topo exibe "AUTOLIST - MAVC"?
- [x] O repositório no GitHub está no ar sob `manaeletro-bot/autolist-mavc`?
- [x] O projeto na Vercel compila e responde na URL de produção `https://autolist-mavc.vercel.app`?
- [x] O Supabase Cloud possui a tabela `vehicles` criada com RLS ativo e permissões de SELECT/INSERT/UPDATE/DELETE?
- [x] O arquivo `CREDENCIAIS_ACESSO.md` está ignorado pelo `.gitignore` e não foi enviado no commit do GitHub?

## Testes de UX Mobile, Integridade de Mídia e Cabeçalho Dinâmico (V2.1)
- [x] Os cards de veículo no Dashboard exibem o badge de Cor, o Preço de Resumo e são 100% clicáveis sem dependência do botão "Ver"?
- [x] Os subtítulos de seções sanfona em `VehicleDetails.jsx` não são cortados no celular, realizando a quebra com `break-words leading-tight`?
- [x] Ao entrar nos detalhes de um veículo no mobile, o botão de voltar e os dados de Marca, Placa e Modelo assumem o topo fixo em `Layout.jsx`?
- [x] Os botões de ação (`Vender`, `Baixar`, `Excluir`) sobem para a primeira linha do conteúdo de detalhes no mobile, aproveitando a área útil da tela?
- [x] Todas as fotos de teste da pasta local `public/images/` para os 6 veículos estão formatadas no aspecto landscape 16:9 (`1280x720`) sem cortes indesejados de `object-cover`?

## Testes de Controle de Assinatura, Expiração e Design iOS 18 (V2.3)
- [x] Todo novo lojista recebe automaticamente o prazo de teste de 2 dias (`test_2d`) no cadastro?
- [x] Contas expiradas ou suspensas exibem a modal de bloqueio `SubscriptionLockModal.jsx` impedindo a navegação e acesso ao estoque?
- [x] O botão de renovação no WhatsApp redireciona para `+55 (62) 99404-9949` com mensagem pré-preenchida contendo os dados do lojista e da revenda?
- [x] A modal de bloqueio utiliza a estética **iOS 18 Glassmorphism Dark** (`bg-zinc-950/80 backdrop-blur-3xl`, brilhos neon e textos em branco puro `#FFFFFF`)?
- [x] A classe `.lock-mode` é aplicada ao `body` durante a modal, isolando e prevenindo qualquer sobreposição de cores de tema claro?
- [x] Em telas pequenas e dispositivos móveis, a modal de bloqueio possui suporte completo à rolagem vertical suave (`max-h-[90vh] overflow-y-auto scrollbar-thin`) sem cortar nenhum elemento visual ou botão de ação?
- [x] O atalho `🔴 Ver Expirado` na modal de login permite testar instantaneamente o comportamento da tela de bloqueio localmente?



