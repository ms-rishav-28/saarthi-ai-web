import { VertexAI } from '@google-cloud/vertexai';

export interface EligibilityResult {
  primaryScheme: 'PM Matru Vandana Yojana';
  additionalSchemes: string[];
  rationale: string[];
}

export async function runEligibilityScout(inputText: string, languageHint: string): Promise<EligibilityResult> {
  const llmResult = await tryGeminiEligibility(inputText, languageHint);
  if (llmResult) return llmResult;

  return {
    primaryScheme: 'PM Matru Vandana Yojana',
    additionalSchemes: ['Janani Suraksha Yojana', 'Ayushman Bharat'],
    rationale: [
      `Life event detected in ${languageHint}: childbirth`,
      `Input: ${inputText}`,
    ],
  };
}

async function tryGeminiEligibility(inputText: string, languageHint: string): Promise<EligibilityResult | null> {
  const project = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || 'asia-south1';
  if (!project) return null;

  const vertex = new VertexAI({ project, location });
  const model = vertex.getGenerativeModel({ model: 'gemini-3.1-flash' });

  const systemPrompt = [
    'You are Eligibility Scout for Saarthi AI.',
    'Return strict JSON only: {"primaryScheme":"PM Matru Vandana Yojana","additionalSchemes":string[],"rationale":string[]}.',
    'Prioritize Maharashtra maternal and newborn schemes for childbirth intent.',
    'Never request or output full Aadhaar number.',
  ].join(' ');

  const request = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\nLanguage: ${languageHint}\nCitizen message: ${inputText}` }],
      },
    ],
  };

  try {
    const result = await model.generateContent(request);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(extractJson(text)) as EligibilityResult;
    if (!parsed.primaryScheme || !Array.isArray(parsed.additionalSchemes) || !Array.isArray(parsed.rationale)) {
      return null;
    }
    return {
      primaryScheme: 'PM Matru Vandana Yojana',
      additionalSchemes: parsed.additionalSchemes,
      rationale: parsed.rationale,
    };
  } catch {
    return null;
  }
}

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON payload');
  }
  return text.slice(start, end + 1);
}
