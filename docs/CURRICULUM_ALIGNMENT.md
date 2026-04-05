# 📚 Política de Alinhamento Curricular - MestreMiudo

## Objetivo

Garantir que **todas** as questões/desafios gerados no MestreMiudo estão alinhados com o currículo português oficial para o 1º Ciclo (Grades 1-4).

---

## 🎯 Princípio Fundamental

**Nenhuma questão deve estar fora do alcance educacional da criança para a sua idade/grade.**

---

## 📋 Regras de Alinhamento

### Grade 1 (6-7 anos)

**✅ PERMITIDO:**
- Números até 20
- Adição e subtração simples
- Vogais, consoantes básicas
- Conceitos simples: tamanho, cor, forma
- Animais domésticos, família
- Estações do ano

**❌ PROIBIDO:**
- Percentagens
- Multiplicação/divisão
- Frações
- Conhecimentos científicos avançados
- Problemas com múltiplos passos
- Qualquer conteúdo de Grade 3+

---

### Grade 2 (7-8 anos)

**✅ PERMITIDO:**
- Números até 100
- Adição e subtração (até 100)
- Multiplicação como conceito (repetição)
- Leitura de histórias simples
- Compreensão de textos narrativos
- Noções de "metade" e "quarto"

**❌ PROIBIDO:**
- Percentagens
- Divisão complexa
- Multiplicação formal
- Geometria avançada
- Qualquer conteúdo de Grade 4+

---

### Grade 3 (8-9 anos)

**✅ PERMITIDO:**
- Números até 1000
- Multiplicação e divisão (conceitos)
- Frações simples (1/2, 1/4, 1/3)
- Geometria básica (triângulos, quadrados)
- Compreensão de textos mais complexos
- Noções de causa-efeito

**❌ PROIBIDO:**
- Percentagens
- Álgebra
- Geometria avançada
- Qualquer conteúdo de Grade 4+

---

### Grade 4 (9-10 anos)

**✅ PERMITIDO:**
- Números até 1 milhão
- Multiplicação e divisão (fluência)
- Frações (adição, comparação)
- Geometria básica completa
- Problemas de raciocínio
- Pensamento crítico

**❌ PROIBIDO:**
- Percentagens (só a partir de Grade 5)
- Álgebra simbólica
- Variações percentuais
- Qualquer conteúdo de Grade 5+

---

## ❌ Tópicos Explicitamente PROIBIDOS para Grades 1-2

```
- Percentagem / Percentag
- População / Taxa de crescimento
- Variação percentual
- Análise de dados complexa
- Estatística formal
- Probabilidade
- Bactéria / Vírus
- Célula / Biologia molecular
- Genética
- Evolução
- Fotossíntese
- Ecossistema complexo
- Cadeia alimentar avançada
- Física quântica
- Relatividade
- Equações / Cálculo
- Álgebra simbólica
- Trigonometria
- Logaritmos
- Exponenciação avançada
```

---

## 📊 Tópicos EXCLUSIVOS para Cada Grade

### Grade 5+ APENAS:
- Percentagens
- Desconto / Aumento
- Proporção / Razão
- Média, moda, mediana
- Gráficos de barras avançados

---

## 🛡️ Sistema de Validação

O projeto tem um sistema automático (`curriculum-validator.ts`) que:

1. **Valida cada questão** antes de ser apresentada
2. **Bloqueia questões fora do currículo**
3. **Avisa sobre complexidade excessiva**
4. **Sugere tópicos apropriados** por grade

---

## 📍 Exemplos Reais

### ❌ INCORRETO (fora do currículo para Grade 4):
```
"Um cientista está a estudar a população de uma espécie de ave. 
Se a população aumenta 15% ao longo de um ano, e no ano seguinte diminui 10%, 
qual é a variação percentual total?"

Porquê? 
- Percentagens: Conteúdo de Grade 5+
- Variações compostas: Conteúdo de Grade 7-8
```

### ✅ CORRETO (apropriado para Grade 4):
```
"Havia 20 passaros numa árvore. Vieram mais 15 passaros. 
Quantos passaros há agora?"

Porquê?
- Números simples ✓
- Uma operação (adição) ✓
- Contexto familiar (animais) ✓
```

---

## 🔄 Processo de Geração de Questões

Quando o AI gera uma questão:

1. **Geração**: AI cria questão baseado no currículo
2. **Validação**: Sistema verifica alinhamento
3. **Se INVÁLIDA**: Questão é rejeitada e regenerada
4. **Se VÁLIDA**: Questão é apresentada à criança

---

## 📋 Checklist para Revisores

Ao revisar qualquer questão/desafio:

- [ ] Grade apropriada para a idade?
- [ ] Números dentro do intervalo correto?
- [ ] Conceitos matemáticos alinhados?
- [ ] Contexto familiar à criança?
- [ ] Sem tópicos científicos avançados?
- [ ] Sem percentagens (antes Grade 5)?
- [ ] Sem álgebra simbólica (antes Grade 5)?
- [ ] Mensagem educacional clara?

---

## 🚀 Implementação Técnica

**Ficheiro:** `src/lib/curriculum-validator.ts`

**Funções principais:**
- `validateQuestionForCurriculum()` - Valida uma questão
- `validateQuestionsForCurriculum()` - Valida múltiplas
- `getRecommendedTopicsForGrade()` - Sugere tópicos

**Integração:**
```typescript
import { validateQuestionForCurriculum } from '@/lib/curriculum-validator';

const result = validateQuestionForCurriculum(
  "Um cientista estuda a população de aves...",
  4, // Grade
  'estudo do meio'
);

if (!result.isValid) {
  console.log(result.issues); // Mostrar problemas
  // Regenerar questão
}
```

---

## 📞 Quando Algo Está Errado?

Se encontrar uma questão **fora do currículo**:

1. **Reporte** o problema com a questão exata
2. **Indique** a grade e disciplina
3. **Explique** porquê está errada
4. **Sugestão** para corrigir

Exemplo:
```
Questão: "Qual é a variação percentual se..."
Problema: Percentagens não são Grade 4
Grade: 4
Disciplina: Matemática
Correção: Usar números simples (20 + 15 = ?)
```

---

## ✅ Garantias

O MestreMiudo **garante**:

✅ Todas as questões respeita o currículo português  
✅ Nada de tópicos prematuros  
✅ Alinhamento automático validado  
✅ Apropriação de idade garantida  
✅ Educação segura e progressiva  

---

## 📚 Referências

- **Aprendizagens Essenciais 2023** - DGE (Direção Geral da Educação)
- **Metas Curriculares** - Ministério da Educação Portugal
- **Ciclos de aprendizagem** - Psicologia educacional

---

**Última atualização:** 2026-04-05
**Status:** ✅ Validação automática ativa
**Manutenedor:** Tim
