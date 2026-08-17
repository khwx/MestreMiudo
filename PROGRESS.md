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
