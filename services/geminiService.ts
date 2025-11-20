import { GoogleGenAI } from "@google/genai";
import { ScrapedData } from "../types";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY ortam değişkenlerinde bulunamadı");
  return new GoogleGenAI({ apiKey });
};

/**
 * Simulates the "Scraper Class" by using Gemini + Google Search Grounding
 * to fetch real-time data about teams.
 */
export const fetchMatchData = async (teamAName: string, teamBName: string): Promise<ScrapedData> => {
  const ai = getAiClient();
  
  // We use gemini-2.5-flash for speed and search capability
  // This replaces BeautifulSoup by "reading" the web for us.
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Act as a Football Data Scraper. 
    Search for the latest statistics, recent form (last 5 matches), current injuries, and tactical strengths for ${teamAName} and ${teamBName}.
    
    Based on the search results, estimate the following numeric values for your simulation engine:
    1. Recent Form (0-100): 100 is winning all recent games, 0 is losing all.
    2. Attack Strength (0-200): 100 is average, >100 is strong.
    3. Defense Strength (0-200): 100 is average.
    4. Injury Impact (0.0-1.0): 1.0 means full squad available, 0.7 means key players missing.
    
    Also provide a brief "weatherForecast" in Turkish for the likely match location (guess based on home team).
    Provide a "tacticalAnalysis" summary in Turkish (max 2 sentences).

    RETURN ONLY A VALID JSON OBJECT. Do not wrap in markdown code blocks.
    Structure:
    {
      "teamA": {
        "name": "${teamAName}",
        "recentForm": number,
        "attackStrength": number,
        "defenseStrength": number,
        "injuryImpact": number,
        "missingKeyPlayers": ["string"],
        "last5Matches": ["string"]
      },
      "teamB": {
        "name": "${teamBName}",
        "recentForm": number,
        "attackStrength": number,
        "defenseStrength": number,
        "injuryImpact": number,
        "missingKeyPlayers": ["string"],
        "last5Matches": ["string"]
      },
      "weatherForecast": "string",
      "tacticalAnalysis": "string"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Activate Search Grounding
      // Note: responseMimeType: 'application/json' is NOT supported with googleSearch tool
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini'den veri alınamadı");
  
  // Clean up markdown if the model mistakenly adds it
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanText) as ScrapedData;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw Text:", text);
    throw new Error("Yapay zeka geçersiz JSON formatı döndürdü. Lütfen tekrar deneyin.");
  }
};

/**
 * Uses the Thinking Model (Gemini 3 Pro) for a sophisticated breakdown
 */
export const getDeepAnalysis = async (teamA: string, teamB: string, simulationResult: string) => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      Analyze this football match simulation result between ${teamA} and ${teamB}.
      Simulation Output: ${simulationResult}
      
      Provide a "Professor-style" commentary on why the math might be predicting this. 
      Focus on tactical mismatch or statistical variance. Keep it under 150 words.
      WRITE THE RESPONSE IN TURKISH.
    `,
    config: {
      thinkingConfig: { thinkingBudget: 2048 } // Enable Thinking mode for reasoning
    }
  });

  return response.text || "Analiz mevcut değil.";
};