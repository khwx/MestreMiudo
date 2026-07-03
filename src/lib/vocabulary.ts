export interface VocabularyWord {
  word: string;
  category: string;
  difficulty: 'easy' | 'normal' | 'hard';
}

export type Subject = 'português' | 'matemática' | 'estudo do meio';

const portugueseWords: VocabularyWord[] = [
  // Animais
  { word: 'Cão', category: 'Animais', difficulty: 'easy' },
  { word: 'Gato', category: 'Animais', difficulty: 'easy' },
  { word: 'Pássaro', category: 'Animais', difficulty: 'easy' },
  { word: 'Peixe', category: 'Animais', difficulty: 'easy' },
  { word: 'Cavalo', category: 'Animais', difficulty: 'normal' },
  { word: 'Borboleta', category: 'Animais', difficulty: 'normal' },
  // Partes do corpo
  { word: 'Mão', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Olho', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Pé', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Boca', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Nariz', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Orelha', category: 'Partes do Corpo', difficulty: 'normal' },
  // Cores
  { word: 'Vermelho', category: 'Cores', difficulty: 'easy' },
  { word: 'Azul', category: 'Cores', difficulty: 'easy' },
  { word: 'Amarelo', category: 'Cores', difficulty: 'easy' },
  { word: 'Verde', category: 'Cores', difficulty: 'easy' },
  { word: 'Laranja', category: 'Cores', difficulty: 'normal' },
  { word: 'Roxo', category: 'Cores', difficulty: 'normal' },
  // Comida
  { word: 'Maçã', category: 'Comida', difficulty: 'easy' },
  { word: 'Pão', category: 'Comida', difficulty: 'easy' },
  { word: 'Leite', category: 'Comida', difficulty: 'easy' },
  { word: 'Queijo', category: 'Comida', difficulty: 'normal' },
  { word: 'Banana', category: 'Comida', difficulty: 'easy' },
  { word: 'Laranja', category: 'Comida', difficulty: 'easy' },
];

const mathWords: VocabularyWord[] = [
  // Números
  { word: 'Um', category: 'Números', difficulty: 'easy' },
  { word: 'Dois', category: 'Números', difficulty: 'easy' },
  { word: 'Três', category: 'Números', difficulty: 'easy' },
  { word: 'Cinco', category: 'Números', difficulty: 'easy' },
  { word: 'Dez', category: 'Números', difficulty: 'easy' },
  { word: 'Vinte', category: 'Números', difficulty: 'normal' },
  // Formas
  { word: 'Círculo', category: 'Formas', difficulty: 'easy' },
  { word: 'Quadrado', category: 'Formas', difficulty: 'easy' },
  { word: 'Triângulo', category: 'Formas', difficulty: 'easy' },
  { word: 'Retângulo', category: 'Formas', difficulty: 'normal' },
  { word: 'Estrela', category: 'Formas', difficulty: 'normal' },
  { word: 'Diamante', category: 'Formas', difficulty: 'hard' },
  // Operações
  { word: 'Soma', category: 'Operações', difficulty: 'easy' },
  { word: 'Subtrair', category: 'Operações', difficulty: 'easy' },
  { word: 'Multiplicar', category: 'Operações', difficulty: 'normal' },
  { word: 'Dividir', category: 'Operações', difficulty: 'normal' },
  { word: 'Maior', category: 'Operações', difficulty: 'easy' },
  { word: 'Menor', category: 'Operações', difficulty: 'easy' },
  { word: 'Igual', category: 'Operações', difficulty: 'easy' },
  { word: 'Metade', category: 'Operações', difficulty: 'normal' },
  { word: 'Dobro', category: 'Operações', difficulty: 'normal' },
  { word: 'Zero', category: 'Números', difficulty: 'easy' },
];

const estudoDoMeioWords: VocabularyWord[] = [
  // Natureza
  { word: 'Árvore', category: 'Natureza', difficulty: 'easy' },
  { word: 'Flor', category: 'Natureza', difficulty: 'easy' },
  { word: 'Sol', category: 'Natureza', difficulty: 'easy' },
  { word: 'Lua', category: 'Natureza', difficulty: 'easy' },
  { word: 'Água', category: 'Natureza', difficulty: 'easy' },
  { word: 'Chuva', category: 'Natureza', difficulty: 'easy' },
  { word: 'Nuvem', category: 'Natureza', difficulty: 'easy' },
  { word: 'Montanha', category: 'Natureza', difficulty: 'normal' },
  { word: 'Rio', category: 'Natureza', difficulty: 'easy' },
  { word: 'Mar', category: 'Natureza', difficulty: 'easy' },
  { word: 'Estrela', category: 'Natureza', difficulty: 'easy' },
  { word: 'Terra', category: 'Natureza', difficulty: 'easy' },
  // Ciência
  { word: 'Planta', category: 'Ciência', difficulty: 'easy' },
  { word: 'Animal', category: 'Ciência', difficulty: 'easy' },
  { word: 'Insecto', category: 'Ciência', difficulty: 'normal' },
  { word: 'Oceano', category: 'Ciência', difficulty: 'normal' },
  { word: 'Planeta', category: 'Ciência', difficulty: 'normal' },
  { word: 'Fóssil', category: 'Ciência', difficulty: 'hard' },
  { word: 'Reciclar', category: 'Ciência', difficulty: 'normal' },
  { word: 'Energia', category: 'Ciência', difficulty: 'normal' },
  { word: 'Clima', category: 'Ciência', difficulty: 'normal' },
  { word: 'Solo', category: 'Ciência', difficulty: 'easy' },
];

export const vocabularyBySubject: Record<Subject, VocabularyWord[]> = {
  'português': portugueseWords,
  'matemática': mathWords,
  'estudo do meio': estudoDoMeioWords,
};

export function getVocabularyForSubject(subject: Subject): VocabularyWord[] {
  return vocabularyBySubject[subject] || [];
}

export function getVocabularyByCategory(subject: Subject, category: string): VocabularyWord[] {
  return getVocabularyForSubject(subject).filter(w => w.category === category);
}

export function getVocabularyByDifficulty(subject: Subject, difficulty: 'easy' | 'normal' | 'hard'): VocabularyWord[] {
  return getVocabularyForSubject(subject).filter(w => w.difficulty === difficulty);
}

export function getCategoriesForSubject(subject: Subject): string[] {
  const words = getVocabularyForSubject(subject);
  return [...new Set(words.map(w => w.category))];
}

export function getRandomVocabularyPairs(subject: Subject, count: number = 8): VocabularyWord[] {
  const words = getVocabularyForSubject(subject);
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
