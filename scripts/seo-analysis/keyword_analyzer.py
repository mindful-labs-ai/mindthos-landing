#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
keyword_analyzer.py — 한국어 키워드 밀도 및 분포 분석기

content.json 형식의 입력을 받아 키워드별 등장 빈도, 밀도,
위치(제목/첫 단락/H2/메타) 정보를 반환합니다.
"""

import re
import json
import sys
from typing import Any


def strip_markdown(text: str) -> str:
    """마크다운 문법 제거 후 순수 텍스트 반환."""
    # 코드 블록 제거
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]+`', '', text)
    # 헤딩 마크 제거
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # 링크 제거 ([text](url) → text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # 이미지 제거
    text = re.sub(r'!\[[^\]]*\]\([^\)]+\)', '', text)
    # 볼드/이탤릭 제거
    text = re.sub(r'\*{1,3}([^\*]+)\*{1,3}', r'\1', text)
    text = re.sub(r'_{1,3}([^_]+)_{1,3}', r'\1', text)
    # 테이블 행 구분자 제거
    text = re.sub(r'\|[-:\s|]+\|', '', text)
    text = re.sub(r'\|', ' ', text)
    # 인용 제거
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    # 리스트 마커 제거
    text = re.sub(r'^[\*\-\+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
    # 여러 공백/빈줄 정리
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_h2_headings(content: str) -> list[str]:
    """마크다운 본문에서 H2 헤딩 텍스트 목록 추출."""
    return re.findall(r'^##\s+(.+)$', content, flags=re.MULTILINE)


def get_first_paragraph(content: str) -> str:
    """마크다운 본문의 첫 번째 단락(첫 이중 줄바꿈 전) 반환."""
    plain = strip_markdown(content)
    paragraphs = [p.strip() for p in plain.split('\n\n') if p.strip()]
    return paragraphs[0] if paragraphs else ''


def analyze_keywords(data: dict[str, Any]) -> dict[str, Any]:
    """
    키워드 밀도 및 분포 분석.

    Args:
        data: content.json 형식의 딕셔너리

    Returns:
        {
            keyword_scores: [{keyword, count, density, in_title, in_first_para,
                              in_h2, in_meta_title, in_meta_description}],
            overall_density_score: 0-100,
            warnings: [str]
        }
    """
    content_obj = data.get('content', {})

    title: str = content_obj.get('title', '')
    raw_content: str = content_obj.get('content', '')
    meta_title: str = content_obj.get('meta_title', '')
    meta_description: str = content_obj.get('meta_description', '')
    keywords: list[str] = content_obj.get('keywords', [])

    plain_content = strip_markdown(raw_content)
    first_para = get_first_paragraph(raw_content)
    h2_headings = extract_h2_headings(raw_content)
    h2_text = ' '.join(h2_headings)

    # 전체 분석 대상 본문 길이 (마크다운 제거 후)
    total_chars = len(plain_content)

    keyword_scores = []
    warnings = []

    for kw in keywords:
        if not kw:
            continue

        count_in_content = plain_content.count(kw)
        count_in_title = title.count(kw)
        count_in_meta_title = meta_title.count(kw)
        count_in_meta_desc = meta_description.count(kw)

        # 밀도: 본문 내 등장 횟수 / 전체 문자 수 * 100
        density = (count_in_content / total_chars * 100) if total_chars > 0 else 0.0

        in_title = count_in_title > 0
        in_first_para = kw in first_para
        in_h2 = kw in h2_text
        in_meta_title = count_in_meta_title > 0
        in_meta_description = count_in_meta_desc > 0

        keyword_scores.append({
            'keyword': kw,
            'count': count_in_content,
            'density': round(density, 3),
            'in_title': in_title,
            'in_first_para': in_first_para,
            'in_h2': in_h2,
            'in_meta_title': in_meta_title,
            'in_meta_description': in_meta_description,
        })

        # 밀도 경고
        if density < 0.5:
            warnings.append(f"'{kw}' 키워드 밀도({density:.2f}%)가 낮습니다 (권장: 0.5%~3%).")
        elif density > 3.0:
            warnings.append(f"'{kw}' 키워드 밀도({density:.2f}%)가 높습니다 — 키워드 과다 사용 주의 (권장: 0.5%~3%).")

    # 전체 밀도 점수 계산 (0-100)
    # 기준: 각 키워드의 분포 점수(위치 점수) 평균
    if keyword_scores:
        position_scores = []
        for ks in keyword_scores:
            pos = 0
            if ks['in_title']:
                pos += 25
            if ks['in_first_para']:
                pos += 25
            if ks['in_h2']:
                pos += 25
            if ks['in_meta_title'] or ks['in_meta_description']:
                pos += 25
            position_scores.append(pos)

        # 밀도 범위 점수
        density_scores = []
        for ks in keyword_scores:
            d = ks['density']
            if 0.5 <= d <= 3.0:
                density_scores.append(100)
            elif d < 0.5:
                density_scores.append(max(0, int(d / 0.5 * 100)))
            else:
                # 3% 초과: 초과분에 따라 감점
                density_scores.append(max(0, int(100 - (d - 3.0) * 30)))

        avg_position = sum(position_scores) / len(position_scores)
        avg_density = sum(density_scores) / len(density_scores)
        overall_density_score = int(avg_position * 0.5 + avg_density * 0.5)
    else:
        overall_density_score = 0
        warnings.append("키워드가 지정되지 않았습니다.")

    return {
        'keyword_scores': keyword_scores,
        'overall_density_score': overall_density_score,
        'warnings': warnings,
    }


def main() -> None:
    """단독 실행 시 CLI 진입점."""
    import argparse

    parser = argparse.ArgumentParser(
        description='한국어 SEO 키워드 밀도 분석기',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python keyword_analyzer.py ../content.json
  python keyword_analyzer.py content.json --output result.json
        """,
    )
    parser.add_argument('input', nargs='?', default='../content.json',
                        help='분석할 content.json 파일 경로 (기본값: ../content.json)')
    parser.add_argument('--output', '-o', default=None,
                        help='결과를 저장할 JSON 파일 경로 (기본값: stdout)')
    args = parser.parse_args()

    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"오류: 파일을 찾을 수 없습니다 — {args.input}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"오류: JSON 파싱 실패 — {e}", file=sys.stderr)
        sys.exit(1)

    result = analyze_keywords(data)
    output_json = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_json)
        print(f"결과 저장 완료: {args.output}")
    else:
        print(output_json)


if __name__ == '__main__':
    main()
