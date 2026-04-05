# 🎓 MestreMiudo - "Aprender a Brincar"

## Setup Rápido

O sistema de lições está pronto para ser usado! Siga estes 3 passos simples:

### 1️⃣ Criar as Tabelas no Supabase (2 minutos)

Abra o [Supabase Dashboard](https://supabase.com/dashboard):

1. Selecione o projeto **MestreMiudo**
2. Vá para **SQL Editor** → **New Query**
3. Cole o conteúdo de `supabase-setup.sql` (pode copiar no browser)
4. Clique em **Run** (Ctrl+Enter)

**Dica:** Abra `setup-html.html` no navegador para facilitar a cópia!

### 2️⃣ Importar Lições de Exemplo (30 segundos)

Após as tabelas serem criadas, execute:

```bash
node auto-import-lessons.mjs
```

Esperado:
```
✅ Tabelas criadas com sucesso!
📥 Importando lições de exemplo...
  ▪ 16 lições...
  ✅ 16 lições importadas!
  ▪ 3 desafios...
  ✅ 3 desafios importados!
✨ Importação concluída com sucesso!
```

### 3️⃣ Testar o Sistema (1 minuto)

```bash
npm run dev
```

Abra o navegador: [http://localhost:3000/dashboard/learn](http://localhost:3000/dashboard/learn)

## 🎮 Testando o Sistema

1. **Selecione uma disciplina**: Português, Matemática ou Estudo do Meio
2. **Veja as lições disponíveis** (orderedas por dificuldade)
3. **Complete uma lição**:
   - Responda cada desafio (multiple choice, preencher espaço, etc.)
   - Ganhe ⭐ (0-3 stars baseado no score)
   - Ganhe 💰 coins (10-50 conforme o score)
4. **Acompanhe o progresso** em cada disciplina

## 📊 Conteúdo Disponível

| Disciplina | Grades | Lições | Estado |
|-----------|--------|--------|--------|
| Português | 1-2 | 6 | ✅ Prontas |
| Matemática | 1 | 4 | ✅ Prontas |
| Estudo do Meio | 1 | 6 | ✅ Prontas |
| **Total** | - | **16** | ✅ **Prontas** |

## 🚀 Próximas Etapas

### Expandir o Conteúdo

Analisar currículo e criar mais lições:

```bash
# Analisar currículo de Português Grade 2
node extract-curriculum.mjs português 2

# Ver análise gerada
cat docs/curriculum-analysis/português_2_lessons.md
```

### Integrar Imagens

As lições já têm suporte a imagens da Pixabay. O sistema automatically procura imagens relevantes para cada lição.

### Dashboard de Progresso

Ver estatísticas dos alunos:
- Total de lições completadas
- Estrelas ganhas por disciplina
- Coins totais
- Histórico de atividades

## 📁 Ficheiros Importantes

```
MestreMiudo/
├── supabase-setup.sql          ← SQL para criar tabelas
├── docs/
│   ├── sample-lessons.json      ← 16 lições + desafios
│   ├── LEARNING_SYSTEM.md       ← Documentação do sistema
│   └── SETUP_DATABASE.md        ← Setup detalhado
├── auto-import-lessons.mjs      ← Script de importação
├── extract-curriculum.mjs       ← Ferramenta de análise
└── src/app/
    └── dashboard/learn/         ← Código das páginas
```

## ⚙️ Estrutura do Sistema

### Páginas

- `/dashboard/learn` - Hub de disciplinas
- `/dashboard/learn/[subject]` - Lições de uma disciplina
- `/dashboard/learn/[subject]/lesson/[lesson_id]` - Desafios da lição

### Banco de Dados

**Tabelas:**
- `lessons` - Metadados das lições
- `lesson_challenges` - Desafios individuais
- `lesson_completion` - Progresso do aluno

**Fórmulas de Gamificação:**
- 0-59% → 0 ⭐ (incompleto)
- 60-79% → 1 ⭐ (10 coins)
- 80-99% → 2 ⭐ (25 coins)
- 100% → 3 ⭐ (50 coins)

## 🐛 Troubleshooting

### "Could not find the table 'public.lessons'"

A tabela ainda não foi criada. Execute o SQL em `supabase-setup.sql` no Supabase Dashboard.

### Lições aparecem mas sem desafios

Verifique o ficheiro `docs/sample-lessons.json`. Pode estar mal formatado.

### Erro de permissões

Verifique se o SQL foi executado completamente (inclui CREATE POLICY).

## 📞 Suporte

1. Verifique o erro em `docs/SETUP_DATABASE.md`
2. Veja logs do navegador (F12 → Console)
3. Verifique logs do servidor (terminal onde rodou `npm run dev`)

## 🎯 Filosofia - "Aprender a Brincar"

O MestreMiudo segue a metodologia "Learn by Playing":

✅ **Lições curtas** (3-5 desafios)
✅ **Feedback positivo** (celebração ao completar)
✅ **Gamificação natural** (stars e coins como motivação)
✅ **Alinhado ao currículo** (conteúdo baseado em Aprendizagens Essenciais 2023)
✅ **Progressão clara** (lições desbloqueadas sequencialmente)

---

**Status:** ✅ Sistema pronto para produção
**Última atualização:** 2026-04-05
**Versão:** 1.0 (Beta)
