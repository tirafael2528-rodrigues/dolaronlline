import { API_BASE_URL } from '../constants';
import { CoinData, NewsItem } from '../types';

export const fetchQuotes = async (pairs: string[]): Promise<Record<string, CoinData>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/last/${pairs.join(',')}`);
    if (!response.ok) throw new Error('Failed to fetch quotes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return {};
  }
};

export const fetchHistory = async (pair: string, days: number = 30): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily/${pair}/${days}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const fetchNews = async (): Promise<NewsItem[]> => {
  // Simplified news fetching. In a real scenario, this might use a proxy or a dedicated API.
  // For this blueprint, we'll provide some static relevant news as fallback.
  return [
    {
      title: "Dólar abre em estabilidade após dados do varejo",
      link: "https://www.infomoney.com.br/",
      pubDate: new Date().toISOString(),
      description: "O mercado financeiro reagiu com cautela aos novos dados econômicos...",
      source: "InfoMoney"
    },
    {
      title: "Ibovespa sobe impulsionado por commodities",
      link: "https://valor.globo.com/",
      pubDate: new Date().toISOString(),
      description: "Preços do petróleo e minério de ferro ajudam o índice brasileiro...",
      source: "Valor Econômico"
    },
    {
      title: "Federal Reserve mantém taxas de juros inalteradas",
      link: "https://investing.com/",
      pubDate: new Date().toISOString(),
      description: "Comunicado reafirma compromisso com o combate à inflação...",
      source: "Investing.com"
    }
  ];
};
