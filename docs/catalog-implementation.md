# RAVERA — catálogo e orçamento personalizado

A Landing 3 permanece em `/`, com o alias `/landing3/`. A vitrine `#catalogo`, em `src/site/catalog/CatalogSection.tsx`, continua entre “A origem” e “Coleção”, na posição da antiga seção “Eternização”. A seção “Monte seu pedido” foi retirada integralmente do final da homepage, onde ficava em `#encomenda`, depois de `#pecas` e antes do rodapé. Os links de encomenda agora abrem o catálogo, e o espaçamento final foi ajustado.

O catálogo e os cinco detalhes mantêm `/prototipos/catalogo/` e `/prototipos/catalogo/<slug>/`. Logo, cabeçalho, navegação, rodapé, fontes, tokens, botões e animações são compartilhados com a Landing 3. A folha, a história opcional e o orçamento pertencem exclusivamente ao catálogo. Landing 1, Landing 2 e suas cópias históricas permanecem intactas.

## Atualização do Direct — outubro de 2026

Arquivos modificados: `src/site/shared/contact.ts`, `src/site/catalog/catalogQuote.ts`, `src/site/catalog/useCatalogQuote.ts`, `src/site/catalog/SelectionDrawer.tsx`, `src/site/catalog/catalog.css`, `tests/catalog-state.test.mjs`, `tests/catalog-render.test.mjs`, `tests/catalog-browser.mjs`, `README.md` e este documento.

Arquivos criados: `src/site/catalog/copyMessageToClipboard.ts`, `src/site/catalog/openInstagramDirect.ts`, `src/site/catalog/CopyStatusToast.tsx`, `src/site/catalog/ManualCopyDialog.tsx` e `tests/catalog-flow-fixture.tsx`. Nenhuma dependência do projeto foi adicionada. A fixture não é importada pelo site nem incluída no build.

O estado, a folha, os dados do catálogo, o armazenamento e as Landing 1 e 2 mantêm a implementação anterior. O texto estático de orçamento foi substituído pela ação “Solicitar orçamento pelo Instagram”.

## Arquivos da integração anterior de orçamento

Criados:

- `src/site/shared/contact.ts`
- `src/site/catalog/catalogQuote.ts`
- `src/site/catalog/useCatalogQuote.ts`
- `src/site/catalog/SelectionClearAction.tsx`

Modificados:

- `src/site/landing3/LandingThree.tsx`
- `src/site/landing3/content.ts`
- `src/site/landing3/landing3.css`
- `src/site/shared/SiteHeader.tsx`
- `src/site/shared/SiteFooter.tsx`
- `src/site/shared/navigation.ts`
- `src/site/catalog/CatalogPage.tsx`
- `src/site/catalog/CatalogSelectionProvider.tsx`
- `src/site/catalog/ProductCard.tsx`
- `src/site/catalog/SelectionAction.tsx`
- `src/site/catalog/SelectionDrawer.tsx`
- `src/site/catalog/SelectionItem.tsx`
- `src/site/catalog/SelectionLeafButton.tsx`
- `src/site/catalog/catalogData.ts`
- `src/site/catalog/catalogTypes.ts`
- `src/site/catalog/catalogSelectionContext.ts`
- `src/site/catalog/catalogSelectionReducer.ts`
- `src/site/catalog/catalogStorage.ts`
- `src/site/catalog/catalog.css`
- `tests/catalog-state.test.mjs`
- `tests/catalog-render.test.mjs`
- `tests/catalog-browser.mjs`
- `README.md`
- `docs/catalog-implementation.md`

Nenhum arquivo removido. O formulário antigo, seus estados, validações, eventos, textos, estilos, passos e âncora foram removidos dos arquivos acima. Imagens usadas por conteúdo aprovado permanecem disponíveis.

## Arquivos da integração inicial do catálogo

Além dos arquivos acima, a primeira integração criou `CatalogSection.tsx`, `CatalogImage.tsx`, `LeafIcon.tsx` e `catalogRoutes.ts` em `src/site/catalog/`, e `RaveraLogo.tsx` e `useSectionReveal.ts` em `src/site/shared/`. Também criou os demais componentes, dados, estado, estilos e testes do catálogo que agora foram atualizados.

A primeira integração modificou `src/App.tsx`, `package.json` e as seis entradas HTML: `prototipos/catalogo/index.html`, `prototipos/catalogo/memoria-em-flor/index.html`, `prototipos/catalogo/curva-da-materia/index.html`, `prototipos/catalogo/geometria-quieta/index.html`, `prototipos/catalogo/relicario-de-mesa/index.html` e `prototipos/catalogo/essencia-ravera/index.html`. A rota existente passou a carregar o catálogo oficial, com títulos correspondentes e sem `noindex`; comandos de teste foram adicionados sem novas dependências. Esses arquivos não precisaram de alterações adicionais no fluxo de orçamento.

