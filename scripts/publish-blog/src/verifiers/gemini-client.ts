/**
 * Gemini API 호출 공유 유틸. JSON 응답 강제.
 * NANOBANANA_API_KEY 환경변수 사용 (기존 publish.ts 와 동일).
 */

const GEMINI_FLASH_MODEL = 'gemini-3-flash-preview';
const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';

export type GeminiTier = 'flash' | 'pro';

export interface GeminiCallOptions {
  prompt: string;
  tier?: GeminiTier;
  /** 0-1, JSON 출력에는 0.2 권장 */
  temperature?: number;
}

export interface GeminiCallResult<T> {
  parsed: T;
  raw: string;
  model: string;
}

function modelFor(tier: GeminiTier): string {
  return tier === 'pro' ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;
}

/**
 * Gemini 호출 + JSON 파싱. 실패 시 throw.
 */
export async function callGeminiJson<T>(opts: GeminiCallOptions): Promise<GeminiCallResult<T>> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error('NANOBANANA_API_KEY 미설정 — verifier 사용 불가');
  }

  const tier = opts.tier ?? 'flash';
  const model = modelFor(tier);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini ${model} ${response.status} ${response.statusText} ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini ${model} 응답에 텍스트 파트 없음`);
  }

  let parsed: T;
  try {
    parsed = JSON.parse(text.trim());
  } catch (err) {
    throw new Error(
      `Gemini ${model} JSON 파싱 실패: ${err instanceof Error ? err.message : String(err)}\n원문: ${text.slice(0, 500)}`,
    );
  }

  return { parsed, raw: text, model };
}
