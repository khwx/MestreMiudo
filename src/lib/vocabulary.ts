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
  { word: 'Vaca', category: 'Animais', difficulty: 'easy' },
  { word: 'Galinha', category: 'Animais', difficulty: 'easy' },
  { word: 'Coelho', category: 'Animais', difficulty: 'easy' },
  { word: 'Ovelha', category: 'Animais', difficulty: 'normal' },
  { word: 'Porco', category: 'Animais', difficulty: 'easy' },
  { word: 'Pato', category: 'Animais', difficulty: 'easy' },
  { word: 'Rato', category: 'Animais', difficulty: 'easy' },
  { word: 'Tartaruga', category: 'Animais', difficulty: 'normal' },
  // Partes do corpo
  { word: 'Mão', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Olho', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Pé', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Boca', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Nariz', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Orelha', category: 'Partes do Corpo', difficulty: 'normal' },
  { word: 'Cabeça', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Barriga', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Braço', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Perna', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Dedo', category: 'Partes do Corpo', difficulty: 'easy' },
  { word: 'Joelho', category: 'Partes do Corpo', difficulty: 'normal' },
  { word: 'Ombro', category: 'Partes do Corpo', difficulty: 'normal' },
  { word: 'Pescoço', category: 'Partes do Corpo', difficulty: 'normal' },
  // Cores
  { word: 'Vermelho', category: 'Cores', difficulty: 'easy' },
  { word: 'Azul', category: 'Cores', difficulty: 'easy' },
  { word: 'Amarelo', category: 'Cores', difficulty: 'easy' },
  { word: 'Verde', category: 'Cores', difficulty: 'easy' },
  { word: 'Laranja', category: 'Cores', difficulty: 'normal' },
  { word: 'Roxo', category: 'Cores', difficulty: 'normal' },
  { word: 'Rosa', category: 'Cores', difficulty: 'easy' },
  { word: 'Castanho', category: 'Cores', difficulty: 'easy' },
  { word: 'Preto', category: 'Cores', difficulty: 'easy' },
  { word: 'Branco', category: 'Cores', difficulty: 'easy' },
  { word: 'Cinza', category: 'Cores', difficulty: 'normal' },
  { word: 'Bege', category: 'Cores', difficulty: 'hard' },
  { word: 'Dourado', category: 'Cores', difficulty: 'hard' },
  { word: 'Prateado', category: 'Cores', difficulty: 'hard' },
  // Comida
  { word: 'Maçã', category: 'Comida', difficulty: 'easy' },
  { word: 'Pão', category: 'Comida', difficulty: 'easy' },
  { word: 'Leite', category: 'Comida', difficulty: 'easy' },
  { word: 'Queijo', category: 'Comida', difficulty: 'normal' },
  { word: 'Banana', category: 'Comida', difficulty: 'easy' },
  { word: 'Laranja', category: 'Comida', difficulty: 'easy' },
  { word: 'Bola de arroz', category: 'Comida', difficulty: 'easy' },
  { word: 'Sopa', category: 'Comida', difficulty: 'easy' },
  { word: 'Massa', category: 'Comida', difficulty: 'easy' },
  { word: 'Arroz', category: 'Comida', difficulty: 'easy' },
  { word: 'Batata', category: 'Comida', difficulty: 'easy' },
  { word: 'Cenoura', category: 'Comida', difficulty: 'easy' },
  { word: 'Tomate', category: 'Comida', difficulty: 'easy' },
  { word: 'Sumo', category: 'Comida', difficulty: 'easy' },
  // Escola
  { word: 'Caderno', category: 'Escola', difficulty: 'easy' },
  { word: 'Lápis', category: 'Escola', difficulty: 'easy' },
  { word: 'Borracha', category: 'Escola', difficulty: 'easy' },
  { word: 'Régua', category: 'Escola', difficulty: 'easy' },
  { word: 'Mochila', category: 'Escola', difficulty: 'easy' },
  { word: 'Quadro', category: 'Escola', difficulty: 'easy' },
  { word: 'Professora', category: 'Escola', difficulty: 'easy' },
  { word: 'Lousa', category: 'Escola', difficulty: 'normal' },
  // Natureza
  { word: 'Folha', category: 'Natureza', difficulty: 'easy' },
  { word: 'Semente', category: 'Natureza', difficulty: 'easy' },
  { word: 'Raiz', category: 'Natureza', difficulty: 'easy' },
  { word: 'Tronco', category: 'Natureza', difficulty: 'easy' },
  { word: 'Pedra', category: 'Natureza', difficulty: 'easy' },
  { word: 'Areia', category: 'Natureza', difficulty: 'easy' },
  { word: 'Neve', category: 'Natureza', difficulty: 'normal' },
  { word: 'Relva', category: 'Natureza', difficulty: 'easy' },
  // Família
  { word: 'Mãe', category: 'Família', difficulty: 'easy' },
  { word: 'Pai', category: 'Família', difficulty: 'easy' },
  { word: 'Irmão', category: 'Família', difficulty: 'easy' },
  { word: 'Irmã', category: 'Família', difficulty: 'easy' },
  { word: 'Avó', category: 'Família', difficulty: 'easy' },
  { word: 'Avô', category: 'Família', difficulty: 'easy' },
  { word: 'Tio', category: 'Família', difficulty: 'easy' },
  { word: 'Tia', category: 'Família', difficulty: 'easy' },
  // Profissões
  { word: 'Médico', category: 'Profissões', difficulty: 'normal' },
  { word: 'Professor', category: 'Profissões', difficulty: 'normal' },
  { word: 'Bombeiro', category: 'Profissões', difficulty: 'normal' },
  { word: 'Polícia', category: 'Profissões', difficulty: 'normal' },
  { word: 'Enfermeira', category: 'Profissões', difficulty: 'normal' },
  { word: 'Cozinheiro', category: 'Profissões', difficulty: 'normal' },
  // Desportos
  { word: 'Futebol', category: 'Desportos', difficulty: 'easy' },
  { word: 'Basquetebol', category: 'Desportos', difficulty: 'normal' },
  { word: 'Natação', category: 'Desportos', difficulty: 'easy' },
  { word: 'Ténis', category: 'Desportos', difficulty: 'normal' },
  { word: 'Atletismo', category: 'Desportos', difficulty: 'normal' },
  { word: 'Ciclismo', category: 'Desportos', difficulty: 'normal' },
  { word: 'Ginástica', category: 'Desportos', difficulty: 'normal' },
  { word: 'Judo', category: 'Desportos', difficulty: 'hard' },
  // Transportes
  { word: 'Carro', category: 'Transportes', difficulty: 'easy' },
  { word: 'Autocarro', category: 'Transportes', difficulty: 'easy' },
  { word: 'Comboio', category: 'Transportes', difficulty: 'easy' },
  { word: 'Avião', category: 'Transportes', difficulty: 'easy' },
  { word: 'Barco', category: 'Transportes', difficulty: 'easy' },
  { word: 'Bicicleta', category: 'Transportes', difficulty: 'easy' },
  { word: 'Metro', category: 'Transportes', difficulty: 'normal' },
  { word: 'Helicóptero', category: 'Transportes', difficulty: 'hard' },
  // Escola (more)
  { word: 'Lousa', category: 'Escola', difficulty: 'normal' },
  { word: 'Prova', category: 'Escola', difficulty: 'normal' },
  { word: 'Estojo', category: 'Escola', difficulty: 'easy' },
  { word: 'Mochila', category: 'Escola', difficulty: 'easy' },
  { word: 'Bloco', category: 'Escola', difficulty: 'easy' },
  { word: 'Cartola', category: 'Escola', difficulty: 'hard' },
  // Natureza (more)
  { word: 'Lago', category: 'Natureza', difficulty: 'normal' },
  { word: 'Vulcão', category: 'Natureza', difficulty: 'hard' },
  { word: 'Ilha', category: 'Natureza', difficulty: 'normal' },
];