## Seleção e sessão

`sessionStorage` usa `ravera:catalog-selection:v2`:

```json
{
  "selectedProductIds": ["memoria-em-flor", "curva-da-materia"],
  "story": "Minha história opcional."
}
```

Cada ID existe no catálogo e aparece uma única vez. Adicionar novamente é uma operação idempotente; o botão “Selecionado” permite remover a peça. A folha conta produtos distintos. Não há preços, cálculos monetários ou controles de quantidade.

Após montar o cliente, a seleção é validada e restaurada. Recargas, navegação interna, desmontagem, fechamento do painel e abertura do contato preservam peças e história. Fora do catálogo, os controles não são montados. A aba tem sua própria sessão; encerrar a aba ou remover os dados armazenados elimina a seleção naturalmente. Remover uma peça preserva as outras e a história. “Limpar seleção”, com confirmação inline, remove tudo e as chaves de armazenamento.

O formato `ravera:catalog-selection:v1` é migrado extraindo os IDs válidos, descartando quantidades e duplicatas. A chave antiga só é retirada após salvar o novo formato. JSON corrompido, IDs inexistentes, histórias de tipo inválido, quota e armazenamento negado são tratados. Sem armazenamento, os controles funcionam em memória e o painel informa a limitação.

“Conte sua história” é opcional, aceita múltiplas linhas e não tem limite de caracteres. O texto bruto é preservado integralmente na sessão. Ao gerar a mensagem, espaços nas extremidades são retirados; linhas internas são mantidas. Texto contendo somente espaços não gera a seção “Minha história”.

## Canal e mensagem

`src/site/shared/contact.ts` centraliza o contato já existente: Instagram `@ravera.designn`, conversa `https://ig.me/m/ravera.designn`. O número oficial de WhatsApp está vazio no projeto.

“Solicitar orçamento pelo Instagram” só é habilitado quando existe pelo menos uma peça com nome válido e o Direct oficial está configurado. A história sozinha não habilita o botão. `buildQuoteMessage`, em `src/site/catalog/catalogQuote.ts`, é uma função pura: remove nomes vazios e duplicados, preserva a ordem de seleção e monta a estrutura em português solicitada com a história significativa. A geração ocorre no clique e usa os dados mais recentes. Nenhum preço, quantidade, ID ou caminho de arquivo entra no texto. Não existe envio automático.

`copyMessageToClipboard.ts` usa `navigator.clipboard.writeText(message)` durante o clique. Sem suporte ou com permissão negada, tenta `document.execCommand('copy')` com uma textarea readonly, fora do layout e dentro do modal ativo para evitar a inércia de elementos externos ao diálogo. O elemento contém a mensagem completa, permite seleção e é removido em `finally`; foco e seleção anteriores são restaurados quando possível. As duas tentativas retornam sucesso ou falha explicitamente.

`openInstagramDirect.ts` reserva `about:blank` sincronicamente no clique e remove `opener` imediatamente. A cópia começa antes da reserva para aproveitar o foco da página original. A navegação só ocorre após confirmar a cópia, usando um link na própria aba vazia com `rel="noopener noreferrer"` e política `no-referrer`. A referência à aba permite distinguir bloqueio de popup de um retorno `null` causado pelas opções de isolamento de `window.open`. Instagram não é inspecionado nem manipulado; nenhum parâmetro de mensagem é adicionado à URL.

O hook bloqueia cliques concorrentes com uma ref e expõe `aria-busy` no botão. O botão também ignora o segundo evento de um clique duplo, mesmo se a cópia anterior já tiver terminado. A largura e o rótulo não mudam. Desmontagem fecha a aba reservada e invalida callbacks pendentes. Depois de sucesso, um aviso na área rolável do painel desaparece em dez segundos, também pode ser fechado manualmente e nunca sobrepõe o rodapé com a ação principal. Após bloqueio de popup, o aviso e “Abrir Direct do Instagram” permanecem disponíveis até serem dispensados. Após falha completa de cópia, a aba vazia é fechada e um segundo diálogo modal mostra o texto completo, selecionável, um botão de cópia e um link separado. A cópia manual nunca abre o Instagram automaticamente.

Textos implementados:

