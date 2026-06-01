#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
readability_scorer.py — 한국어 가독성 점수 산출기

한국어 문장 종결 패턴, 단락 길이, 헤딩 분포를 기반으로
콘텐츠 가독성 점수(0-100)를 계산합니다.
"""

import re
import json
import sys
from typing import Any


def strip_markdown(text: str) -> str:
    """마크다운 문법 제거 후 순수 텍스트 반환."""
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'!\[[^\]]*\]\([^\)]+\)', '', text)
    text = re.sub(r'\*{1,3}([^\*]+)\*{1,3}', r'\1', text)
    text = re.sub(r'_{1,3}([^_]+)_{1,3}', r'\1', text)
    text = re.sub(r'\|[-:\s|]+\|', '', text)
    text = re.sub(r'\|', ' ', text)
    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[\*\-\+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# 한국어 문장 종결 패턴
# 다/요/죠/까/군/네/지/야/아/어/워 + 문장 부호 조합
_SENTENCE_END_PATTERN = re.compile(
    r'[다요죠까군네지야아어워][.?!…]+|[.?!…]+',
)


def split_korean_sentences(text: str) -> list[str]:
    """
    한국어 문장 분리.
    종결 어미(다/요/죠/까 등) + 문장부호 또는 문장부호만으로 분리.
    """
    # 문장 종결 위치에 구분자 삽입
    marked = _SENTENCE_END_PATTERN.sub(lambda m: m.group() + '\n', text)
    sentences = [s.strip() for s in marked.split('\n') if s.strip()]
    return sentences


def count_h2(content: str) -> int:
    """마크다운 본문의 H2 헤딩 개수."""
    return len(re.findall(r'^##\s+.+$', content, flags=re.MULTILINE))


def score_readability(data: dict[str, Any]) -> dict[str, Any]:
    """
    한국어 가독성 점수 산출.

    Args:
        data: content.json 형식의 딕셔너리

    Returns:
        {
            avg_sentence_length: float,
            avg_paragraph_length: float,
            content_length: int,
            long_sentence_ratio: float,   # 80자 초과 문장 비율
            long_paragraph_ratio: float,  # 300자 초과 단락 비율
            h2_count: int,
            readability_score: int (0-100),
            warnings: [str]
        }
    """
    content_obj = data.get('content', {})
    raw_content: str = content_obj.get('content', '')

    plain = strip_markdown(raw_content)
    h2_count = count_h2(raw_content)

    # 단락 분리 (이중 줄바꿈 기준)
    paragraphs = [p.strip() for p in plain.split('\n\n') if p.strip()]
    para_lengths = [len(p) for p in paragraphs]
    avg_paragraph_length = (sum(para_lengths) / len(para_lengths)) if para_lengths else 0.0
    long_paragraph_count = sum(1 for l in para_lengths if l > 300)
    long_paragraph_ratio = (long_paragraph_count / len(para_lengths)) if para_lengths else 0.0

    # 문장 분리
    sentences = split_korean_sentences(plain)
    sent_lengths = [len(s) for s in sentences]
    avg_sentence_length = (sum(sent_lengths) / len(sent_lengths)) if sent_lengths else 0.0
    long_sentence_count = sum(1 for l in sent_lengths if l > 80)
    long_sentence_ratio = (long_sentence_count / len(sent_lengths)) if sent_lengths else 0.0

    # 전체 본문 길이 (마크다운 제거 후)
    content_length = len(plain)

    # 점수 산출: 100점에서 차감
    score = 100
    warnings: list[str] = []

    # 1. 긴 문장 비율 (>80자): 비율 * 30점 차감
    if long_sentence_ratio > 0.3:
        deduct = min(30, int(long_sentence_ratio * 30))
        score -= deduct
        warnings.append(
            f"긴 문장(80자 초과) 비율이 {long_sentence_ratio*100:.1f}%입니다 — "
            f"문장을 짧게 나눠 가독성을 높이세요."
        )

    # 2. 긴 단락 비율 (>300자): 비율 * 20점 차감
    if long_paragraph_ratio > 0.3:
        deduct = min(20, int(long_paragraph_ratio * 20))
        score -= deduct
        warnings.append(
            f"긴 단락(300자 초과) 비율이 {long_paragraph_ratio*100:.1f}%입니다 — "
            f"단락을 더 짧게 나눠 호흡을 조절하세요."
        )

    # 3. H2 개수 (5~8개 이상적)
    if h2_count < 3:
        score -= 15
        warnings.append(
            f"H2 헤딩이 {h2_count}개로 너무 적습니다 (권장: 5~8개) — "
            f"소제목을 추가하면 구조가 명확해집니다."
        )
    elif h2_count < 5:
        score -= 8
        warnings.append(f"H2 헤딩이 {h2_count}개입니다 (권장: 5~8개).")
    elif h2_count > 10:
        score -= 10
        warnings.append(
            f"H2 헤딩이 {h2_count}개로 너무 많습니다 (권장: 5~8개) — "
            f"소제목을 통합해 구조를 단순화하세요."
        )

    # 4. 본문 길이
    if content_length < 1500:
        score -= 20
        warnings.append(
            f"본문 길이가 {content_length}자로 너무 짧습니다 (권장: 1,500자 이상) — "
            f"내용을 보강해 검색엔진 신뢰도를 높이세요."
        )
    elif content_length > 6000:
        score -= 10
        warnings.append(
            f"본문 길이가 {content_length}자로 매우 깁니다 (권장: 5,000자 이하) — "
            f"불필요한 내용을 정리하거나 글을 분리하는 것을 고려하세요."
        )

    score = max(0, score)

    return {
        'avg_sentence_length': round(avg_sentence_length, 1),
        'avg_paragraph_length': round(avg_paragraph_length, 1),
        'content_length': content_length,
        'long_sentence_ratio': round(long_sentence_ratio, 3),
        'long_paragraph_ratio': round(long_paragraph_ratio, 3),
        'h2_count': h2_count,
        'readability_score': score,
        'warnings': warnings,
    }


def main() -> None:
    """단독 실행 시 CLI 진입점."""
    import argparse

    parser = argparse.ArgumentParser(
        description='한국어 SEO 가독성 점수 산출기',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python readability_scorer.py ../content.json
  python readability_scorer.py content.json --output result.json
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

    result = score_readability(data)
    output_json = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_json)
        print(f"결과 저장 완료: {args.output}")
    else:
        print(output_json)


if __name__ == '__main__':
    main()
