# PROGRESS - MestreMiudo

Log de execuções e ações autónomas do Bot no projeto MestreMiudo.

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
