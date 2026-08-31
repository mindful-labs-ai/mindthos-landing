import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 센터 도입 소개서 덱 서빙 — /center/v1 · /center/v2 · /center/v3
 *
 * 소스: content/center/{v1,v2,v3}.html — 마케팅 레포에서 빌드된 완전 자립형
 * 단일 HTML(폰트·이미지 인라인, 자체 리사이즈 스크립트 포함). 오퍼가 바뀌면
 * 같은 경로에 파일만 덮어쓰고 재배포하면 된다.
 *
 * 덱 마크업·스타일은 절대 수정하지 않는다. 유일한 가공은 </head> 직전
 * 주입 한 번: robots noindex(콜드메일 전용 — 검색 유입·A/B 오염 방지),
 * OG 타이틀(세 버전 동일 — 링크에서 버전이 드러나지 않게), GA4 스니펫
 * (기존 랜딩과 같은 속성) + center_view 이벤트(version, 쿼리 `r`).
 */

export const dynamic = 'force-static';
export const dynamicParams = false;

const VERSIONS = ['v1', 'v2', 'v3'] as const;

export function generateStaticParams() {
  return VERSIONS.map((version) => ({ version }));
}

const buildHeadSnippet = (version: string): string => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-Z3DT8LX40Y';
  /* consent default 는 루트 layout.tsx 의 Consent Mode v2(A안: 전부 granted)와
     동일하게 config 이전에 선언. gtag 호출은 gtag.js 로드 전에도 dataLayer 에
     큐잉되므로 async 로더를 뒤에 둬도 안전하다. `r`(수신자 ID)은 이벤트
     파라미터로만 보내고 화면에는 노출하지 않는다. */
  return `<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="마음토스 센터 도입 안내">
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
});
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: true });
gtag('event', 'center_view', {
  version: '${version}',
  r: new URLSearchParams(location.search).get('r') || '',
});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>`;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ version: string }> }
) {
  const { version } = await params;
  const filePath = path.join(process.cwd(), 'content', 'center', `${version}.html`);
  const deck = await readFile(filePath, 'utf8');
  const html = deck.replace('</head>', `${buildHeadSnippet(version)}\n</head>`);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
