
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWorkoutSuggestions = async (goal: string, level: string, muscleGroups: string[]) => {
  const prompt = `Gere sugestões de exercícios para um plano de treino focado em: ${goal}.
  Nível do aluno: ${level}.
  Grupamentos musculares alvo: ${muscleGroups.join(', ')}.
  Retorne um array de objetos JSON contendo nome do exercício, séries, repetições, carga sugerida (como string, ex: "Moderada"), e tempo de descanso.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              sets: { type: Type.NUMBER },
              reps: { type: Type.STRING },
              weight: { type: Type.STRING },
              rest: { type: Type.STRING },
            },
            required: ["name", "sets", "reps", "weight", "rest"],
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro ao obter sugestões do Gemini:", error);
    return [];
  }
};
