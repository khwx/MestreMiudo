# 📊 Setup da Base de Dados - MestreMiudo

## Status Atual

❌ **Tabelas de lições não existem ainda na base de dados Supabase**

As tabelas necessárias para o sistema "Aprender a Brincar" precisam ser criadas manualmente no Supabase.

## ✅ Passo 1: Criar as Tabelas SQL

### Opção A: Via Supabase Dashboard (Recomendado - 2 minutos)

1. Abra [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto **MestreMiudo**
3. Vá para **SQL Editor** → **New Query**
4. Copie e cole **TODO** o conteúdo de `supabase-setup.sql`
5. Clique em **Run** (botão verde)
6. Aguarde a mensagem de sucesso ✅

### Opção B: Via Terminal (Requer Supabase CLI)

```bash
# Instalar Supabase CLI se não tiver
npm install -g supabase

# Login
supabase login

# Push migrations
cd MestreMiudo
supabase db push
```

## ✅ Passo 2: Importar Lições de Exemplo

Depois das tabelas serem criadas, execute:

```bash
# No diretório MestreMiudo
node import-lessons.mjs
```

Esperado:
```
📚 Importar Lições de Exemplo - MestreMiudo

Lições a importar: 16
Desafios a importar: 3

🔄 Inserindo lições...
✅ 16 lições inseridas com sucesso!

🔄 Inserindo desafios...
✅ 3 desafios inseridos com sucesso!

✨ Importação concluída!
```

## ✅ Passo 3: Testar o Sistema

```bash
# Iniciar servidor
npm run dev

# Abra no navegador
http://localhost:3000/dashboard/learn
```

Esperado:
- Ver 3 disciplinas: "Português", "Matemática", "Estudo do Meio"
- Clicar numa disciplina e ver lições aparecerem
- Clicar numa lição e ver desafios

## 📋 Tabelas Criadas

| Tabela | Descrição | Registos |
|--------|-----------|----------|
| `lessons` | Lições principais | 16 |
| `lesson_challenges` | Desafios dentro de lições | ~40 |
| `lesson_completion` | Progresso do aluno | (vazio até primeiro uso) |

## 🐛 Troubleshooting

### Erro: "Could not find the table 'public.lessons'"

**Causa:** Tabelas ainda não foram criadas

**Solução:** Execute o SQL em `supabase-setup.sql` (Passo 1)

### Erro ao importar lições: "Permission denied"

**Causa:** Políticas RLS não estão permitindo acesso

**Solução:** Verifique se o SQL foi executado completamente (inclui CREATE POLICY)

### Lições aparecem mas sem desafios

**Causa:** Campo `challenges` no JSON está vazio ou mal formatado

**Solução:** Verifique `docs/sample-lessons.json` estrutura

## 📚 Estrutura do sample-lessons.json

```json
{
  "lessons": [
    {
      "subject": "Português",
      "grade_level": 1,
      "title": "As Vogais",
      "description": "...",
      "learning_objective": "...",
      "story_context": "...",
      "lesson_index": 1,
      "difficulty": "easy"
    }
  ],
  "challenges": [
    {
      "lesson_id": "UUID_DA_LIÇÃO",
      "challenge_index": 1,
      "challenge_type": "multiple_choice",
      "question": "...",
      "content": {
        "options": [...],
        "correct": "..."
      }
    }
  ]
}
```

## 🚀 Próximos Passos

Depois de completar este setup:

1. **Expandir Lições** - Use `extract-curriculum.mjs` para analisar o currículo e criar mais lições
2. **Testar Completo** - Completar uma lição e verificar stars/coins/progresso
3. **Adicionar Imagens** - As lições já têm suporte a integração Pixabay
4. **Implementar Dashboard Professor** - Ver progresso dos alunos

## 📞 Suporte

Se tiver dúvidas:
1. Verifique se o SQL foi executado completamente
2. Verifique a estrutura de `sample-lessons.json`
3. Verifique os logs do navegador (F12 → Console)
4. Verifique os logs do servidor (terminal onde rodou `npm run dev`)
