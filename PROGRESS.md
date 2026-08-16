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
