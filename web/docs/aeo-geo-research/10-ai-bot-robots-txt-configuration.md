# AI 봇 robots.txt 설정 — 2026 최신

- **출처**:
  - ALM Corp (Anthropic 3-봇 구조): <https://almcorp.com/blog/anthropic-claude-bots-robots-txt-strategy/> (2026-02-26)
  - Mersel AI: <https://www.mersel.ai/blog/how-to-block-or-allow-ai-bots-on-your-website>
  - Open Shadow: <https://www.openshadow.io/guides/robots-txt-ai-bots>
  - Soar: <https://www.soar.sh/blog/ai-bots-robots-txt-guide>
- **수집일**: 2026-05-27
- **한 줄 요약**: 7번 노트의 #1 팩터인 "URL Accessibility"의 실무. 2026년 AI 봇은 **12개 user-agent / 6개 조직**. 핵심은 **training 봇 vs search/retrieval 봇 구분**.

---

## 2026년 주요 AI 봇 카탈로그

| 조직 | User-Agent | 목적 | 권장 |
|------|-----------|------|------|
| OpenAI | **GPTBot** | 학습 데이터 수집 | 노출 원하면 Allow, training 거부 원하면 Block |
| OpenAI | **OAI-SearchBot** | ChatGPT Search index | **반드시 Allow** |
| OpenAI | **ChatGPT-User** | 사용자 실시간 쿼리 fetch | **반드시 Allow** |
| Anthropic | **ClaudeBot** | 학습 데이터 수집 | Training 거부 시 Block |
| Anthropic | **Claude-User** | 사용자 실시간 쿼리 fetch | **반드시 Allow** |
| Anthropic | **Claude-SearchBot** | Claude 검색 인덱스 | **반드시 Allow** |
| Perplexity | **PerplexityBot** | 검색·인용 (training 아님) | **반드시 Allow** |
| Google | **Google-Extended** | Gemini 학습 + Vertex AI | Allow (Google 검색에는 영향 없음) |
| Microsoft | **Bingbot** | Bing + ChatGPT Search 인덱스 | **반드시 Allow** (ChatGPT Search는 Bing 인덱스 사용!) |
| ByteDance | Bytespider | TikTok / Doubao 학습 | 선택 (한국 사용자 적음) |
| Common Crawl | CCBot | 공개 크롤링 (재배포) | 선택 |
| Apple | Applebot-Extended | Apple Intelligence 학습 | 선택 |

## 2026년 주요 변경점

### Anthropic 3-봇 구조 (2026-02-26 발표)
- `Claude-Web`, `anthropic-ai` (예전 user-agents) → **더 이상 사용 안 함**.
- 사이트가 이 옛 이름만 차단하고 있다면 실질적으로 차단되지 않음.
- 현행:
  - **ClaudeBot** = 학습용 (선택적 차단)
  - **Claude-User** = 사용자 질문 시 실시간 fetch → 인용 트래픽 차단됨, **반드시 Allow**
  - **Claude-SearchBot** = 검색 품질 인덱스 → **반드시 Allow**

### ChatGPT Search는 Bing 인덱스 사용
- 사이트가 Bing에 인덱싱되지 않으면 ChatGPT Search 응답에서 **자동으로 제외**됨 (Google 랭킹과 무관).
- 따라서 Bingbot Allow + Bing Webmaster Tools 등록 = **GPT 인용을 위한 필수 조건**.

### 변경 반영 시간
- robots.txt 변경 → OpenAI 시스템 반영 약 **24시간**.

---

## 권장 robots.txt (마음토스 권장안)

**전략**: AI 검색·인용 트래픽 극대화 + training 데이터 통제는 신중하게 결정.
정신건강 콘텐츠는 학습 데이터로 쓰여도 인용 가치가 훨씬 큰 영역이므로 **전부 Allow** 추천.

```
# === AI Search & Retrieval (반드시 허용) ===
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

# === AI Training (선택 — 마음토스는 Allow 추천) ===
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

# === Optional Block (한국 사용자 기여 낮음) ===
# User-agent: Bytespider
# Disallow: /

# === Default ===
User-agent: *
Allow: /

Sitemap: https://mindthos.com/sitemap.xml
```

## 마음토스 점검 체크리스트

- [ ] `web/public/robots.txt` 현재 상태 확인 — 위 user-agent들 명시적으로 다루는지
- [ ] Claude-Web, anthropic-ai 같은 **deprecated** user-agent가 있다면 정리
- [ ] **Bing Webmaster Tools 등록 여부** 확인 (ChatGPT Search 인용을 위해 필수)
- [ ] sitemap.xml 경로 robots.txt에 명시
- [ ] 서버 레벨 차단(WAF, CloudFlare bot rules)이 위 봇 차단하고 있지 않은지 — robots.txt 무시하는 봇 대응 정책 점검

---

## 함정

- robots.txt는 **권고**일 뿐. 일부 봇 (특히 학습용)은 무시 가능. → 진짜 차단 원하면 WAF/IP 차단 필요.
- 그러나 **OAI-SearchBot / PerplexityBot / Claude-SearchBot은 robots.txt를 준수**. 잘못 차단되면 즉시 인용 풀에서 제외됨.
- "AI training 거부" 명분으로 모든 봇 차단 → **인용 트래픽 동반 손실**. 매우 흔한 자해 실수.
