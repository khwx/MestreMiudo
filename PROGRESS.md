# PROGRESS - MestreMiudo

Log de execuções e ações autónomas do Bot no projeto MestreMiudo.

## 2026-08-22 - Notificações push (service worker) a lembrar revisão espaçada em falta

- **Contexto:** Faltava a tarefa pendente de avisar a criança (via service worker) quando há itens da revisão espaçada por rever, para combater o esquecimento.
- **Tarefa implementada:** Sistema de lembretes de revisão espaçada:
  1. Lógica pura e testável em `src/lib/review-reminder.ts` (`shouldShowReviewReminder` com cooldown de 6h; `buildReviewReminder` gera título/corpo pt-PT).
  2. Helper de cliente `src/lib/notification.ts` (`requestNotificationPermission`, `notificationsGranted`, `maybeNotifyReviewReminder`) que respeita permissão, cooldown (localStorage) e envia a notificação via service worker (`sw.controller.postMessage` → `REVIEW_REMINDER`), com fallback para a API `Notification`.
  3. `public/sw.js` — novo handler de mensagem `REVIEW_REMINDER` que mostra a notificação (`registration.showNotification`).
  4. `src/app/dashboard/client-page.tsx` — ao carregar `spacedStats`, chama `maybeNotifyReviewReminder(sr.due)`.
  5. `src/app/dashboard/review/page.tsx` — botão "Ativar lembretes" que pede permissão (gesto do utilizador) e reflete estado ativo/inativo.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 473 testes a passar (49 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Notificações/push (via service worker)" marcado como concluído).

## 2026-08-22 - Relatório PDF com detalhe por disciplina e evolução semanal

- **Contexto:** O relatório PDF existente (`src/lib/pdf-report.ts`) apenas mostrava estatísticas gerais (quizzes, média, pontos, streak) sem detalhar o desempenho por disciplina nem a evolução temporal, embora o painel de progresso já apresentasse esses dados visualmente.
- **Tarefa implementada:** Enriquecer o relatório PDF com:
  1. Secção "Desempenho por Disciplina" com barras de progresso coloridas (verde/amarelo/vermelho conforme média).
  2. Secção "Evolução Semanal" mostrando os últimos 7 dias com barras proporcionais à pontuação diária.
- **Alterações:**
  - `src/lib/pdf-report.ts` — tipos `SubjectAverage` e `DailyScore` adicionados ao `StudentProgress`; `buildReportDoc` expandido para renderizar ambas as secções com barras visuais (jsPDF `roundedRect`).
  - `src/app/dashboard/parent/page.tsx` — `handleGeneratePdf` e `handleSharePdf` passam agora `weeklyProgress` (já carregado via `getWeeklyProgress`) para o relatório.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 465 testes a passar (48 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Relatório PDF com detalhe por disciplina e evolução semanal" adicionado e marcado como concluído).

## 2026-08-21 - Objetivo diário de quizzes definível pelo encarregado

- **Contexto:** Faltava a tarefa pendente de permitir ao encarregado de educação definir um objetivo diário de quizzes e mostrar o progresso no painel. O histórico de quizzes já estava disponível no cliente (`getFullQuizHistory`).
- **Tarefa implementada:** Cartão "Objetivo de hoje" no painel que conta os quizzes feitos no dia, mostra uma barra de progresso (X/Y) e permite ao encarregado definir/editar o alvo diário (1-20). Ao atingir o alvo, surge mensagem de celebração.
- **Alterações:**
  - `supabase-setup.sql` — tabela `daily_goals` (student_name único, target_quizzes, updated_at) + índice e política RLS "Allow all".
  - `src/lib/daily-goal.ts` (novo) — funções puras: `getTodayDateStr`, `countQuizzesOnDate`, `getDailyGoalProgress`.
  - `src/app/actions/daily-goals.ts` (novo) — `getDailyGoalAction` (default 3) e `setDailyGoalAction` (upsert, limitado a 1-20).
  - `src/app/actions/index.ts` — exporta as novas ações.
  - `src/components/dashboard/DailyGoalCard.tsx` (novo) — cartão com barra de progresso e edição inline.
  - `src/app/dashboard/client-page.tsx` — carrega objetivo e quizzes de hoje (`Promise.all` + `countQuizzesOnDate`) e renderiza o `DailyGoalCard`.
  - `src/__tests__/daily-goal.test.ts` (novo) — 8 testes à lógica pura.
  - `src/__tests__/DailyGoalCard.test.tsx` (novo) — 4 testes ao componente (progresso, conquista, edição/guardar, validação).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 465 testes a passar (48 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Permitir ao encarregado definir um objetivo diário de quizzes" marcado como concluído).

## 2026-08-20 - Testes de componente (RTL) para o RecommendationsPanel

- **Contexto:** O painel de recomendações (`src/components/dashboard/RecommendationsPanel.tsx`) já estava a funcionar no painel, mas não tinha cobertura de testes de componente, ao contrário do motor de recomendações (`study-recommendations.ts`).
- **Tarefa implementada:** Adicionar testes de componente com React Testing Library cobrindo o `RecommendationsPanel`: ausência total (retorna null), cabeçalho, uma entrada por recomendação, ligações (`href`) corretas por ação (review/learn/quiz/challenge) com `name` e `grade`, e renderização das descrições.
- **Alterações:**
  - `src/__tests__/RecommendationsPanel.test.tsx` (novo) — 5 testes (renderização, lista de itens, links por ação, descrições, estado vazio).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 452 testes a passar (46 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Adicionar testes de componente ao RecommendationsPanel" marcado como concluído).

## 2026-08-20 - Recomendar a próxima lição concreta por completar no painel

- **Contexto:** O motor de recomendações já suportava `nextLessonTitle`, mas o painel nunca o calculava a partir do progresso real de lições da criança — o tipo `newLesson` ficava sempre vazio.
- **Tarefa implementada:** Ligar a recomendação "Próxima lição" ao progresso real, descobrindo a primeira lição (por disciplina e ordem) ainda não concluída para a grade da criança.
- **Alterações:**
  - `src/lib/lessons/next-lesson.ts` (novo) — funções puras: `getNextLesson` e `getNextLessonTitle`. Ordena por disciplina (Português → Matemática → Estudo do Meio) e, dentro de cada uma, por `lesson_index`; devolve `null` se não houver pendentes.
  - `src/app/actions/lessons.ts` — `getNextLessonAction(name, grade)` que cruza as lições da grade com as `lesson_completion` concluídas e aplica `getNextLesson`.
  - `src/app/actions/index.ts` — exporta `getNextLessonAction`.
  - `src/app/dashboard/client-page.tsx` — carrega `getNextLessonAction` no `Promise.all`, guarda `nextLessonTitle` em estado e passa-o a `buildRecommendations` (com dependência no `useMemo`).
  - `src/__tests__/next-lesson.test.ts` (novo) — 7 testes cobrindo ordem de disciplina, ordem dentro da disciplina, tudo concluído e lista vazia.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 447 testes a passar (45 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Recomendar a próxima lição concreta" marcado como concluído).

## 2026-08-20 - Sugestões de estudo personalizadas no painel (recomendações)

- **Contexto:** O painel (`dashboard`) já apresentava revisão espaçada, desafio diário e temas fracos em sítios distintos, mas faltava uma vista unificada e priorizada do "próximo passo" para a criança.
- **Tarefa implementada:** Adicionar um motor de recomendações de estudo que combina revisão espaçada (itens em falta), temas fracos (das respostas recentes), desafio diário e sequência (streak) numa lista ordenada por prioridade, e exibi-la no painel.
- **Alterações:**
  - `src/lib/study-recommendations.ts` (novo) — funções puras e determinísticas: `buildRecommendations`, `getWeakTopicsFromContext`, `getRecommendationGreeting`. Disponibiliza `StudyRecommendation` com tipo, título, descrição, prioridade e ação.
  - `src/components/dashboard/RecommendationsPanel.tsx` (novo) — painel "💡 Sugestões para ti" com ligações às áreas certas (revisão, quiz, lição, desafio) conforme a ação.
  - `src/app/dashboard/client-page.tsx` — cálculo (memo) das recomendações a partir do histórico recente, `spacedStats.due`, `streak` e `dailyChallengeStats`; painel inserido entre o progresso e a grelha de funcionalidades.
  - `src/lib/vocabulary.ts` — `getRandomVocabularyPairs` agora deduplica por palavra antes de baralhar, corrigindo um teste flaky de unicidade.
  - `src/__tests__/study-recommendations.test.ts` (novo) — 13 testes cobrindo priorização, temas fracos, desafio diário, streak e saudação.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 440 testes a passar (44 ficheiros).
- **Docs atualizados:** `TODO.md` (nova secção "Pendentes futuras" com melhorias propostas).

## 2026-08-19 - Suporte offline aprimorado (pré-carregamento de lições por grade)

- **Contexto:** O service worker (`public/sw.js`) existente apenas armazenava em cache as lições quando eram solicitadas; não havia um mecanismo proativo de pré-carregar dados de lições para todas as grades/subjects, o que limitava a experiência offline.
- **Tarefa implementada:** Adicionar um sistema de pré-carregamento proativo de lições no service worker, acionado quando o utilizador visita o ecrã "Aprender a Brincar".
- **Alterações:**
  - `src/lib/offline-preload.ts` (novo) — funções puras: `buildSupabaseLessonUrl`, `buildLessonPreloadUrls`, `isServiceWorkerReady`, `triggerLessonPreload` e `preloadAllLessons`; constantes `OFFLINE_SUBJECTS` (Português, Matemática, Estudo do Meio) e `OFFLINE_GRADES` (1-4).
  - `public/sw.js` — adicionado listener de `message` para a mensagem `PRELOAD_LESSONS` que fetcheia as URLs enviadas e armazena-as no cache `LESSON_CACHE`; envia mensagem de volta `PRELOAD_COMPLETE` aos clientes.
  - `src/app/dashboard/learn/page.tsx` — `useEffect` que chama `preloadAllLessons` quando o navegador tem service worker e está online.
  - `src/__tests__/offline-preload.test.ts` (novo) — 23 testes cobrindo URL building, codificação, SSR safety, e interações com o service worker.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 427 testes a passar (43 ficheiros).
- **Docs atualizados:** `TODO.md` (item "Suporte offline aprimorado" marcado como concluído).

## 2026-08-19 - Relatório PDF enviável/partilhável para encarregados

- **Contexto:** O relatório de progresso em PDF (`src/lib/pdf-report.ts`) só era descarregado localmente; faltava a possibilidade de o enviar/partilhar com os encarregados de educação (item pendente no TODO.md).
- **Tarefa implementada:** Tornar o relatório em PDF enviável/partilhável sem precisar de backend de email.
- **Alterações:**
  - `src/lib/pdf-report.ts` — refatorado para gerar o documento via `buildReportDoc` (assíncrono); adicionadas `generatePdfReportBlob`, `buildReportMailtoLink` e `sharePdfReport` (usa Web Share API com anexo de ficheiro, com fallback para `mailto:` quando indisponível).
  - `src/app/dashboard/parent/page.tsx` — novo botão "Enviar / Partilhar" (ícone `Share2`) junto ao "Exportar PDF".
  - `src/app/dashboard/teacher/page.tsx` — novo botão "Enviar / Partilhar PDF".
  - `src/__tests__/pdf-report.test.ts` — testes para `generatePdfReportBlob` e `buildReportMailtoLink` (total: 7 testes no ficheiro).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 404 testes a passar (42 ficheiros).
- **Nota:** O envio por email via servidor (SMTP/Resend) continua como melhoria futura; a implementação atual cobre partilha cliente (app de email no telemóvel/desktop via Web Share API e mailto).
- **Docs atualizados:** `TODO.md` (item "Relatório PDF enviável por email" marcado como concluído).

## 2026-08-19 - Sincronização do catálogo de conquistas (badges)

- **Contexto:** Existiam três sistemas de definição de badges com chaves duplicadas: `BADGE_DEFINITIONS` no BadgePopup (IDs legados como `primeiro_quiz`), `_BADGE_LIBRARY` no rewards.ts e `UNIFIED_BADGES` no badges.ts. O import não utilizado de `UNIFIED_BADGES` em `achievements.ts` gerava aviso de lint, e o `LEGACY_ID_MAP` em `badges.ts` tinha uma chave duplicada `streak_3`.
- **Tarefa implementada:** Unificar todas as definições de badges para usar o catálogo unificado em `badges.ts` como única fonte de verdade.
- **Alterações:**
  - `src/lib/achievements.ts` — removido import não utilizado de `UNIFIED_BADGES`.
  - `src/lib/badges.ts` — removida chave duplicada `streak_3` do `LEGACY_ID_MAP`.
  - `src/components/BadgePopup/index.tsx` — substituídas definições hardcoded por `getBadgePopupDefinitions()` do catálogo unificado.
  - `src/components/Quiz.tsx` — substituído `BADGE_DEFINITIONS['primeiro_quiz']` e `['perfeicao']` por `getBadgeByAnyId('first_quiz')` e `getBadgeByAnyId('perfect_score')` com IDs unificados.
  - `src/__tests__/BadgePopup.test.tsx` — atualizados IDs nos testes para usar chaves unificadas.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 390 testes a passar (41 ficheiros).
- **Docs atualizados:** `TODO.md` (item concluído).

## 2026-08-19 - Navegação por teclado (setas) nos jogos educativos

- **Contexto:** Os três jogos (Jogo da Memória, Jogo do Galo e Jogo da Forca) usavam `<button>` nativos (Enter/Espaço funcionavam) mas não tinham navegação por setas entre células, dificultando o uso por teclado para crianças que dependem de acessibilidade.
- **Tarefa implementada:** Adicionar navegação por teclado completa (roving tabindex + setas + Home/End) a todos os jogos, com contentores `role="grid"` e ARIA adequado.
- **Alterações:**
  - `src/lib/game-utils.ts` — nova função pura `getGridNavigationIndex` e constante `GRID_NAVIGATION_KEYS` (reutilizável e testável).
  - `src/components/MemoryGame.tsx` — grelha 4 colunas com foco por setas; `Card` passa `ref`, `tabIndex` e `onFocus`.
  - `src/components/TicTacToe.tsx` — grelha 3x3 com foco por setas; `Square` deixou de usar `disabled` (o `onClick` já protege) para manter todas as casas focáveis.
  - `src/components/HangmanGameImproved.tsx` — teclado de letras (7 colunas) com foco por setas via estado interno do componente `Keyboard`.
  - `src/__tests__/game-utils.test.ts` — testes unitários de `getGridNavigationIndex` (bordas, linha parcial, grelha vazia).
  - `src/__tests__/keyboard-navigation.test.tsx` — testes de componente confirmando a movimentação de foco no galo e na memória.
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 393 testes a passar (43 ficheiros).
- **Docs atualizados:** `TODO.md` (itens "Acessibilidade nos jogos", "testes unitários", "Praticar temas fracos" e "CSV" marcados como concluídos; nota de nova funcionalidade na secção Completed).

## 2026-08-17 - Wire-up eliminação de histórias na galeria

- **Contexto:** O projecto tinha uma ação de servidor `deleteStory` (em `src/app/actions/stories.ts`) mas não estava exportada no barrel `src/app/actions/index.ts` e a UI da galeria de histórias não tinha forma de eliminar histórias.
- **Tarefa implementada:** Expor `deleteStory` na barrel e adicionar um diálogo de confirmação de eliminação na galeria de histórias (`src/app/dashboard/story-gallery/client-page.tsx`), com actualização optimista da lista e feedback via toast.
- **Novo componente:** `src/components/DeleteStoryDialog.tsx` — diálogo reutilizável (Radix AlertDialog) que confirma a eliminação, mostra estado de "a eliminar", devolve toast de sucesso/erro e notifica o pai via `onDeleted`.
- **Testes:** `src/__tests__/stories.test.ts` (3 testes) — verifica caminho de sucesso, erro de BD e ramo "supabase não configurado".
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 336 testes a passar (35 ficheiros).
- **Decisões:**
  - Optou-se por um componente separado `DeleteStoryDialog` para reutilização futura e para manter a página de galeria enxuta, seguindo o padrão da codebase.
  - Em modo lista, o botão de eliminar usa `stopPropagation` para não abrir o detalhe da história (o card inteiro abre o detalhe).
  - Em modo detalhe, após eliminar, volta para a lista.
- **Docs atualizados:** `TODO.md` (item concluído + data), `PROJECT_STATUS.md` (galeria de histórias e tratamento de erros marcados como concluídos).

## 2026-08-17 - Melhoria contínua: botão "Dica" nos quizzes

- **Contexto:** As perguntas do quiz não ofereciam apoio adicional para as crianças que têm dificuldade em responder, apesar de o blueprint enfatizar suporte a diferentes estilos de aprendizagem.
- **Tarefa implementada:** Adicionar um botão "Dica" (💡) às perguntas do quiz que revela uma pista amigável. Quando a pergunta já traz uma `hint` explícita (campo agora opcional no schema), esta é usada; caso contrário, `lib/hint.ts` deriva uma pista a partir das opções e da resposta correta (revela a primeira letra e elimina uma opção errada).
- **Alterações:**
  - `src/app/shared-schemas.ts` — campo `hint` opcional adicionado ao schema de saída do quiz e ao tipo `QuizQuestion`.
  - `src/lib/hint.ts` (novo) — helper `generateHint` com lógica de derivação e testes.
  - `src/components/QuizQuestion.tsx` — botão de dica com toggle, acessível (`aria-pressed`, `aria-label`), anúncio via `announceToScreenReader` e callout visual.
  - `src/__tests__/hint.test.ts` (novo, 5 testes).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 341 testes a passar (36 ficheiros).
- **Docs atualizados:** `TODO.md` (item concluído), `PROJECT_STATUS.md` (aprendizagem + gamificação 65%).

## 2026-08-18 - Melhoria de áudio: seleção de voz europeia (pt-PT) no quiz

- **Contexto:** O botão de áudio do quiz (`src/components/Quiz.tsx`) reproduzia a pergunta com `utterance.lang = 'pt-PT'` mas não escolhia uma voz concreta, pelo que em muitos sistemas o browser usava a voz por omissão (frequentemente inglês ou pt-BR), prejudicando o suporte auditivo das crianças portuguesas.
- **Tarefa implementada:** Criar um helper de seleção de voz e aplicá-lo na reprodução do quiz.
  - `src/lib/tts-voice.ts` (novo) — `selectPortugueseVoice` (prefere pt-PT sobre pt-BR) e `applyPortugueseVoice`.
  - `src/components/Quiz.tsx` — `handleAudioPlayback` agora resolve a melhor voz portuguesa via `window.speechSynthesis.getVoices()` antes de falar.
  - `src/__tests__/tts-voice.test.ts` (novo, 10 testes).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 351 testes a passar.
- **Decisões:**
  - Helper mantido puro e testável (recebe a lista de vozes), para poder ser reutilizado também na oficina de histórias numa fase futura (ver lista de pendências no TODO.md).
  - Degradação graciosa: se não existir voz portuguesa, mantém só o `lang`, sem quebrar a reprodução.
- **Docs atualizados:** `TODO.md` (lista de melhorias pendentes repovoado, incluindo alargar a voz pt-PT a todos os recursos de áudio).

## 2026-08-18 - Melhoria contínua: modo "Praticar perguntas erradas" no quiz

- **Contexto:** Ao terminar um quiz, as crianças não tinham forma de reforçar exatamente as perguntas que erraram, apesar de o blueprint enfatizar apoio à aprendizagem. O item pendente "Permitir regenerar apenas uma pergunta incorreta no final do quiz" motivou esta melhoria (implementada como prática local das perguntas erradas, sem depender de regeneração por IA).
- **Tarefa implementada:** Adicionar um botão "Praticar N que erraste" aos resultados do quiz que, quando há respostas erradas, reinicia o quiz apresentando apenas as perguntas incorretas. No modo de prática não se re-guardam pontos nem conquistas (apenas reforço).
  - `src/lib/quiz-practice.ts` (novo) — helpers puros `getWrongQuestions` (filtra as perguntas erradas por texto) e `hasWrongAnswers`.
  - `src/components/Quiz.tsx` — estado `practiceMode`, handler `handlePracticeWrong` e lógica em `handleNext`/`handleRestart` para não guardar resultados em modo de prática.
  - `src/components/QuizResults.tsx` — botão condicional de prática e título "Prática Concluída!" em modo de prática.
  - `src/__tests__/quiz-practice.test.ts` (novo, 6 testes).
- **Validação:** `npm run lint` ✓, `npm run typecheck` ✓, `npx vitest run` → 355 testes a passar.
- **Decisões:**
  - Optou-se por praticar as mesmas perguntas erradas (reforço imediato e determinístico) em vez de regenerar novas via IA, por simplicidade, fiabilidade e para não consumir chamadas de API.
  - A correspondência pergunta→erro é feita por texto da pergunta, mantendo a ordem original e suportando fontes distintas (quiz gerado vs. respostas registadas).
- **Docs atualizados:** `TODO.md` (nova funcionalidade em concluídos; itens de voz pt-PT e banco de Estudo do Meio G3-G4 marcados como concluídos após verificação).
