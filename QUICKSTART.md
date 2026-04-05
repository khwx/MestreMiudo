# 🚀 Quick Start - MestreMiudo

## ⏱️ 3 Passos (3 minutos total)

### 1. Setup SQL no Supabase [2 min]

```bash
# Copie o link abaixo e abra no navegador:
https://supabase.com/dashboard/project/ppvftnxrpxxafarttyim/sql/new

# Ou siga manualmente:
1. Abra: https://supabase.com/dashboard
2. Selecione projeto
3. SQL Editor → New Query
4. Cole: todo o conteúdo de supabase-setup.sql
5. Clique: Run
```

**Dica:** Abra `setup-html.html` no navegador para facilitar a cópia do SQL!

### 2. Import Automático [30 seg]

```bash
node auto-import-lessons.mjs
```

Esperado: `✨ Importação concluída com sucesso!`

### 3. Teste [30 seg]

```bash
npm run dev
```

Abra: http://localhost:3000/dashboard/learn

---

## ✅ Verificação

Se vir isto, está tudo a funcionar:

- ✅ 3 disciplinas disponíveis (Português, Matemática, Estudo do Meio)
- ✅ Lições aparecem ao clicar numa disciplina
- ✅ Pode completar desafios
- ✅ Ganha ⭐ (0-3 stars) e 💰 (coins)
- ✅ Progresso guardado na base de dados

---

## 🆘 Problemas?

| Erro | Solução |
|------|---------|
| "Could not find table 'lessons'" | Execute o SQL na Supabase (passo 1) |
| Lições não aparecem | Verifique se import foi bem-sucedido |
| Build falha | `npm install` e tente novamente |

---

## 📚 Documentação Completa

- [SETUP.md](./SETUP.md) - Setup detalhado
- [docs/SETUP_DATABASE.md](./docs/SETUP_DATABASE.md) - Troubleshooting
- [docs/LEARNING_SYSTEM.md](./docs/LEARNING_SYSTEM.md) - Como funciona

---

## 🎯 Próximos Passos

**Depois do setup estar ok:**

```bash
# Expandir para Grade 2
node extract-curriculum.mjs português 2

# Ver análise
cat docs/curriculum-analysis/português_2_lessons.md
```

---

**Status:** ✅ Pronto para produção