const mathWords: VocabularyWord[] = [
  // Números
  { word: 'Um', category: 'Números', difficulty: 'easy' },
  { word: 'Dois', category: 'Números', difficulty: 'easy' },
  { word: 'Três', category: 'Números', difficulty: 'easy' },
  { word: 'Cinco', category: 'Números', difficulty: 'easy' },
  { word: 'Dez', category: 'Números', difficulty: 'easy' },
  { word: 'Vinte', category: 'Números', difficulty: 'normal' },
  { word: 'Quatro', category: 'Números', difficulty: 'easy' },
  { word: 'Seis', category: 'Números', difficulty: 'easy' },
  { word: 'Sete', category: 'Números', difficulty: 'easy' },
  { word: 'Oito', category: 'Números', difficulty: 'easy' },
  { word: 'Nove', category: 'Números', difficulty: 'easy' },
  { word: 'Zero', category: 'Números', difficulty: 'easy' },
  // Formas
  { word: 'Círculo', category: 'Formas', difficulty: 'easy' },
  { word: 'Quadrado', category: 'Formas', difficulty: 'easy' },
  { word: 'Triângulo', category: 'Formas', difficulty: 'easy' },
  { word: 'Retângulo', category: 'Formas', difficulty: 'normal' },
  { word: 'Estrela', category: 'Formas', difficulty: 'normal' },
  { word: 'Diamante', category: 'Formas', difficulty: 'hard' },
  { word: 'Losango', category: 'Formas', difficulty: 'normal' },
  { word: 'Hexágono', category: 'Formas', difficulty: 'hard' },
  { word: 'Octógono', category: 'Formas', difficulty: 'hard' },
  { word: 'Coração', category: 'Formas', difficulty: 'easy' },
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
  // Medidas
  { word: 'Metro', category: 'Medidas', difficulty: 'easy' },
  { word: 'Quilograma', category: 'Medidas', difficulty: 'normal' },
  { word: 'Litro', category: 'Medidas', difficulty: 'easy' },
  { word: 'Grama', category: 'Medidas', difficulty: 'easy' },
  { word: 'Centímetro', category: 'Medidas', difficulty: 'normal' },
  { word: 'Quilómetro', category: 'Medidas', difficulty: 'normal' },
  { word: 'Millilitro', category: 'Medidas', difficulty: 'hard' },
  { word: 'Termómetro', category: 'Medidas', difficulty: 'hard' },
  // Dinheiro
  { word: 'Euro', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Cêntimo', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Moeda', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Nota', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Preço', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Troco', category: 'Dinheiro', difficulty: 'normal' },
  // Tempo
  { word: 'Hora', category: 'Tempo', difficulty: 'easy' },
  { word: 'Minuto', category: 'Tempo', difficulty: 'easy' },
  { word: 'Segundo', category: 'Tempo', difficulty: 'easy' },
  { word: 'Dia', category: 'Tempo', difficulty: 'easy' },
  { word: 'Semana', category: 'Tempo', difficulty: 'easy' },
  { word: 'Mês', category: 'Tempo', difficulty: 'easy' },
  { word: 'Ano', category: 'Tempo', difficulty: 'easy' },
  { word: 'Século', category: 'Tempo', difficulty: 'hard' },
  // Geometria
  { word: 'Triângulo', category: 'Geometria', difficulty: 'easy' },
  { word: 'Quadrado', category: 'Geometria', difficulty: 'easy' },
  { word: 'Círculo', category: 'Geometria', difficulty: 'easy' },
  { word: 'Retângulo', category: 'Geometria', difficulty: 'easy' },
  { word: 'Losango', category: 'Geometria', difficulty: 'normal' },
  { word: 'Pentágono', category: 'Geometria', difficulty: 'normal' },
  { word: 'Hexágono', category: 'Geometria', difficulty: 'normal' },
  { word: 'Esfera', category: 'Geometria', difficulty: 'normal' },
  { word: 'Cubo', category: 'Geometria', difficulty: 'normal' },
  { word: 'Pirâmide', category: 'Geometria', difficulty: 'hard' },
  { word: 'Cilindro', category: 'Geometria', difficulty: 'hard' },
  { word: 'Cone', category: 'Geometria', difficulty: 'normal' },
  { word: 'Simetria', category: 'Geometria', difficulty: 'hard' },
  // Operações (more)
  { word: 'Triplo', category: 'Operações', difficulty: 'normal' },
  { word: 'Quociente', category: 'Operações', difficulty: 'hard' },
  { word: 'Resto', category: 'Operações', difficulty: 'normal' },
  // Dinheiro (more)
  { word: 'Carteira', category: 'Dinheiro', difficulty: 'easy' },
  { word: 'Poupança', category: 'Dinheiro', difficulty: 'normal' },
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
  { word: 'Vale', category: 'Natureza', difficulty: 'normal' },
  { word: 'Lago', category: 'Natureza', difficulty: 'easy' },
  { word: 'Ilha', category: 'Natureza', difficulty: 'easy' },
  { word: 'Praia', category: 'Natureza', difficulty: 'easy' },
  { word: 'Floresta', category: 'Natureza', difficulty: 'normal' },
  { word: 'Cascata', category: 'Natureza', difficulty: 'normal' },
  // Ciência
  { word: 'Planta', category: 'Ciência', difficulty: 'easy' },
  { word: 'Animal', category: 'Ciência', difficulty: 'easy' },
  { word: 'Insecto', category: 'Ciência', difficulty: 'normal' },
  { word: 'Oceano', category: 'Ciência', difficulty: 'normal' },
  { word: 'Planeta', category: 'Ciência', difficulty: 'normal' },
  { word: 'Fóssil', category: 'Ciência', difficulty: 'hard' },
  { word: 'Reciclar', category: 'Ciência', difficulty: 'normal' },
  { word: 'Energia', category: 'Ciência', difficulty: 'normal' },
  { word: 'Solo', category: 'Ciência', difficulty: 'easy' },
  { word: 'Célula', category: 'Ciência', difficulty: 'hard' },
  { word: 'Gravidade', category: 'Ciência', difficulty: 'hard' },
  { word: 'Atmosfera', category: 'Ciência', difficulty: 'hard' },
  { word: 'Fotossíntese', category: 'Ciência', difficulty: 'hard' },
  { word: 'Espécie', category: 'Ciência', difficulty: 'normal' },
  { word: 'Habitat', category: 'Ciência', difficulty: 'normal' },
  { word: 'Predador', category: 'Ciência', difficulty: 'normal' },
  // Clima
  { word: 'Temperatura', category: 'Clima', difficulty: 'easy' },
  { word: 'Vento', category: 'Clima', difficulty: 'easy' },
  { word: 'Tempestade', category: 'Clima', difficulty: 'normal' },
  { word: 'Neblina', category: 'Clima', difficulty: 'hard' },
  { word: 'Geada', category: 'Clima', difficulty: 'hard' },
  { word: 'Seca', category: 'Clima', difficulty: 'normal' },
  { word: 'Inundaçao', category: 'Clima', difficulty: 'hard' },
  { word: 'Arco-íris', category: 'Clima', difficulty: 'easy' },
  // Materiais
  { word: 'Madeira', category: 'Materiais', difficulty: 'easy' },
  { word: 'Metal', category: 'Materiais', difficulty: 'easy' },
  { word: 'Vidro', category: 'Materiais', difficulty: 'easy' },
  { word: 'Plástico', category: 'Materiais', difficulty: 'easy' },
  { word: 'Papel', category: 'Materiais', difficulty: 'easy' },
  { word: 'Tecido', category: 'Materiais', difficulty: 'normal' },
  // Cidades
  { word: 'Lisboa', category: 'Cidades', difficulty: 'easy' },
  { word: 'Porto', category: 'Cidades', difficulty: 'easy' },
  { word: 'Coimbra', category: 'Cidades', difficulty: 'easy' },
  { word: 'Faro', category: 'Cidades', difficulty: 'easy' },
  { word: 'Braga', category: 'Cidades', difficulty: 'easy' },
  { word: 'Évora', category: 'Cidades', difficulty: 'normal' },
  { word: 'Aveiro', category: 'Cidades', difficulty: 'normal' },
  { word: 'Guimarães', category: 'Cidades', difficulty: 'normal' },
  // Alimentos
  { word: 'Maçã', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Pera', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Banana', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Laranja', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Cenoura', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Tomate', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Arroz', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Pão', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Peixe', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Carne', category: 'Alimentos', difficulty: 'easy' },
  { word: 'Ovo', category: 'Alimentos', difficulty: 'easy' },
  // Ciência (more)
  { word: 'Condutor', category: 'Ciência', difficulty: 'normal' },
  { word: 'Isolante', category: 'Ciência', difficulty: 'normal' },
  { word: 'Íman', category: 'Ciência', difficulty: 'normal' },
  { word: 'Circuito', category: 'Ciência', difficulty: 'hard' },
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
