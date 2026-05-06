import { spawn } from 'node:child_process';

export interface ClaudeResult {
  text: string;
  costUsd?: number;
  durationMs?: number;
}

/**
 * 'claude -p ... --output-format json --max-turns 1' 을 spawn 해 단일 응답을 받는다.
 * prompt 와 body 를 합쳐 user message 로 넘김.
 *
 * 가드레일:
 * - max-turns 1 — tool 사용 금지, 단답
 * - JSON output 으로 result 필드만 추출
 */
export async function callClaude(opts: {
  prompt: string;
  body: string;
  model?: string;
}): Promise<ClaudeResult> {
  const { prompt, body, model = 'claude-sonnet-4-6' } = opts;
  const userMessage = `${prompt}\n${body}`;
  const args = [
    '-p',
    userMessage,
    '--output-format',
    'json',
    '--max-turns',
    '1',
    '--model',
    model,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn('claude', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.stderr.on('data', (d) => (err += d));
    proc.on('error', (e) => reject(new Error(`claude spawn 실패: ${e.message}`)));
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`claude exit ${code}\n${err}`));
      }
      try {
        const parsed = JSON.parse(out) as {
          is_error: boolean;
          api_error_status: string | null;
          result: string;
          total_cost_usd?: number;
          duration_ms?: number;
        };
        if (parsed.is_error) {
          return reject(
            new Error(`claude api error: ${parsed.api_error_status ?? 'unknown'}`)
          );
        }
        resolve({
          text: parsed.result,
          costUsd: parsed.total_cost_usd,
          durationMs: parsed.duration_ms,
        });
      } catch (e) {
        reject(
          new Error(
            `parse 실패: ${(e as Error).message}\nstdout(앞 500자):\n${out.slice(0, 500)}`
          )
        );
      }
    });
  });
}

/**
 * Claude 응답 텍스트에서 JSON 객체를 안전하게 추출.
 * 코드펜스가 들어있으면 제거, "null" 텍스트면 null 반환.
 */
export function extractJson<T = unknown>(raw: string): T | null {
  let txt = raw.trim();
  if (txt === 'null' || txt === '"null"') return null;
  // code fence 제거
  txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  return JSON.parse(txt) as T;
}