| Estado | Texto exato |
| --- | --- |
| Sucesso | Sua seleção foi copiada! O Instagram será aberto. Cole no Direct usando Ctrl+V ou ⌘V no computador, ou tocando e segurando para colar no celular. |
| Popup bloqueado | Sua seleção foi copiada, mas o navegador bloqueou a abertura do Instagram. |
| Falha automática | Não foi possível copiar automaticamente. Copie a mensagem abaixo e depois abra o Direct do Instagram. |
| Cópia manual confirmada | Mensagem copiada! Abra o Direct do Instagram e cole usando Ctrl+V ou ⌘V no computador, ou tocando e segurando para colar no celular. |
| Cópia manual indisponível | Não foi possível copiar. Selecione o texto abaixo, copie pelo menu do navegador ou usando Ctrl+C ou ⌘C e depois cole no Direct do Instagram. |
| Sem peças | Selecione pelo menos uma peça para enviar sua solicitação. |
| Sem configuração | O Direct do Instagram está indisponível. Tente novamente mais tarde. |

Configuração ausente também produz em desenvolvimento: `RAVERA: configure o Direct oficial em src/site/shared/contact.ts.` O cliente cola e envia a mensagem na conversa. A seleção e a história continuam disponíveis para edição e nova solicitação.

O helper anterior do WhatsApp continua no contato compartilhado; esta ação usa exclusivamente o Direct oficial do Instagram.

## Acessibilidade e responsividade

Diálogo modal nativo com título programático, foco inicial, contenção de foco incluindo textareas, Escape, retorno à folha, bloqueio de rolagem e avisos `aria-live`. Botões de seleção usam `aria-pressed` e um símbolo de confirmação; o estado não depende apenas de cor. A história tem label e descrição explícitos; a ação desabilitada explica a exigência de uma peça.

O diálogo de cópia manual recebe foco na textarea, começando pelo início da mensagem. Escape fecha apenas esse diálogo e devolve o foco à ação do Instagram. A contenção de foco do painel principal ignora o diálogo manual fechado. Avisos de cópia usam `role="status"`, `aria-live="polite"` e `aria-atomic="true"`. O aviso temporário não recebe foco automaticamente. Botões e links mantêm alvos de toque de pelo menos 44 px, contornos de foco em vinho e as animações são removidas com `prefers-reduced-motion`.

O painel fica na lateral em desktop e ocupa a largura disponível em mobile. Conteúdo rola independentemente; cabeçalho e orçamento permanecem acessíveis. Safe areas e `visualViewport` ajustam a altura quando o teclado reduz a área visível. Controles têm pelo menos 44 px de altura; movimento reduzido remove as animações.

## Verificações concluídas

- `npm.cmd run build`: TypeScript e build de produção passaram.
- `node node_modules/typescript/bin/tsc -b --pretty false`: checagem independente passou.
- `npm.cmd run lint`: sem erros ou avisos.
- `npm.cmd test`: 18 testes de estado, migração, sessão, mensagem, codificação e renderização no servidor, incluindo catálogo vazio, metadados opcionais e nomes ausentes ou duplicados.
- `npm.cmd run test:browser`: 24 grupos de cenários no Chrome em desenvolvimento com `RAVERA_TEST_DEV_MODULES=1`, e 22 no Edge com o build de produção servido por `npm.cmd run preview -- --host 127.0.0.1 --port 4174`. Cobrem seleção, história, orçamento, navegação, arquivos históricos, recarga, migração, limpeza, foco, teclado, viewport curto, imagem ausente, storage/clipboard/popup bloqueados, clique duplo, carregamento, configuração ausente, desmontagem pendente e aba nova. Cópia nativa, alternativa legada e popup real são verificados; a resposta do destino é interceptada e nenhuma solicitação chega à loja.
- Capturas e verificação de overflow em 320, 375, 430, 768, 1024 e 1440 px. Redimensionamento de teclado é simulado via `visualViewport`; não substitui teste em um aparelho físico.
- `git diff --check`: convenções e espaços; o projeto não tem formatter configurado.
- `git diff --name-only -- src/alternatives archive prototipos/landing1 prototipos/landing2`: confirma preservação dos arquivos históricos.
- Nenhum erro ou aviso da aplicação. O acesso às fontes externas Cormorant Garamond e Jost foi bloqueado pela sandbox (`net::ERR_NETWORK_ACCESS_DENIED`); essa dependência preexistente é registrada separadamente nos relatórios. Capturas de desktop, tablet, mobile, história, aviso e diálogo manual revisadas visualmente com as fontes de fallback.

Os relatórios JSON e capturas desta atualização ficam em `%TEMP%/ravera-instagram-qa-dev-chrome/` e `%TEMP%/ravera-instagram-qa-production-edge/`.

## Limitações reais

O catálogo inicial não fornece categorias associadas aos cinco produtos, pesquisa ou filtros; nenhum foi inventado. Nomes, resumos, materiais e dimensões existentes foram preservados, com fotografias WebP disponíveis no projeto. Descrições com `Lorem ipsum` não são publicadas. O Instagram exige colar manualmente a mensagem; nenhum número de WhatsApp ou endereço de email foi criado.
