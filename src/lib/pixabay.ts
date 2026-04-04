/**
 * @fileOverview Pixabay image search utility for quiz questions
 * Fetches appropriate educational images for different topics
 */

interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  downloads: number;
  favorites: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

/**
 * Map question topics to child-friendly search terms
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  // Português topics
  'Alfabeto': ['alphabet letters'],
  'Vogais': ['vowels alphabet'],
  'Consonantes': ['consonants'],
  'Leitura': ['reading children book'],
  'Escrita': ['writing pen pencil'],
  'Rimas': ['rhyming words poetry'],
  'Sílabas': ['syllables'],
  'Palavras': ['words text'],
  'Frases': ['sentence words'],
  'Histórias': ['story book tale'],
  'Contos': ['fairy tale story'],
  'Poesia': ['poetry poem'],
  'Livros': ['books library reading'],
  'Letras': ['letters alphabet'],

  // Matemática topics
  'Números': ['numbers counting 1 2 3'],
  'Contagem': ['counting numbers'],
  'Adição': ['addition math plus'],
  'Subtração': ['subtraction math minus'],
  'Multiplicação': ['multiplication math times'],
  'Divisão': ['division math share'],
  'Geometria': ['shapes geometry'],
  'Triângulos': ['triangle shape'],
  'Quadrados': ['square rectangle shape'],
  'Círculos': ['circle round shape'],
  'Retângulos': ['rectangle shape'],
  'Formas': ['shapes geometric'],
  'Medidas': ['measurement ruler'],
  'Comprimento': ['length measurement'],
  'Peso': ['weight scales'],
  'Capacidade': ['capacity volume liquid'],
  'Tempo': ['time clock watch'],
  'Horas': ['clock time hours'],
  'Dinheiro': ['money coins cash'],
  'Euros': ['money euro coins'],
  'Padrões': ['pattern sequence'],
  'Prisma': ['prism 3D shape'],
  'Cubo': ['cube shape 3D'],
  'Esfera': ['sphere ball round'],

  // Estudo do Meio topics
  'Animais': ['animals wildlife nature'],
  'Plantas': ['plants flowers nature'],
  'Corpo': ['human body anatomy'],
  'Família': ['family people'],
  'Casa': ['house home'],
  'Escola': ['school classroom'],
  'Comunidade': ['community city town'],
  'Segurança': ['safety safe'],
  'Higiene': ['hygiene clean washing'],
  'Alimentos': ['food fruit vegetables'],
  'Bebidas': ['drinks water juice'],
  'Roupas': ['clothes clothing'],
  'Estações': ['seasons weather'],
  'Primavera': ['spring flowers'],
  'Verão': ['summer sun beach'],
  'Outono': ['autumn fall leaves'],
  'Inverno': ['winter snow cold'],
  'Dia': ['daytime sun morning'],
  'Noite': ['night moon stars'],
  'Sol': ['sun solar'],
  'Lua': ['moon night'],
  'Estrelas': ['stars night sky'],
  'Chuva': ['rain weather'],
  'Nuvens': ['clouds sky'],
  'Vento': ['wind weather'],
  'Água': ['water'],
  'Terra': ['earth soil ground'],
  'Ar': ['air atmosphere'],
  'Fogo': ['fire flames'],
  'Ar Livre': ['outdoor nature'],
  'Transporte': ['transportation cars buses'],
  'Carros': ['cars vehicles'],
  'Autocarros': ['bus transport'],
  'Comboios': ['train transport'],
  'Aviões': ['airplane plane'],
  'Barcos': ['boat ship water'],
  'Profissões': ['professions jobs work'],
  'Médico': ['doctor hospital medical'],
  'Professor': ['teacher school education'],
  'Polícia': ['police officer uniform'],
  'Bombeiro': ['firefighter fire'],
  'Fazendeiro': ['farmer agriculture'],
};

/**
 * Get child-safe, appropriate keywords for a topic
 */
function getSearchKeywords(topic: string | undefined): string {
  if (!topic) return 'education children learning';

  const keywords = TOPIC_KEYWORDS[topic] || TOPIC_KEYWORDS['Geral'];
  if (!keywords || keywords.length === 0) {
    return 'education children learning';
  }

  // Return first keyword as the search term
  return keywords[0];
}

/**
 * Fetch image from Pixabay for a given search query
 * @param searchQuery - What to search for
 * @param safeSearch - Filter for family-friendly content
 * @returns URL of the image or null if not found
 */
export async function fetchPixabayImage(
  searchQuery: string,
  safeSearch = true
): Promise<string | null> {
  if (!PIXABAY_API_KEY) {
    console.warn('[PIXABAY] API key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: searchQuery,
      image_type: 'photo',
      order: 'popular',
      min_width: '400',
      min_height: '400',
      orientation: 'horizontal',
      safesearch: safeSearch ? 'true' : 'false',
      per_page: '3',
    });

    const response = await fetch(`https://pixabay.com/api/?${params.toString()}`);

    if (!response.ok) {
      console.error('[PIXABAY] API error:', response.status);
      return null;
    }

    const data = (await response.json()) as PixabayResponse;

    if (!data.hits || data.hits.length === 0) {
      console.log(`[PIXABAY] No results for "${searchQuery}"`);
      return null;
    }

    // Return URL of the first (most relevant) image
    const image = data.hits[0];
    return image.webformatURL;
  } catch (error) {
    console.error('[PIXABAY] Request failed:', error);
    return null;
  }
}

/**
 * Fetch image for a quiz question topic
 * Uses predefined keywords for better educational relevance
 */
export async function fetchImageForTopic(
  topic: string | undefined
): Promise<string | null> {
  const searchQuery = getSearchKeywords(topic);
  return fetchPixabayImage(searchQuery);
}

/**
 * Fetch images for multiple questions in parallel
 * @param topics - Array of topic strings
 * @returns Array of image URLs (null for failed fetches)
 */
export async function fetchImagesForTopics(
  topics: (string | undefined)[]
): Promise<(string | null)[]> {
  const promises = topics.map(topic => fetchImageForTopic(topic));
  return Promise.all(promises);
}
